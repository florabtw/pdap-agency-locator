const Knex = require("knex");

const [_cmd, _file, STATE_CODE] = process.argv;

if (!STATE_CODE) {
  console.log("Please provide a state code (e.g. CA) in process arguments.");
  process.exit();
}

const agencies = (() => {
  // e.g. { "AL": "01", "AK": "02", ... }
  const state_fips_map = require("./state_fips.json");

  // connection to local pdap dolthub sql-server
  // https://www.dolthub.com/repositories/pdap/datasets
  const knex = Knex({
    client: "mysql2",
    connection: {
      host: "127.0.0.1",
      user: "root",
      database: "datasets",
    },
  });

  const list = ({ state_iso }) =>
    knex.select("name", "state_iso").from("agencies").where({ state_iso });

  const patch = ({ name, admin1_code, admin2_code, latitude, longitude }) =>
    knex("agencies")
      .update({
        county_fips: state_fips_map[admin1_code] + admin2_code,
        lat: latitude,
        lng: longitude,
      })
      .where({ name, state_iso: admin1_code });

  return { destroy: () => knex.destroy(), list, patch };
})();

const geonames = (() => {
  const knex = Knex({
    client: "sqlite3",
    connection: {
      filename: "./geonames/US.sqlite",
    },
    useNullAsDefault: true,
  });

  const search = ({ name, state_iso }) =>
    knex
      .select("name", "admin1_code", "admin2_code", "latitude", "longitude")
      .from("geonames")
      .where({ name, admin1_code: state_iso });

  return { destroy: () => knex.destroy(), search };
})();

const main = async () => {
  console.log("Querying agencies...");

  const agenciesInState = await agencies.list({ state_iso: STATE_CODE });

  console.log(
    `Found ${agenciesInState.length} agencies in state: ${STATE_CODE}`
  );
  console.log("Searching for matches in geonames data...");

  let i = 0;
  let matchCount = 0;
  for (const { name, state_iso } of agenciesInState) {
    const result = await geonames.search({ name, state_iso });

    if (result.length == 0) continue;

    if (result.length > 1) {
      console.log(`Warning: Found multiple matches for ${name}.`);
      continue;
    }

    console.log("Found match for ", name);
    matchCount++;

    await agencies.patch(result[0]);
  }

  console.log(
    "Rows updated: ",
    matchCount,
    "out of total",
    agenciesInState.length
  );

  await agencies.destroy();
  await geonames.destroy();

  process.exit();
};

main();
