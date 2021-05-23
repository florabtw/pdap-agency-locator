const Knex = require("knex");
const Agencies = require("./agencies");
const Geonames = require("./geonames");
const Match = require("./match");

const [_cmd, _file, REGION] = process.argv;

if (!REGION) {
  console.log(
    "Please provide a region (e.g. west) or state (e.g. CA) in process arguments."
  );
  process.exit();
}

const main = async () => {
  const { updated, total } = await Match.region(REGION);

  console.log("---");
  console.log(`Updated ${updated} rows out of ${total} agencies queried.`);

  await Agencies.destroy();
  await Geonames.destroy();

  process.exit();
};

main();
