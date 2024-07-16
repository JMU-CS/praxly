#!/bin/bash

for csv_name in *.csv; do
    for html_name in embed.html main.html; do
        echo "----------------------------------------"
        python3 run_csv.py $csv_name $html_name
    done
done
