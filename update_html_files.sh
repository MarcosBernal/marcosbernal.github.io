#!/bin/bash

set -e

OWN_PATH=$(dirname $(realpath ${BASH_SOURCE[0]}))  # https://www.systutorials.com/how-to-get-bash-scripts-own-path/

${OWN_PATH}/dislines.pl ${OWN_PATH}/index.MULTILINGUAL.html --out=${OWN_PATH}/index.html
mv ${OWN_PATH}/index.en.html ${OWN_PATH}/index.html

for file in $(ls ${OWN_PATH}/additional_content/*MULTILINGUAL*); do
  ${OWN_PATH}/dislines.pl ${file} --out=${file/MULTILINGUAL./}
  mv ${file/MULTILINGUAL/en} ${file/MULTILINGUAL./}  # Remove tag from english version
done

echo "All html files were successfully updated"
