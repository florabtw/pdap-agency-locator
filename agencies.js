const Knex = require("knex");

const Agencies = (() => {
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

module.exports = Agencies;
