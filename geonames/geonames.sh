#!/bin/bash

# Downloads geonames data for US, and converts it into a sqlite database.
# After importing, the db is located at geonames/US.sqlite.
# US.sqlite is used in main index.js to find geo data for police departments.
#
# Specs:
#   - Time: <5 minutes on a low end server (e.g. 2vcpu, 4gb memory)
#   - Space: ~700MB temporary, ~300MB final
#
# Usage:
#   $ yarn geonames update
#
# Tip: when run consecutively, the table is dropped and recreated from scratch

set -e

# Functions

clean () {
  rm geonames/{US.zip,US.txt,admin2_codes.txt}
}

convert () {
  node geonames/convertToSqlite.js
}

download () {
  pushd geonames
  curl -o US.zip          https://download.geonames.org/export/dump/US.zip
  curl -o admin2_codes.txt https://download.geonames.org/export/dump/admin2Codes.txt
  unzip US.zip US.txt
  popd
}

# Begin Script

COMMAND=${1}
shift

case "$COMMAND" in
  clean) clean;;
  convert) convert;;
  download) download;;
  update)
    download
    convert
    clean
    ;;
esac
