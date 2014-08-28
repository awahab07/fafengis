/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[vector-legend]
 *  Vector Legend
 *  -------------------------
 *  Render a legend for a vector layer.
 */

var mapPanel, legendPanel;

Ext.onReady(function() {
	//Ext.Direct.addProvider(Ext.app.REMOTING_API);
    var rules = [
		new OpenLayers.Rule({
            title: "No Incidents",
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "occurrence",
				value: 0
            }),
            symbolizer: {
                graphicName: false,
                pointRadius: 6,
                fillColor: "#2ECBEA",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.1
            }
        }),
        new OpenLayers.Rule({
            title: "1 - 5",
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "occurrence",
                upperBoundary: 5,
                lowerBoundary: 1
            }),
            symbolizer: {
                graphicName: "square",
                pointRadius: 6,
                fillColor: "#93BC8B",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.4
            }
        }),
        new OpenLayers.Rule({
            title: "6 - 10",
			minScaleDenominator: 0,			
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "occurrence",
                upperBoundary: 10,
                lowerBoundary: 6
            }),
            symbolizer: {
                graphicName: "square",
                pointRadius: 6,
                fillColor: "#776E17",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.4				
            }
        }),
        new OpenLayers.Rule({
            title: "11 - 15",
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "occurrence",
                upperBoundary: 15,
                lowerBoundary: 11
            }),
            symbolizer: {
                graphicName: "square",
                pointRadius: 6,
                fillColor: "#DAEA2E",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.4				
            }
        }),
        new OpenLayers.Rule({
            title: "16 - 20",
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "occurrence",
                upperBoundary: 20,
                lowerBoundary: 16
            }),
            symbolizer: {
                graphicName: "square",
                pointRadius: 6,
                fillColor: "#FCB932",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.4				
            }
        }),
        new OpenLayers.Rule({
            title: " > 20",
            maxScaleDenominator: 30000000,
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN,
                property: "occurrence",
                value: 20
            }),
            symbolizer: {
                graphicName: "square",
                pointRadius: 8,
                fillColor: "#A32420",
                strokeColor: "#666666",
                strokeWidth: 1,
				fillOpacity: 0.4				
            }
        })					
    ];

	var googleLayer = new OpenLayers.Layer.Google("Google Map");

    var violationsLayer = new OpenLayers.Layer.Vector("Incidents", {
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: "get_districts_scaling",
            format: new OpenLayers.Format.GeoJSON()
        }),
        styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({}, {rules: rules}))
    });
    
	
	// create select feature control
    var selectCtrl = new OpenLayers.Control.SelectFeature(violationsLayer);

    // define "createPopup" function
    function createPopup(feature) {
        popup = new GeoExt.Popup({
            title: 'Violation Details',
            location: feature,
            width:300,
            html: getViolationDetailsMarkup(feature),
            maximizable: true,
            collapsible: true,
			modal: true
        });
        // unselect feature when the popup
        // is closed
        popup.on({
            close: function() {
                if(OpenLayers.Util.indexOf(violationsLayer.selectedFeatures,
                                           this.feature) > -1) {
                    selectCtrl.unselect(this.feature);
                }
            }
        });
        popup.show();
    }

    // create popup on "featureselected"
    violationsLayer.events.on({
        featureselected: function(e) {
			e.cancelBubble = false;
            createPopup(e.feature);
			console.log(e);
			return true;
        }
    });
	
    mapPanel = new GeoExt.MapPanel({
        renderTo: "mappanel",
        border: false,
        layers: [googleLayer, violationsLayer],
        height: 400, // IE6 wants this
        zoom: 8
    });
    
    legendPanel = new GeoExt.LegendPanel({
        layerStore: mapPanel.layers,
        renderTo: "legend",
        border: false
    });
	
	mapPanel.map.addControl(selectCtrl);
    selectCtrl.activate();
	
	var epsg4326 =  new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
    projectTo = mapPanel.map.getProjectionObject(); //The map projection (Spherical Mercator)
	var lonLat = new OpenLayers.LonLat( 71.0083, 30.675715).transform(epsg4326, projectTo);
    var zoom=5;
    mapPanel.map.setCenter (lonLat, zoom);
});

function getViolationDetailsMarkup(feature){
	var violations = feature.attributes.violations;
	var markup = '';
	var rowCount = 1;
	if(violations){
		markup += '<div><span class="feature-popup-heading">No. of incidents reported in <strong> '+feature.attributes.name+'</strong></span></div>';
		markup += '<table border="1" class="feature-popup-table">';
		markup += '<tr><th>SN</th><th>Incident</th><th>Count</th></tr>';
		if(typeof violations['Violation of Code of Conduct'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Violation of Code of Conduct</td><td>'+violations['Violation of Code of Conduct']+'</td></tr>';
		}
		if(typeof violations['Misuse of State Resources'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Misuse of State Resources</td><td>'+violations['Misuse of State Resources']+'</td></tr>';
		}
		if(typeof violations['Fairness of Proceses'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Fairness of Proceses</td><td>'+violations['Fairness of Proceses']+'</td></tr>';
		}
		if(typeof violations['Election Administration'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Election Administrationt</td><td>'+violations['Election Administration']+'</td></tr>';
		}
		if(typeof violations['Violence'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Violence</td><td>'+violations['Violence']+'</td></tr>';
		}
		if(typeof violations['Nomination Process'] != "undefined"){
			markup += '<tr><td>'+ rowCount++ +'</td><td>Nomination Process</td><td>'+violations['Nomination Process']+'</td></tr>';
		}
		markup += '</tr></table>';
		markup += '<div class="copy-right-div"><span class="copy-right-span">&copy; electionpakistan.org</span></div>';
	}else{
		markup = '<div>No incidents reported at this location.</div>';
	}
	return markup;
}
