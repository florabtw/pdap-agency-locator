const Agencies = require("./agencies");
const Geonames = require("./geonames");

const Match = (() => {
  const state = async ({ state_iso }) => {
    console.log(`Querying agencies for state ${state_iso}...`);

    const agenciesInState = await Agencies.list({ state_iso });

    console.log(
      `Found ${agenciesInState.length} agencies in state: ${state_iso}`
    );
    console.log("Searching for matches in geonames data...");

    let i = 0;
    let updated = 0;
    for (const { name, state_iso } of agenciesInState) {
      const result = await Geonames.search({ name, state_iso });

      if (result.length == 0) continue;

      if (result.length > 1) {
        console.log(`Warning: Found multiple matches for ${name}.`);
        continue;
      }

      console.log("Found match for ", name);
      updated++;

      await Agencies.patch(result[0]);
    }

    return { updated, total: agenciesInState.length };
  };

  // prettier-ignore
  const regionMap = {
    midwest:   "IL,IN,IA,KS,MI,MN,MO,NE,ND,OH,SD,WI".split(","),
    northeast: "CT,ME,MA,NH,NJ,NY,PA,RI,VT".split(","),
    south:     "AL,AR,DE,FL,GA,KY,LA,MD,MS,NC,OK,SC,TN,TX,VA,WV".split(","),
    west:      "AK,AZ,CA,CO,HI,ID,MT,NV,NM,OR,UT,WA,WY".split(","),
  };

  const region = async (region) => {
    // accept region (e.g. west) or state (e.g. CA)
    const states = regionMap[region] || [region];

    let results = [];
    for (state_iso of states) {
      let result = await Match.state({ state_iso });
      results.push(result);
    }

    const updated = results.reduce((n, { updated }) => n + updated, 0);
    const total = results.reduce((n, { total }) => n + total, 0);

    return { updated, total };
  };

  return { region, state };
})();

module.exports = Match;
