import csv
import json

json_data = {"nodes":[], "links":{}}
for y in range(1816, 2013):
    json_data["links"][y] = []

country_codes = {}

with open('country_code_data/states2011.csv', 'rU') as csvfile:
    reader = csv.reader(csvfile, dialect=csv.excel_tab)
    for row in reader:
        r = row[0].split(',')
        country_codes[r[2]] = r[1]
print "country codes done"

with open('countries.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    counter = 1
    for row in reader:
        if row[2] in country_codes:
            json_data["nodes"].append({"id": country_codes[row[2]], "country": row[2], "latitude": row[0], "longitude": row[1]})
print "nodes done"

with open('alliance_data/alliance_v4.1_by_dyad_yearly.csv') as csvfile:
    reader = csv.reader(csvfile)
    title = False
    for row in reader:
        if not title:
            title = True
        else:
            print row[1], row[3]
            print row[17]
            # israel's data is formatted wierdly
            if int(row[17]) == 0:
                json_data["links"][int(row[7])].append({
                "source": row[1],
                "target": row[3],
                "alliance_type": row[13:17]
                })
            else:
                json_data["links"][int(row[17])].append({
                    "source": row[1],
                    "target": row[3],
                    "alliance_type": row[13:17]
                })
print "links done"

# print country_codes
print "NODES"
print json_data["nodes"]
print "LINKS"
print json_data["links"]

with open('alliances.json', 'w') as outfile:
    json.dump(json_data, outfile)



