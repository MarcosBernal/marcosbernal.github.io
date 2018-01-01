#! /bin/bash

# Moving to the folder path
cd $(pwd)/$(dirname $0)

if [ ! -f dislines.pl ]; then
echo 'There is no file dislines.pl. Text can not be split. Download the file first'
exit 1
fi

if [ ! -x "$(command -v perl)" ]; then
echo "No perl installed. Install perl to separate the text."
exit 1
fi

echo "Everything is ready. Starting..."

./dislines.pl index.MULTILINGUAL.html

echo " -> Renaming index"
mv index.MULTILINGUAL.en.html index.html
mv index.MULTILINGUAL.es.html index.es.html

echo " -> Processing additional_content"
cd additional_content
find *MULTILINGUAL.html | xargs -n 1 ../dislines.pl

echo " -> Renaming additial_content"
for file in *MULTILINGUAL.en.html; do mv "$file" "${file%.MULTILINGUAL.en.html}.html"; done
for file in *MULTILINGUAL.es.html; do mv "$file" "${file%.MULTILINGUAL.es.html}.es.html"; done


echo "Finished creation and rename of files"
