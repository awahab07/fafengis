from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos.geometry import Point
from django.db import models
from map.models import Tehsil, Constituency, Location
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import sys, os, csv
from optparse import make_option

class Command(BaseCommand):
    """
     This command will be used to import Locations from CSV to map.models.Location
     Expected CSV format:   id|location|tehsil|district|lat|lng
     This script will determine Tehsil reference querying map.models.Tehsil using tehsil column(name of tehsil) of csv
     Reference for Constituency is determined using __contains GeoDjango method
    """
    args = '<csv_file ...>'
    help = 'Run command providing CSV location'
    
    def handle(self, *args, **options):
        if len(args) < 1:
            self.stderr.write("Error: CSV file not provided. Please provide csv file location.")
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
                
            if os.path.exists(csv_file):
                erroneous_rows = list() # Needed to log errors in log csv if name provided as second argument
                with open(csv_file, 'rb') as f:
                    csv_reader = csv.DictReader(f)
                    created_locations = 0
                    csv_row_count = 1
                    while True:
                        try:
                            csv_row = csv_reader.next()
                        except StopIteration:
                            self.stdout.write("\n Iterations Completed, %s Rows Traversed, %s Location(s) Created" % (csv_row_count, created_locations))
                            
                            #Writing Errors if second argument to log csv is provided
                            if(len(erroneous_rows) and log_csv):
                                self.stdout.write("Logging errors in %s" % log_csv)
                                try:
                                    with open(log_csv, 'wb') as f:
                                        csv_writer = csv.DictWriter(f, ["id", "location", "tehsil", "district", "lat", "lng", "error_type", "error_detail"])
                                        csv_writer.writeheader();
                                        csv_writer.writerows(erroneous_rows)
                                except IOError as e:
                                    self.stderr.write("Logging Error: %s" % e.strerror)
                            sys.exit()
                            
                        try:
                            tehsil = Tehsil.objects.get(name=csv_row['tehsil'], district__name=csv_row['district'])
                            location_point = Point(float(csv_row['lng']), float(csv_row['lat']), srid=4326)
                            constituency = Constituency.objects.get(geom__contains=location_point)
                            
                            try:
                                location = Location.objects.get(name=csv_row['location'], tehsil=tehsil, constituency=constituency)
                                self.stdout.write( "Duplication Error: Location: %s, Tehsil: %s, Constituency %s, Row %s" % (location.name, location.tehsil.name, location.constituency.name, csv_row_count) )
                            except Location.DoesNotExist as e:
                                location = Location()
                                location.name = csv_row['location']
                                location.tehsil = tehsil;
                                location.constituency = constituency
                                location.legacy_id = csv_row['id']
                                location.geom = location_point
                                
                                location.save()
                                created_locations += 1
                                self.stdout.write( "Location Created(%s): %s, Tehsil: %s, Constituency %s, Row %s" % (created_locations, location.name, location.tehsil.name, location.constituency.name, csv_row_count) )
                        
                        except Tehsil.DoesNotExist as e:
                            self.stderr.write("Operation Error: ObjectDoesNotExist of Tehsil=%s, District=%s Row=%s." % (csv_row['tehsil'], csv_row['district'], csv_row_count))
                            csv_row['error_type'] = 'Tehsil Not Found'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                        except Constituency.DoesNotExist as e:
                            self.stderr.write("Operation Error: ObjectDoesNotExist of Constitueny Containing lat=%s, lng=%s, Row=%s" % (csv_row['lat'], csv_row['lng'], csv_row_count))
                            csv_row['error_type'] = 'Constituency Not Found'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                        except MultipleObjectsReturned as e:
                            self.stderr.write("Duplication Error: Multiple Objects Returned for Location %s, Location ID %s, Row %s" % (location.name, location.id, csv_row_count))
                            csv_row['error_type'] = 'Duplication'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                            
                        csv_row_count += 1
                    
                    
            else:
                self.stderr.write("Error: Provided CSV Does Not Exists.")