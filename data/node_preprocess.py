import csv
import json

json_data = {"nodes":[]}
country_codes = {}

with open('country_code_data/states2011.csv', 'rU') as csvfile:
    reader = csv.reader(csvfile, dialect=csv.excel_tab)
    for row in reader:
        r = row[0].split(',')
        country_codes[r[2]] = r[1]

with open('countries.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    counter = 1
    for row in reader:
        if row[3] in country_codes:
            print "found code"
            json_data["nodes"].append({"id": country_codes[row[3]], "country": row[3], "latitude": row[1], "longitude": row[2], "country_code": row[0]})

print country_codes
print json_data

with open('alliances.json', 'w') as outfile:
    json.dump(json_data, outfile)



