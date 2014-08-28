from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos.geometry import Point
from django.db import models
from map.models import Tehsil, Constituency, Location, Violation, ViolationCategory
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
import sys, os

class Command(BaseCommand):
    """
     This command will be used to traverse all violation records and insert uniquely found category into ViolationCategory
     and update its id back to category_id in Violation
     Since category_id cannot be created if it Referes to a Non Existence Primary Key, category_id_int (Not an index) is
     used so it must be manually added before running the script and be resolved to catetgory_id ForeignKey Referring
     ViolationCategory.id
    """
    args = ''
    help = 'Run command'
    
    def handle(self, *args, **options):
        created_categories = 0
        updated_violations = 0
        for violation in Violation.objects.all():
            try:
                violation_category = ViolationCategory.objects.get(name=violation.category_text)
            except ViolationCategory.DoesNotExist as e:
                violation_category = ViolationCategory()
                violation_category.name = violation.category_text
                violation_category.save()
                self.stdout.write("Violation Category Created: %s" % violation_category.name)
                created_categories += 1
                
            violation.category_id_int = violation_category.id
            violation.save()
            self.stdout.write("Violation Category ID Updated: %s, %s" % (violation_category.name, violation_category.id))
            updated_violations += 1
        
        self.stdout.write("Total Created Categories: %s" % created_categories)
        self.stdout.write("Total Updated Violations: %s" % updated_violations)