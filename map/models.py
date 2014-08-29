from django.contrib.gis.db import models

class Province(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    geom = models.MultiPolygonField(srid=4326)
    objects = models.GeoManager()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'province'


class District(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    province = models.ForeignKey(Province)
    constituencies = models.ManyToManyField('Constituency', through='DistrictConstituency')
    constituency_ids = models.CharField(max_length=1023)
    geom = models.MultiPolygonField(srid=4326)
    objects = models.GeoManager()
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'district'


class Tehsil(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    district = models.ForeignKey(District)
    geom = models.MultiPolygonField(srid=4326)
    objects = models.GeoManager()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'tehsil'


class Constituency(models.Model):
    id = models.CharField(max_length=255, primary_key=True) #id in form of NA1, NA272
    name = models.CharField(max_length=255)
    district_ids = models.CharField(max_length=1023)
    geom = models.MultiPolygonField(srid=4326)
    objects = models.GeoManager()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'constituency'


class Location(models.Model):
    name = models.CharField(max_length=255)
    tehsil = models.ForeignKey(Tehsil)
    constituency = models.ForeignKey(Constituency)
    legacy_id = models.IntegerField(default=0)
    geom = models.PointField(srid=4326)
    
    def __str__(self):
        return "Location: %s, Tehsil: %s, Constituency %s" % (self.name, self.tehsil.name, self.constituency.name)
    
    class Meta:
        db_table = 'location'


class DistrictConstituency(models.Model):
    """ Model to establish relationship of Constituencies within a District or vice versa """
    id = models.AutoField(primary_key=True)
    district = models.ForeignKey(District)
    constituency = models.ForeignKey(Constituency)
    objects = models.GeoManager()

    def __str__(self):
        return 'District-Constituency'
    
    class Meta:
        db_table = 'district_constituency'


class ViolationCategory(models.Model):
    """ This will hold all district Election Violation/Violence Pre/Election Day/Post Categories """
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'violation_category'

class Violation(models.Model):
    location = models.ForeignKey(Location)
    constituency = models.ForeignKey(Constituency)
    date_time = models.DateTimeField()
    category_text = models.CharField(max_length=255)
    category_id_int = models.IntegerField(default=0);
    #category = models.ForeignKey(ViolationCategory)
    comments = models.TextField()
    location_approximate = models.BooleanField(default=False)  # field indicating whether location for the violation is prgrammaticaly inserted / approximated or taken from datasource / valid
    
    def __str__(self):
        return "Comments: %s, Location: %s, Constituency %s" % (self.comments, self.location.name, self.constituency.name)
    
    class Meta:
        db_table = 'violation'
        

class ElectionDayRawIncident(models.Model):
    """
        [Temporary Model]
        This will hold incidents imported form electionpakistan.org/map/get_electionday_incidents.
        On electionpakistan.org some of these incidents has location (name, lat, lng) details but most of them didn't.
        This model shuldn't have any related field in order to hold all raw attributes.
        Later new model instances of Violation will be formed from these records utilizing certain GIS techniques to
        have all locations related to Location Model
        Script importurlelectiondayincidents will be used to extract electionday incidents from electionpakistan.org and to
        populate the model
    """
    incident_id = models.IntegerField()
    date_time = models.DateTimeField()
    category_text = models.CharField(max_length=255)
    location_text = models.CharField(max_length=255, null=True)
    lat = models.FloatField()
    lng = models.FloatField()
    constituency_id = models.CharField(max_length=6)
    district = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    comments = models.TextField()
    
    class Meta:
        db_table = 'election_day_raw_incidents'