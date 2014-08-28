from django.conf.urls import *
from map import views
from proxy import proxy_to

urlpatterns = patterns('',
    url(r'^electionpakistan/(?P<path>.*)$', proxy_to, {'target_url': 'http://electionpakistan.org/'}),
    url(r'^district-constituencies-map$', views.district_constituencies_map, name='mapdcl'),
    url(r'^angular$', views.angular_map, name='angular-map')
)