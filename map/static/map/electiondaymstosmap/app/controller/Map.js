/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
var me = null; //For Dev
Ext.define('DCG.controller.Map', {
    extend: 'Ext.app.Controller',

    models: ['Incident'],
    stores: ['Incidents', 'ViolationOccurrences','Provinces', 'Districts', 'Constituencies', 'ConstituencyFeatureStore', 'ConstituencyViolations'],
	views: ['PortalPanel'],
    refs: [
        {ref: 'summitChart', selector: 'summitchart'},
        {ref: 'summitGrid', selector: 'summitgrid'},
		{ref: 'violationComboBox', selector: 'combobox[itemId="incidentTypeComboBox"]'}
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
        var me = this;
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
		
		
		var formatOptions = {
			'internalProjection': me.map.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
		me.geojsonReader = new OpenLayers.Format.GeoJSON(formatOptions);
    },

    onLaunch: function() {
        var me = this;
		me.map.zoomToExtent(me.conLayer.getExtent());
		me.getIncidentsStore().load();
    },

    onIncidentsStoreLoad: function(store, records){
		this.populateConstituencyProvinceViolationsStore();
		this.populateViolationOccurrenceStore();
		this.fetchAttributeConstituencyFeatures();
    },
	
	populateConstituencyProvinceViolationsStore: function(){
		var iStore = this.getIncidentsStore();
		var cvStore = this.getConstituencyViolationsStore();
		var pStore = this.getProvincesStore();
		
		iStore.clearGrouping();
		iStore.clearFilter();
		
		iStore.each(function(iRecord){
			var iFindIndex = cvStore.find('id',iRecord.data.constituency_id);
			if(iFindIndex == -1){
				cvStore.add({id: iRecord.data.constituency_id, name: iRecord.data.constituency, occurrence: 1, province: iRecord.data.province, province_id: iRecord.data.province_id});
				cvStore.last().data[iRecord.data.category]++;
				cvStore.last().data['occurrence']++;
			}else{
				cvStore.getAt(iFindIndex).data.occurrence++;
				cvStore.getAt(iFindIndex).data[iRecord.data.category]++;
			}
			
			var pFindIndex = pStore.find('id',iRecord.data.province_id);
			if(pFindIndex == -1){
				if(iRecord.data.province_id){
					pStore.add({id: iRecord.data.province_id, name: iRecord.data.province});
					pStore.last().data[iRecord.data.category]=1;
				}				
			}else{
				if(typeof iRecord.data.category != "undefined" && iRecord.data.category)
					pStore.getAt(pFindIndex).data[iRecord.data.category]++;
			}			
		});
	},
	
	populateViolationOccurrenceStore: function(){
		//populating the ViolationOccurrenceStore based on records in IncidentStore
		//var vStore = this.getViolationOccurrencesStore(); //ViolationOccurrences Store
		var iStore = this.getIncidentsStore(); //IncidentStore
		vStore.removeAll();
		return;
		iStore.clearFilter();
		iStore.clearGrouping();
		iStore.group('category');
		var categoryGroupCount = iStore.count(true);
		
		var provincesCategoriesAverage = Array();
		iStore.group('province');
		var provincesIncidents = iStore.count(true);
		for(province in provincesIncidents){
			provincesCategoriesAverage[province] = provincesIncidents.province;
		}

		iStore.clearFilter();
		iStore.each(function(iRecord){
			if(typeof provincesCategoriesAverage[iRecord.data.province] == "undefined")
				provincesCategoriesAverage[iRecord.data.province] = Array();
			
			if(typeof provincesCategoriesAverage[iRecord.data.province][iRecord.data.category] != "undefined")
				provincesCategoriesAverage[iRecord.data.province][iRecord.data.category]['count']++;
			else{
				provincesCategoriesAverage[iRecord.data.province][iRecord.data.category] = Array();
				provincesCategoriesAverage[iRecord.data.province][iRecord.data.category]['count']=1;
			}
			provincesCategoriesAverage[iRecord.data.province][iRecord.data.category]['ratio']=
				provincesCategoriesAverage[iRecord.data.province][iRecord.data.category]['count']/categoryGroupCount[iRecord.data.category]
		});
		
		for(province in provincesCategoriesAverage){
			if(province!="Azad Kashmir"){
				for(category in province){
					vStore.add({province:province,category:category,percentage:category.ratio});
				}
			}
		}
		console.log('vStore count:',vStore.count());
	},
	
	fetchAttributeConstituencyFeatures: function(){
		for(i=1;i<=272;i++){
			//setTimeout(function(){
			Ext.GisApi.Constituency.get_constituency_geojsonstring({ids: 'NA' + i.toString(), return_list: true},function(features, request){
				Ext.each(features,function(feature, index, features){
					var feats = me.geojsonReader.read(feature.geojson);
					feat = feats[0];
					if(feat.attributes.C_ID){
						var cIndex = me.getConstituenciesStore().find('constituency_id',feat.attributes.C_ID)
						if(cIndex != -1){
							var cRecord = me.getConstituenciesStore().getAt(cIndex);
							//console.log(cRecord.data);
							feat.attributes['Changes in Polling Scheme'] = cRecord.data['Changes in Polling Scheme'];
							feat.attributes['Violence','Illegal/Fraudulent Voting'] = cRecord.data['Violence','Illegal/Fraudulent Voting'];
							feat.attributes['Interference by Security/other Officials'] = cRecord.data['Interference by Security/other Officials'];
							feat.attributes['Polling Station Capture'] = cRecord.data['Polling Station Capture'];
							feat.attributes['Restrictions to Observation'] = cRecord.data['Restrictions to Observation'];
							feat.attributes['Partisan Election/Security Officials'] = cRecord.data['Partisan Election/Security Officials'];
							feat.attributes['Any Other'] = cRecord.data['Any Other'];
							feat.attributes['All'] = cRecord.data['occurrence'];
						}
						me.conLayer.addFeatures(feats);
					}
				});
				
			})
			//},100 * i);					
		}
		me.map.zoomToExtent(me.conLayer.getExtent());
	},
	
	gridRecordSelected: function(grid, record, index, opts){
		var me = this;
	},
	
	shouldPopulateFeatures: true,
	incidentTypeChanged: function(combo, newValue, oldValue, opts){
		me=this;
		me.selectedIncidentFilter = newValue;
		/*
			me.conLayer.features.forEach(function(feature,index,features){
				//feature.attributes[] = 0;
				me.getIncidentsStore().each(funciton(iRecord){
					if(feature.attributes.C_ID == iRecord.data.constituency_id){
					}
				});
			});*/
			
			if(me.shouldPopulateFeatures){
				me.conLayer.features.forEach(function(feature,index,features){
					feature.attributes["Changes in Polling Scheme"] = 0;
					feature.attributes["Violence"] = 0;
					feature.attributes["Illegal/Fraudulent Voting"] = 0;
					feature.attributes["Interference by Security/other Officials"] = 0;
					feature.attributes["Polling Station Capture"] = 0;
					feature.attributes["Restrictions to Observation"] = 0;
					feature.attributes["Partisan Election/Security Officials"] = 0;
					feature.attributes["Any Other"] = 0;
					feature.attributes["All"] = 0;
					
					me.getIncidentsStore().each(function(iRecord){
						if(feature.attributes.C_ID == iRecord.data.constituency_id){
							feature.attributes[iRecord.data.category]++;
							feature.attributes['All']++;
						}
					});
				});
				me.shouldPopulateFeatures = false;
			}	
		
		
		if(!(	newValue=="Changes in Polling Scheme" || 
				newValue=="Violence" || 
				newValue=="Illegal/Fraudulent Voting" || 
				newValue=="Interference by Security/other Officials" || 
				newValue=="Polling Station Capture" || 
				newValue=="Restrictions to Observation" || 
				newValue=="Partisan Election/Security Officials" || 
				newValue=="Any Other"
				))
				newValue='All';				
		
		console.log(newValue);			
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
			
			new OpenLayers.Rule({title: "1 - 10",maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 10,
					lowerBoundary: 1
				}),
				symbolizer: {fillColor: "#91B585" }//93BC8B
			}),
			new OpenLayers.Rule({
				title: "11 - 20",
				minScaleDenominator: 0,			
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 20,
					lowerBoundary: 11
				}),
				symbolizer: {fillColor: "#776E17"}
			}),
			new OpenLayers.Rule({
				title: "21 - 30",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 30,
					lowerBoundary: 21
				}),
				symbolizer: {fillColor: "#DAEA2E"}
			}),
			new OpenLayers.Rule({
				title: "31 - 40",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: newValue,
					upperBoundary: 40,
					lowerBoundary: 31
				}),
				symbolizer: {fillColor: "#FCB932"}
			}),
			new OpenLayers.Rule({
				title: " > 40",
				maxScaleDenominator: 30000000,
				filter: new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.GREATER_THAN,
					property: newValue,
					value: 40
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
			//label: "${getLabel}"
        };
		
		var conContext = {
			getLabel: function(feature,property){
				return feature.attributes.C_NAME.replace(' ','-');
			}
		};
		
		//styleMap = new OpenLayers.StyleMap(new OpenLayers.Style(this.template, {rules: highlightRules}))
		//iStore.layer.styleMap = styleMap;
		//iStore.layer.redraw();
		
		me.conLayer.styleMap = new OpenLayers.StyleMap(new OpenLayers.Style(conTemplate, {context: conContext,rules: scalingRules}))
		me.conLayer.redraw();
		
		//map.legendPanel.update();
		
		//Adding Markers
		//me.drawMarkers();
	},	
});
