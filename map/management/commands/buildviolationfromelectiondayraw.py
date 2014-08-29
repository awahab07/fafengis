"""
This script file will be used to create violations for Violation model from ElectionDayRawIncident
Duplicate check should be incorporated by te script
Electionday incidents without location shoudl be alotted approximate location with indication

"""
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
     This command will be used to build Violation instances traversing ElectionDayRawIncident records
     ElectionDayRawIncident records are build from reading data returned from url electionpakistan.org/map/electionday_raw_incidents
     Electionday incidents with missing locaitons will be allotted approximate location from their respective constituency and district
     Incidents without that fail to have thier district or constituency located, will not be considered
    """
    args = '<log_csv_file ...>'
    help = 'Run command providing an optional log CSV file name'
    
    def handle(self, *args, **options):
        if(len(args) > 0):
            log_csv = args[1]
            try:
                with open(log_csv, 'wb') as f:
                    pass
            except Exception as e:
                self.stderr.write("Input Error: Provided (%s) Log CSV is not writable" % log_csv)
                sys.exit()
        
        self.stdout.write("Traversing ElectionDayRawIncidents")
        
        electionday_incidensts = ElectionDayRawIncident.objects.all()
        if(len(electionday_incidensts) > 0)
        	self.stdout.write("%s incidents found in database" % len(electionday_incidensts))
        else
        	self.stdout.write("No incidents found in database")
        	sys.exit()
        
        created_violations = 0
        for record in electionday_incidensts:
        	# incidents with valid location present
        	if(float(record.lat) and float(record.lng) and record.location_text)
        		# Verify if lagacy_id matches with a location record in database, create location instance if not present
		        try:
                    location = Location.objects.get(name=record.location_text)
                    constituency = Constituency.objects.get(pk=csv_row['Constituency ID'])
                    date_time = datetime.strptime(csv_row['Time'], "%d/%m/%Y %H:%M")
                    date_time = timezone('Asia/Karachi').localize(date_time)
                    
                except Location.DoesNotExist as e:
                	# location doesn't exists so create new locaiton instance and determine administrative boundary object geographicaly
                	try
	                    self.stdout.write("Location %s not present in database, creating location object")
	                    location_point = Point(float(record.lng), float(record.lng), srid=4326)
	                    location_tehsil = Tehsil.objects.get(geom__contains=location_point)
	                    locaiton_constituency = Constituency.objects.get(geom__contains=location_point)
	                except Tehsil.DoesNotExist as e:
	                	sys.stderr.write("Couldn't find Tehsil for location %s" % record.location_text);
	                except Constituency.DoesNotExist as e:
                    	sys.stderr.write("Couldn't find Constituency for location %s" % record.location_text);
                
                except MultipleObjectsReturned as e:
                    sys.stderr.write("Duplicate location of legacy_id = %s" % record.location_text);

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
            created_violations += 1
            
        self.stdout.write("\nTotal %s incidents created" % created_violations)
        
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