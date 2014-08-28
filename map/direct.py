from extdirect.django import DirectRouter, register_router
from map.models import Constituency as ConstituencyModel  
import geojson

class Constituency(DirectRouter):
    def get_all_with_geojsonstring( self, **kwargs ):
        features = list()
        for constituency in ConstituencyModel.objects.all():
            feature_custom_properties = dict(constituency_name=constituency.name, constituency_id=constituency.id, district_name=constituency.district_set.all()[0].name, district_id=constituency.district_set.all()[0].id, province_name=constituency.district_set.all()[0].province.name, province_id=constituency.district_set.all()[0].province.id)
            feature_geojson= geojson.dumps(dict(type="Feature", geometry=geojson.loads(constituency.geom.json), properties=feature_custom_properties))
            features.append( {'name':constituency.name, 'constituency_id':constituency.id, 'district_id':constituency.district_set.all()[0].id, 'geojson': feature_geojson} )
        return features


    def get_constituency_geojsonstring( self, ids, return_list, **kwargs):
        ids = ids.split(",") if type( ids ) is str else list(ids)
        constituencies = ConstituencyModel.objects.filter(id__in=ids)
        features = list()
        for constituency in constituencies:
            feature_custom_properties = dict(constituency_name=constituency.name, constituency_id=constituency.id, district_name=constituency.district_set.all()[0].name, district_id=constituency.district_set.all()[0].id, province_name=constituency.district_set.all()[0].province.name, province_id=constituency.district_set.all()[0].province.id)
            feature_geojson= dict(type="Feature", geometry=constituency.geom.json, properties=feature_custom_properties)
            features.append( {'name':constituency.name, 'constituency_id':constituency.id, 'district_id':constituency.district_set.all()[0].id, 'geojson': feature_geojson} )
        return features
    
register_router(Constituency, 'Ext.GisApi')