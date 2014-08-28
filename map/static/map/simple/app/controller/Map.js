/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
Ext.define('CF.controller.Map', {
    extend: 'Ext.app.Controller',

    models: ['Summit'],
    stores: ['Summits', 'ViolationOccurrences'],
	views: ['PortalPanel'],
    refs: [
        {ref: 'summitChart', selector: 'summitchart'},
        {ref: 'summitGrid', selector: 'summitgrid'}
    ],

    init: function() {
        var me = this;
		/*For Dev Only*/
		iStore = me.getSummitsStore();
		vStore = me.getViolationOccurrencesStore();
        me.getSummitsStore().on({
            scope: me,
            load : me.onSummitsStoreLoad
        });

        this.control({
            'cf_mappanel': {
                'beforerender': this.onMapPanelBeforeRender
            }
        }, this);
    },

    onMapPanelBeforeRender: function(mapPanel, options) {
        var me = this;
        var layers = [];

        // OpenLayers object creating
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0?",
            {layers: 'basic'}
        );
        layers.push(new OpenLayers.Layer.Google);

        // create vector layer
        var context = {
            getColor: function(feature) {
                if (feature.attributes.category == "Fairness of Proceses") {
                    return 'green';
                }
                if (feature.attributes.category == "Nomination Process") {
                    return 'blue';
                }
				if (feature.attributes.category == "Misuse of State Resources") {
                    return 'orange';
                }
				if (feature.attributes.category == "Election Administration") {
                    return 'maroon';
                }
				if (feature.attributes.category == "Electoral Transparency") {
                    return 'teal';
                }				
				if (feature.attributes.category == "Violence") {
                    return 'tomato';
                }
                return 'red';
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
                url: "map_get_incidents_as_json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()]
        });
        layers.push(vecLayer);

        // manually bind store to layer
        me.getSummitsStore().bind(vecLayer);

        mapPanel.map.addLayers(layers);

        // some more controls
        /*mapPanel.map.addControls([new OpenLayers.Control.DragFeature(vecLayer, {
            autoActivate: true,
            onComplete: function(feature, px) {
                var store = me.getSummitsStore();
                store.fireEvent('update', store, store.getByFeature(feature));
            }
        })]);*/
		
		//Showing popup on select
	    // create select feature control
		var selectCtrl = new OpenLayers.Control.SelectFeature(vecLayer);
		function createPopup(feature) {
				popupOpts = Ext.apply({
					title: 'Incident Details',
					location: feature,
					width:400,
					html: 			'<table border="0" class="feature-popup-table">'+
					  '<tr>'+
						'<td colspan="2"><span class="feature-popup-heading">Violation at <strong>'+feature.attributes.location+'</strong></span></td>'+
					  '</tr>'+
					  '<tr>'+
						'<td><label class="feature-popup-label">District<label></td>'+
						'<td><span class="feature-popup-value">'+feature.attributes.district+'<span></td>'+
					  '</tr>'+
					  '<tr>'+
						'<td><label class="feature-popup-label">Tehsil<label></td>'+
						'<td><span class="feature-popup-value">'+feature.attributes.tehsil+'<span></td>'+
					  '</tr>'+
					  '<tr>'+
						'<td><label class="feature-popup-label">Violation Type<label></td>'+
						'<td><span class="feature-popup-value feature-popup-violation">'+feature.attributes.category+'<span></td>'+
					  '</tr>'+
					  '<tr>'+
						'<td><label class="feature-popup-label">Date & Time<label></td>'+
						'<td><span class="feature-popup-value feature-popup-date">'+feature.attributes.time_stamp+'<span></td>'+
					  '</tr>'+
					  '<tr>'+
						'<td colspan="2"><p class="feature-popup-details">'+feature.attributes.comments+'</p></td>'+
					  '</tr>'+
					'</table>',
					maximizable: true,
					collapsible: true,
					anchorPosition: 'auto'
				});
	
			popup = Ext.create('GeoExt.window.Popup', popupOpts);
			feature.openedPopup = popup;
			// unselect feature when the popup
			// is closed
			popup.on({
				close: function() {
					if(OpenLayers.Util.indexOf(vecLayer.selectedFeatures,
											   this.feature) > -1) {
						selectCtrl.unselect(this.feature);
					}
				}
			});
			popup.show();
		}
	
		// create popup on "featureselected"
		vecLayer.events.on({
			featureselected: function(e) {
				createPopup(e.feature);
			}
		});
		
		mapPanel.map.addControl(selectCtrl);
		selectCtrl.activate();
		
        // for dev purpose
        map = mapPanel.map;
        mapPanel = mapPanel;
    },

    onLaunch: function() {
        var me = this;

        // for dev purpose
        ctrl = this;
    },

    onSummitsStoreLoad: function(store, records) {
        // do custom stuff on summits load if you want, for example here we
        // zoom to summits extent
        var dataExtent = store.layer.getDataExtent();
        if (dataExtent) {
            store.layer.map.zoomToExtent(dataExtent);
        }
		
		//populating the chart store (violationOccurrence) after the incident store load
		this.populateViolationOccurrenceStore();
    },
	
	populateViolationOccurrenceStore: function(){
		//populating the ViolationOccurrenceStore based on records in IncidentStore
		var vStore = this.getViolationOccurrencesStore(); //ViolationOccurrences Store
		var iStore = this.getSummitsStore(); //IncidentStore
		var categoryGroupCount = iStore.count('category');
		for(k in categoryGroupCount){
			vStore.add({category: k, occurrence: categoryGroupCount[k]});
		}
	}
});
