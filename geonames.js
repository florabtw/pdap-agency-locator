const Knex = require("knex");

const Geonames = (() => {
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

module.exports = Geonames;
