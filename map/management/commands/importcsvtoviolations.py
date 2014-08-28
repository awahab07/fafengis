from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos.geometry import Point
from django.db import models
from map.models import Tehsil, Constituency, Location, Violation
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import sys, os, csv
from optparse import make_option
from datetime import datetime
from pytz import timezone

class Command(BaseCommand):
    """
     This command will be used to import old violation incidents from electionpakistan.org to Violation model
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
                    created_violations = 0
                    csv_row_count = 2 # As 1 row will be consumed for headers
                    while True:
                        try:
                            csv_row = csv_reader.next()
                        except StopIteration:
                            self.stdout.write("\n Iterations Completed, %s Rows Traversed, %s Violation(s) Created" % (csv_row_count, created_violations))
                            
                            #Writing Errors if second argument to log csv is provided
                            if(len(erroneous_rows) and log_csv):
                                self.stdout.write("Logging errors in %s" % log_csv)
                                try:
                                    with open(log_csv, 'wb') as f:
                                        csv_writer = csv.DictWriter(f, ["Time", "Violation Category", "Comments", "Latitude", "Longitude", "Location", "Location ID", "Constituency", "Constituency ID", "Tehsil", "Tehsil ID", "District", "District ID", "Province", "Province ID", "CSV Row Number", "error_type", "error_detail"])

                                        csv_writer.writeheader();
                                        csv_writer.writerows(erroneous_rows)
                                except IOError as e:
                                    self.stderr.write("Logging Error: %s" % e.strerror)
                            sys.exit()
                            
                        try:
                            location = Location.objects.get(legacy_id=csv_row['Location ID'])
                            constituency = Constituency.objects.get(pk=csv_row['Constituency ID'])
                            date_time = datetime.strptime(csv_row['Time'], "%d/%m/%Y %H:%M")
                            date_time = timezone('Asia/Karachi').localize(date_time)
                            
                            try:
                                csv_row['Comments'] = unicode(csv_row['Comments'], errors='replace')
                                violation = Violation.objects.get(date_time=date_time, location=location, constituency=constituency, comments=csv_row['Comments'])
                                self.stdout.write( "Parsing Row %s, Duplication Error: Violation: %s, Location: %s, Constituency %s, Row %s" % (csv_row_count, violation.comments +"("+ violation.category +")", location.name, location.tehsil.name, constituency.name) )
                            except Violation.DoesNotExist as e:
                                violation = Violation()
                                violation.date_time = date_time
                                violation.category = csv_row['Violation Category']
                                violation.comments = csv_row['Comments']
                                violation.location = location
                                violation.constituency = constituency
                                
                                violation.save()
                                created_violations += 1
                                self.stdout.write( "Parsing Row %s, Violation Created(%s): %s, Location: %s, Constituency %s" % (csv_row_count, created_violations, violation.category, location.name, constituency.name) )
                        
                        except Location.DoesNotExist as e:
                            self.stderr.write("Parsing Row %s, Operation Error: ObjectDoesNotExist of Location=%s, Location ID=%s" % (csv_row_count, csv_row['Location'], csv_row['Location ID']))
                            csv_row['CSV Row Number'] = csv_row_count
                            csv_row['error_type'] = 'Location Not Found'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                        except Constituency.DoesNotExist as e:
                            self.stderr.write("Parsing Row %s, Operation Error: ObjectDoesNotExist of Constitueny ID %s" % (csv_row_count, csv_row['Constituency ID']))
                            csv_row['CSV Row Number'] = csv_row_count
                            csv_row['error_type'] = 'Constituency Not Found'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                        except MultipleObjectsReturned as e:
                            self.stderr.write("Parsing Row %s, Duplication Error: Multiple Objects Returned for Category %s, Location %s, Constituency %s" % (csv_row_count, csv_row['Category'], location.name, constituency.id))
                            csv_row['CSV Row Number'] = csv_row_count
                            csv_row['error_type'] = 'Duplication'
                            csv_row['error_detail'] = e.message
                            erroneous_rows.append(csv_row)
                            
                        csv_row_count += 1
                    
                    
            else:
                self.stderr.write("Error: Provided CSV Does Not Exists.")