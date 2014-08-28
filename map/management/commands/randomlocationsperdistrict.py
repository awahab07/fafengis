from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos.geometry import Point
from django.db import models
from map.models import Tehsil, District, Location
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import sys, os, csv
from optparse import make_option

class Command(BaseCommand):
    """
     This command will be used to export comma separated randomly selected location ids per district
     Expected CSV format:   id|location|tehsil|district|lat|lng
    """
    args = '<csv_file ...>'
    help = 'Run command providing Output TextFile location'
    
    def handle(self, *args, **options):
        if len(args) < 1:
            self.stderr.write("Error: Output file not provided. Please provide output text file location.")
        else:
            csv_file = args[0]
            random_district_locations = list()
            for district in District.objects.all():
                #self.stdout.write("\nTraversing District %s" % district.name)
                try:
                    locs = Location.objects.get(tehsil__district=district)
                    random_locs = locs.order_by('?')[:15]
                    for ran_loc in random_locs:
                        self.stdout.write(ran_loc)
                        random_district_locations.append(ran_loc.legacy_id)
                except Location.DoesNotExist:
                    self.stderr.write("\t\tDistrict %s dosen't have locations matched." % district.name)
                except MultipleObjectsReturned as m:
                    pass
            self.stdout.write("\n\n%s Locations Captured" % len(random_district_locations))
                
            try:
                with open(csv_file, 'wb') as f:
                    self.stdout.write("Writing IDs to File")
                    f.write(", ".join(random_district_locations))
                    f.close()
            except Exception as e:
                self.stderr.write("Input Error: Provided (%s) Output File is not writable" % csv_file)
                sys.exit()