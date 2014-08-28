/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
var me = null; //For Dev
Ext.define('DCG.controller.Map', {
    extend: 'Ext.app.Controller',

    models: ['Incident'],
    stores: ['Incidents', 'ViolationOccurrences', 'Districts', 'Constituencies', 'ConstituencyFeatureStore'],
    views: ['PortalPanel'],
    refs: [
        {ref: 'summitChart', selector: 'summitchart'},
        {ref: 'summitGrid', selector: 'summitgrid'},
	{ref: 'violationComboBox', selector: 'combobox[itemId="incidentTypeComboBox"]'},
	{ref: 'mapPanel', selector: 'cf_mappanel'}
    ],

    init: function() {
        me = this;
	/*For Dev Only*/
	iStore = me.getIncidentsStore();
	vStore = me.getViolationOccurrencesStore();
        me.getIncidentsStore().on({
            scope: me,
            load : me.onIncidentsStoreLoad
        });

        this.control({
            'cf_mappanel': {
                'beforerender': this.onMapPanelBeforeRender
            },
	    'summitgrid': {
		    'select': this.gridRecordSelected
	    },
	    'combobox[itemId="incidentTypeComboBox"]': {
		    'change': this.incidentTypeChanged
	    }			
        }, this);
    },

    onMapPanelBeforeRender: function(mapPanel, options) {
        var me =controller = this;
        var layers = [];
        map = mapPanel.map;
	me.map = map;
		
        // OpenLayers object creating
	me.gmap = new OpenLayers.Layer.Google('Google Map');
        layers.push(me.gmap);
	layers.push(new OpenLayers.Layer.OSM('Open Street Map'));
	
	var context = {
            getColor: function(feature) {
				return "red";
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
		// create vector layer
		var style = new OpenLayers.Style(template, {context: context});
		me.conLayer = new OpenLayers.Layer.Vector("Constituencies",{
			//maxExtent: new OpenLayers.Bounds(6776974.417305551, 2716247.7922399966,8828454.039573975, 4451578.67963478)
		});
		layers.push(me.conLayer);
		
		//me.getIncidentsStore().bind(me.conLayer);
		map.addLayers(layers);
		
		//Incidents Layer
		me.incidentsLayer = new OpenLayers.Layer.Vector("Incidents");
		me.map.addLayer(me.incidentsLayer);
		
		//Add a selector control to the vectorLayer with popup functions
		var controls = {
		  selector: new OpenLayers.Control.SelectFeature(me.incidentsLayer, { onSelect: createPopup, onUnselect: destroyPopup })
		};
		
		function createPopup(feature) {
		  feature.popup = new OpenLayers.Popup.FramedCloud("pop",
			  feature.geometry.getBounds().getCenterLonLat(),
			  null,
			  feature.attributes.popup_content,
			  null,
			  true,
			  function() { controls['selector'].unselectAll(); }
		  );
		  //feature.popup.closeOnMove = true;
		  map.addPopup(feature.popup);
		}
	
		function destroyPopup(feature) {
		  feature.popup.destroy();
		  feature.popup = null;
		}
		
		map.addControl(controls['selector']);
		controls['selector'].activate();
		//END - Incidents Layer		
	
	me.formatOptions = {
		'internalProjection': me.map.baseLayer.projection,
		'externalProjection': new OpenLayers.Projection("EPSG:4326")
	};
	
	me.geojsonReader = new OpenLayers.Format.GeoJSON(me.formatOptions);
	
	$.getJSON(base_url + '/map/get_party_turnout_election_history',function(electionHistory){
		var i = 0;
		$.each(electionHistory,function(index, constituency){
			setTimeout(function(){
			Ext.GisApi.Constituency.get_constituency_geojsonstring({ids: constituency.constituency_id, return_list: true}, function(features, request){
				Ext.each(features,function(feature, index, features){
					var feats = me.geojsonReader.read(feature.geojson);
					feat = feats[0];
					if(feat.attributes.constituency_id){
						var constituency_id = feat.attributes.constituency_id.replace('NA','NA-');
						feat.attributes.history = electionHistory[constituency_id];
						constituenciesLayer.addFeatures(feats);
					}
					
					//Updating corresponding district that constituency boundaries are avaiable
					var districtRecord = controller.getDistrictsStore().getById(parseInt(constituency.district_id));
					if(districtRecord)
					    districtRecord.set('hasConstituencyBoundaries', true);
				});
			})
			},50 * ++i);
		});
	});
		
    },

    onLaunch: function() {
        var me = this;
		me.map.zoomToExtent(me.conLayer.getExtent());
    },

    onIncidentsStoreLoad: function(store, records){
		this.populateViolationOccurrenceStore();
    },
	
	populateViolationOccurrenceStore: function(){
		//populating the ViolationOccurrenceStore based on records in IncidentStore
		var vStore = this.getViolationOccurrencesStore(); //ViolationOccurrences Store
		var iStore = this.getIncidentsStore(); //IncidentStore

		iStore.clearFilter();
		vStore.removeAll();
		var categoryGroupCount = iStore.count(true);
		
		//For All Types of Violations
		//vStore.add({category: 'All', occurrence: iStore.count(false)});
		for(k in categoryGroupCount){
			vStore.add({category: k, occurrence: categoryGroupCount[k]});
		}
	},
	
	gridRecordSelected: function(grid, record, index, opts){
		var me = this;
		var controller = this;
		var cStore = me.getConstituenciesStore();
		var iStore = me.getIncidentsStore();
		me.conLayer.destroyFeatures();
		
		iStore.proxy.url = base_url + 'map/get_district_incident_records/'+record.data.id;
		controller.getSummitGrid().setLoading("Loading Incidents");
		iStore.load(function(){
			//Filtering constituencis store for the selected district
			cStore.filterBy(function(cRecord,id){
				return cRecord.data.district_id.split('/').indexOf(String(record.data.id)) > -1;
			});
			
			me.bounds = null;
			cStore.each(function(cRecord){
				//Creating and adding constituency feature
				var features = me.geojsonReader.read(cRecord.data.geojson);
				me.conLayer.addFeatures(features);
				me.conLayer.redraw();
				
				//Calculating / Extending map bounds
				if (!me.bounds) {
					me.bounds = features[0].geometry.getBounds();
				} else {
					me.bounds.extend(features[0].geometry.getBounds());
				}
				
				
				//Adding / Incrementing Constituency Incident Attributes And Constituency Layer Attributes
				iStore.clearFilter();
				iStore.filter('constituency_id',cRecord.data.constituency_id);
				features[0].attributes.All = iStore.count(false);
				if(!cRecord.data.incidentsCalculated){
					iStore.each(function(iRecord){
						cRecord.data[iRecord.data.category]++;
						if(isNaN(features[0].attributes[iRecord.data.category]))features[0].attributes[iRecord.data.category]=0;
						features[0].attributes[iRecord.data.category]++;
						return true;
					});
					cRecord.data.incidentsCalculated = true;
				}
				
				return true;
			});
			
			//Populating ViolationOccurrences Store for Chart
			me.populateViolationOccurrenceStore(record.data.id);
			me.map.zoomToExtent(me.bounds);
			
			me.incidentTypeChanged(null,null,null,null);
			
			controller.getSummitGrid().setLoading(false);
		});
	},
	
	incidentTypeChanged: function(combo, newValue, oldValue, opts){
		me=this;
		me.selectedIncidentFilter = newValue;
		
		if(!(	newValue=="Misuse of State Resources" || 
				newValue=="Violation of Code of Conduct" || 
				newValue=="Posting and Transfer" || 
				newValue=="Fairness of Proceses" || 
				newValue=="Violence" || 
				newValue=="Election Administration" || 
				newValue=="Nomination Process" || 
				newValue=="Electoral Transparency" || 
				newValue=="Others"))
					newValue='All';
		var iStore = me.getIncidentsStore();
		var vStore = me.getViolationOccurrencesStore();
		var cStore = me.getConstituenciesStore();
		if(newValue == 'All') iStore.clearFilter();
		else iStore.filter('category', newValue);
		
		var scalingRules = [
			new OpenLayers.Rule({
				title: "No Incidents",
				maxScaleDenominator: 30000000,
				symbolizer: {
					graphicName: "square",
					pointRadius: 6,
					fillColor: "#C8F7F0",
					strokeColor: "#666666",
					strokeWidth: 1,
					fillOpacity: 0.4
				}
			}),
			new OpenLayers.Rule({title: "1 - 5",maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 5,
					lowerBoundary: 1
				}),
				symbolizer: {fillColor: "#91B585" }//93BC8B
			}),
			new OpenLayers.Rule({
				title: "6 - 10",
				minScaleDenominator: 0,			
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 10,
					lowerBoundary: 6
				}),
				symbolizer: {fillColor: "#776E17"}
			}),
			new OpenLayers.Rule({
				title: "11 - 15",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 15,
					lowerBoundary: 11
				}),
				symbolizer: {fillColor: "#DAEA2E"}
			}),
			new OpenLayers.Rule({
				title: "16 - 20",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 20,
					lowerBoundary: 16
				}),
				symbolizer: {fillColor: "#FCB932"}
			}),
			new OpenLayers.Rule({
				title: " > 20",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.GREATER_THAN,
					property: newValue,
					value: 20
				}),
				symbolizer: {fillColor: "#A32420"}
			})					
		];//End Scaling Rules

		var conTemplate = {
            cursor: "pointer",
			labelColor: "#AF9C05",
            fillOpacity: 0.5,
            pointRadius: 5,
            strokeWidth: 1,
            strokeOpacity: 1,
			fontSize: '12px',
			fontColor: ["#F00", "#303", "#00F", "#600", "#900"][Math.floor((Math.random()*5))],
			labelOutlineColor: 'white',
			labelOutlineWidth: '1px',
			label: "${getLabel}"
        };
		
		var conContext = {
			getLabel: function(feature,property){
				return feature.attributes.constituency_name.replace(' ','-');
			}
		};
		
		//styleMap = new OpenLayers.StyleMap(new OpenLayers.Style(this.template, {rules: highlightRules}))
		//iStore.layer.styleMap = styleMap;
		//iStore.layer.redraw();
		
		me.conLayer.styleMap = new OpenLayers.StyleMap(new OpenLayers.Style(conTemplate, {context: conContext,rules: scalingRules}))
		me.conLayer.redraw();
		
		me.getConstituencyFeatureStoreStore().unbind();
		me.getConstituencyFeatureStoreStore().bind(me.conLayer);
		map.legendPanel.layerStore = me.getConstituencyFeatureStoreStore();
		//map.legendPanel.update();
		
		//Adding Markers
		me.drawMarkers();
	},
	
	attributeConstituenciesLayer: function(e){
		console.log('attributeConstituenciesLayer');
		me=e.object.map.controller;
		var features = e.features;
		for(index in features){
			featuer = features[index];
		}
	},
	
	drawMarkers: function(){
		var me = this;
		var cStore = me.getConstituenciesStore();
		var iStore = me.getIncidentsStore();
		var epsgProjection = new OpenLayers.Projection("EPSG:4326");
		var mapProjection = me.map.getProjectionObject();
		var markers = []
		//destroying any previous markers
		me.incidentsLayer.destroyFeatures();
		iStore.each(function(iRecord){
			// Define markers as "features" of the vector layer:
			var popupContent = '<div class="markerContent"><table><tr><td class="markerLabel">District: </td><td><strong>'+iRecord.data.district+'</strong></td></tr><tr><td class="markerLabel">Location: </td><td>'+iRecord.data.location+'</td></tr><tr><td class="markerLabel">Violation Type: </td><td><span style="color:red;font-size:12px;">'+iRecord.data.category+'</span></td></tr><tr><td class="markerLabel">Date/Time: </td><td><span style="color:#194583;font-size:11px;">'+iRecord.data.time_stamp+'</span></td></tr></table><hr><div>'+iRecord.data.comments+'</div></div>';
			var feature = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Point( iRecord.data.lng, iRecord.data.lat).transform(epsgProjection, mapProjection),
				{description:iRecord.data.comments, popup_content: popupContent} ,
				{externalGraphic: base_url + 'assets/images/map.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
			);
			me.incidentsLayer.addFeatures(feature);
			return true;
		});
	}
});
