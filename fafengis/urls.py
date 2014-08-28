from django.conf.urls import *
import extdirect.django as extdirect
from map import views as map_views
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

extdirect.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'fafengis.views.home', name='home'),
    # url(r'^fafengis/', include('fafengis.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^map/', include('map.urls')),
    url(r'^extdirect/', include('extdirect.django.urls')),
    url(r'', map_views.index, name="map-home")
)
