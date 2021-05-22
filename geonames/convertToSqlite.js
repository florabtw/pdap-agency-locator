const Knex = require("knex");
const fs = require("fs");
const readline = require("readline");

const knex = Knex({
  client: "sqlite3",
  connection: {
    filename: "./geonames/US.sqlite",
  },
  useNullAsDefault: true,
});

const admin2_codes = (() => {
  // prettier-ignore
  const toRow = (line) => ({
    code:      line[0],
    name:      line[1],
    asciiname: line[2],
    geonameid: line[3],
  });

  const createTable = async () => {
    console.log("Creating admin2_codes table...");

    await knex.schema.dropTableIfExists("admin2_codes");

    await knex.schema.createTable("admin2_codes", (table) => {
      table.string("code").primary();
      table.string("name");
      table.string("asciiname");
      table.integer("geonameid");
    });
  };

  const ingest = async () => {
    console.log("Inserting rows into admin2_codes...");

    const reader = readline.createInterface({
      input: fs.createReadStream("./geonames/admin2_codes.txt"),
    });

    const batch_size = 500; // sqlite limit
    let counter = 0;
    let rows = [];
    for await (const line of reader) {
      if (!line.startsWith("US")) continue; // ignore non-US codes

      const row = toRow(line.split("\t"));
      rows.push(row);
      counter += 1;

      if (rows.length < batch_size) continue;

      console.log("Processed row ", counter);

      await knex.batchInsert("admin2_codes", rows, batch_size);

      rows = [];
    }

    if (rows.length > 0)
      await knex.batchInsert("admin2_codes", rows, rows.length);

    await reader.close();
  };

  const update = () => createTable().then(ingest);

  return { update };
})();

const geonames = (() => {
  // prettier-ignore
  const toRow = (line) => ({
    geonameid:         line[0],
    name:              line[1],
    asciiname:         line[2],
    alternatenames:    line[3],
    latitude:          line[4],
    longitude:         line[5],
    feature_class:     line[6],
    feature_code:      line[7],
    country_code:      line[8],
    cc2:               line[9],
    admin1_code:       line[10],
    admin2_code:       line[11],
    admin3_code:       line[12],
    admin4_code:       line[13],
    population:        line[14],
    elevation:         line[15],
    dem:               line[16],
    timezone:          line[17],
    modification_date: line[18],
  });

  const createTable = async () => {
    console.log("Creating geonames table...");

    await knex.schema.dropTableIfExists("geonames");

    await knex.schema.createTable("geonames", (table) => {
      table.integer("geonameid").primary();
      table.string("name");
      table.string("asciiname");
      table.string("alternatenames");
      table.float("latitude");
      table.float("longitude");
      table.string("feature_class");
      table.string("feature_code");
      table.string("country_code");
      table.string("cc2");
      table.string("admin1_code");
      table.string("admin2_code");
      table.string("admin3_code");
      table.string("admin4_code");
      table.integer("population");
      table.integer("elevation");
      table.integer("dem");
      table.string("timezone");
      table.date("modification_date");

      table.index(['name', 'admin1_code']);
    });
  };

  const ingest = async () => {
    console.log("Inserting rows into geonames...");

    const reader = readline.createInterface({
      input: fs.createReadStream("./geonames/US.txt"),
    });

    const batch_size = 500; // sqlite limit
    let counter = 0;
    let rows = [];
    for await (const line of reader) {
      const row = toRow(line.split("\t"));
      rows.push(row);
      counter += 1;

      if (rows.length < batch_size) continue;

      console.log("Processed row ", counter);

      await knex.batchInsert("geonames", rows, batch_size);

      rows = [];
    }

    if (rows.length > 0) await knex.batchInsert("geonames", rows, rows.length);

    await reader.close();
  };

  const update = () => createTable().then(ingest);

  return { update };
})();

const convertToSqlite = async () => {
  await admin2_codes.update();
  await geonames.update();

  await knex.destroy();
  process.exit();
};

convertToSqlite();
