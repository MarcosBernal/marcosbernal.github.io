#! /bin/bash
if [ ! -f dislines.pl ]; then
echo 'There is no file dislines.pl. Text can not be split. Download the file first'
exit 1
fi

if [ ! -x "$(command -v perl)" ]; then
echo "No perl installed. Install perl to separate the text."
exit 1
fi

echo "Everything is ready. Starting..."
cd $(pwd)/$(dirname $0)

./dislines.pl index.MULTILINGUAL.html

echo "Renaming files"
mv index.MULTILINGUAL.en.html index.html
mv index.MULTILINGUAL.es.html index.es.html

echo "Finished creation and rename of files"
