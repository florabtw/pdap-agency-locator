PDAP Agency Locator
---

This repository is the first attempt at getting metadata:

* city
* zip
* county_fips
* latitude
* longitude

for police agencies in the PDAP `datasets`
[database](https://www.dolthub.com/repositories/pdap/datasets).

Currently, using [geonames](http://www.geonames.org/) data, but hopefully
expanding into OpenStreetMaps or Google Maps data if we can afford it in the
future.

## Usage

### Step 0: Node, npm, yarn

If you don't have node on your computer, I recommend installing
[nvm](https://github.com/nvm-sh/nvm).

Once you have node installed, you need to install
[yarn](https://yarnpkg.com/).

Then you can run the following command to install dependencies from package root:

```
$ yarn
```

### Step 1: Import from Geonames

We first need to pull data from Geonames and convert it into a sqlite database.

```
$ yarn geonames update
```

This might take a couple minutes. There are a little over 2 million rows as of
writing this. After completion, you should have a sqlite db at
`geonames/US.sqlite`.

### Step 2: Run PDAP datasets server locally

Instructions here: https://docs.dolthub.com/interfaces/cli#dolt-sql-server

Dolthub database here: https://www.dolthub.com/repositories/pdap/datasets

### Step 3: Match Agencies to Geonames

Once you have the local database running, and geonames sqlite db file, we can
run our `index.js` file which will match agencies to geonames, *one state at a
time*:

```
$ yarn match CA # or whichever state you want to use, e.g. AL, AK, ...
```

All done! This will update your database. All you need to do is commit to
dolthub, and repeat for each state you want to update.
