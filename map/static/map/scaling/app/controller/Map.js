/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
Ext.define('Scaling.controller.Map', {
    extend: 'Ext.app.Controller',

    models: ['District'],
    stores: ['Districts'],
	views: ['DistrictMapPanel', 'Map', 'ViolationChart', 'Grid', 'Error'],

    init: function() {
        var me = this;
		/*For Dev Only*/
        me.getDistrictsStore().on({
            scope: me,
            load : me.onDistrictsStoreLoad
        });

        this.control({
            'scaling_mappanel': {
                'beforerender': this.onMapPanelBeforeRender
            }
        }, this);
    },

    onMapPanelBeforeRender: function(mapPanel, options) {
        var me = this;
        var layers = [];

        // OpenLayers object creating
        layers.push(new OpenLayers.Layer.Google('Google Map'));
		layers.push(new OpenLayers.Layer.OSM('Open Street Map'));

        // create vector layer
        var context = {
            getColor: function(feature) {
                if (parseInt(feature.attributes.id) == parseInt(incident_id)) {
                    return 'red';
                }
				return 'orange';
            }
        };
        var template = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: 5,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}",
            graphicName: "triangle"
        };
        var style = new OpenLayers.Style(template, {context: context});
        var vecLayer = new OpenLayers.Layer.Vector("vector", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: base_url + controller_name + "/get_districts_scaling",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()]
        });
        layers.push(vecLayer);

        // manually bind store to layer
        me.getDistrictsStore().bind(vecLayer);

        mapPanel.map.addLayers(layers);

        // some more controls
        /*mapPanel.map.addControls([new OpenLayers.Control.DragFeature(vecLayer, {
            autoActivate: true,
            onComplete: function(feature, px) {
                var store = me.getDistrictsStore();
                store.fireEvent('update', store, store.getByFeature(feature));
            }
        })]);*/

        // for dev purpose
        map = mapPanel.map;
        mapPanel = mapPanel;
    },

    onLaunch: function() {
        var me = this;

        // for dev purpose
        ctrl = this;
    },

    onDistrictsStoreLoad: function(store, records) {
        // do custom stuff on Districts load if you want, for example here we
        // zoom to Districts extent
        var dataExtent = store.layer.getDataExtent();
        if (dataExtent) {
            store.layer.map.zoomToExtent(dataExtent);
        }
    }
});
