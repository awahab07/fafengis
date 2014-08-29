from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos.geometry import Point
from django.db import models
from map.models import Tehsil, Constituency, Location, Violation, ElectionDayRawIncident
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import sys, os, csv
from optparse import make_option
from datetime import datetime
from pytz import timezone
import requests

class Command(BaseCommand):
    """
     This command will be used to import election day incidents (GE 2013) from electionpakistan.org/map/get_electionday_incidents
     and will store them in ElectionDayRawIncident
     It may be required to Empty / Truncate election_day_raw_insidents table before running the script
    """
    args = '<csv_file ...>'
    help = 'Run command providing import url and optional log CSV file name'
    
    def handle(self, *args, **options):
        if len(args) < 1:
            self.stderr.write("Error: URL not provided, please provide url to import election day incidents.")
        else:
            csv_file = args[0]
            log_csv = False
            if(len(args) > 1):
                log_csv = args[1]
                try:
                    with open(log_csv, 'wb') as f:
                        pass
                except Exception as e:
                    self.stderr.write("Input Error: Provided (%s) Log CSV is not writable" % log_csv)
                    sys.exit()
            self.stdout.write("Reading URL %s..." % args[0])
            response = requests.get(args[0])
            json_data = response.json()
            self.stdout.write("%s JSON elements retrieved" % len(json_data))
            
            created_incidents = 0
            for record in json_data:
                incident = ElectionDayRawIncident()
                incident.incident_id = record['id'].strip()
                incident.date_time = timezone('Asia/Karachi').localize(datetime.strptime(record['time_stamp'].strip(), "%b %d, %Y %I:%M %p"))
                incident.comments = record['comments'].strip()
                incident.category_text = record['category'].strip()
                incident.location_text = record['location'].strip() if record['location'] else ""
                try:
                    incident.lat = float(record['lat'].strip()) if record['lat'] else 0
                except ValueError:
                    pass
                try:
                    incident.lng = float(record['lng'].strip()) if record['lng'] else 0
                except ValueError:
                    pass
                incident.constituency_id = record['constituency_id'].strip()
                incident.district = record['district'].strip() if record['district'] else ""
                incident.province = record['province'].strip() if record['province'] else ""
                
                incident.save()
                self.stdout.write("Incident Created: %s... [%s]" % (incident.comments[:80], incident.category_text))
                created_incidents += 1
                
            self.stdout.write("\nTotal %s incidents created" % created_incidents)
            
            #Writing Errors if second argument to log csv is provided
            if(len(json_data) and log_csv):
                self.stdout.write("\nLogging incidents in %s ..." % log_csv)
                try:
                    with open(log_csv, 'wb') as f:
                        f.write(u'\ufeff'.encode('utf8')) # BOM (optional...Excel needs it to open UTF-8 file properly)
                        csv_writer = csv.DictWriter(f, ["id", "date", "time", "comments", "category", "location", "lat", "lng", "constituency_id", "constituency", "district", "district_id", "province", "province_id", "time_stamp"])

                        csv_writer.writeheader();
                        for record in json_data:
                            csv_writer.writerow({ (k):(v.encode('utf8') if v is not None else v) for k,v in record.items() })

                except IOError as e:
                    self.stderr.write("Logging Error: %s" % e.strerror)
                self.stdout.write("Raw Incident Details Successfully logged in %s" % log_csv)
            sys.exit()