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

/*Adjusting height/width of content_sec*/
$(document).ready(function(){
	fateek_remove_css_rules(["thead td"], ["assets/css/style.css","assets/css/tabs.css"]);
	$('#content_sec').css({marginBottom:30, width:1400, height: 1000});
});

var mapPanel, legendPanel, electionHistory, constituenciesLayer, defaultTemplateHash;

var labelPropertyValue = "${C_ID}";
Ext.onReady(function() {
	Ext.Direct.addProvider(Ext.GisApi.REMOTING_API);
	var googleLayer = new OpenLayers.Layer.Google("Google Map");
	defaultTemplateHash = {strokeWidth: 3,strokeColor: 'white',label: labelPropertyValue, strokeOpacity: 0.0, fillColor: '#662B22', fillOpacity: 0.5,pointRadius:16, fontSize: '10px', fontColor: ["#303", "#600", "#900"][Math.floor((Math.random()*5))], labelOutlineColor: 'white',labelOutlineWidth: '1px' };
	var initialSelectTemplateHash = {strokeWidth: 1,strokeColor: '#F4E50C',label: labelPropertyValue, strokeOpacity: 0.3, fillColor: '#38A081', fillOpacity: 0.5,pointRadius:16, fontSize: '10px', fontColor: ["#F00", "#303", "#00F", "#600", "#900"][Math.floor((Math.random()*5))], labelOutlineColor: 'white',labelOutlineWidth: '1px' };
    constituenciesLayer = new OpenLayers.Layer.Vector("Constituencies", {
		styleMap: new OpenLayers.StyleMap({	'default': defaultTemplateHash,
                         					'select': initialSelectTemplateHash})
	});
	
	// create select feature control
    var selectCtrl = new OpenLayers.Control.SelectFeature(constituenciesLayer);
	var electionYear = 2008;
	
    // define "createPopup" function
    function createPopup(feature) {
        popup = new GeoExt.Popup({
            title: 'Election Information',
            location: feature,
			anchored: false,
            width:600,
            html: getElectionHistoryPopup(feature),
            maximizable: true,
            collapsible: true,
			modal: true
        });
        // unselect feature when the popup
        // is closed
        popup.on({
            close: function() {
                if(OpenLayers.Util.indexOf(constituenciesLayer.selectedFeatures,
                                           this.feature) > -1) {
                    selectCtrl.unselect(this.feature);
                }
            }
        });
        popup.show();
		popupCreateTableGrids(feature);
    }

    // create popup on "featureselected"
    constituenciesLayer.events.on({
        featureselected: function(e) {
			e.cancelBubble = false;
            createPopup(e.feature);
			return true;
        }
    });
	
	/* Map Panel */
    mapPanel = new GeoExt.MapPanel({
        renderTo: "mappanel",
        border: false,
        layers: [googleLayer, constituenciesLayer],
        height: 800, // IE6 wants this
        zoom: 8
    });
    
    /*legendPanel = new GeoExt.LegendPanel({
        layerStore: mapPanel.layers,
        renderTo: "legend-div",
        border: false
    });*/
	
	electionYearCombo = new Ext.form.ComboBox({
		typeAhead: false,
		triggerAction: 'all',
		lazyRender:true,
		renderTo: 'election-year',
		mode: 'local',
		width: 150,
		height: 30,
		store: new Ext.data.ArrayStore({
			id: 0,
			fields: [
				'election',
				'electionText'
			],
			data: [[2002, 'Election 2002'], [2008, 'Election 2008']]
		}),
		valueField: 'election',
		displayField: 'electionText',
		emptyText: 'Select Election',
		listeners:{
			select: electionYearSelected
		}
	});
	
	turnoutButton = new Ext.Button({
		renderTo: 'turnout-button',
		text: 'Voter Turnout',
		toggleGroup: 'turnout',
		width: 150,
		height: 30,		
		cls: 'party-ext-button-element',
		ctCls: 'party-ext-button-container',		
		listeners: {
			click: voterTurnoutClicked
		}		
	});
	
	partyButton = new Ext.Button({
		renderTo: 'party-button',
		text: 'Party Position',
		toggleGroup: 'turnout',
		width: 150,
		height: 30,		
		cls: 'party-ext-button-element',
		ctCls: 'party-ext-button-container',
		listeners: {
			click: partyTurnoutClicked
		}
	});
	
	showHideButton = new Ext.Button({
		renderTo: 'show-hide-label-button',
		text: 'Hide Labels',
		width: 150,
		cls: 'party-ext-button-element',
		ctCls: 'party-ext-button-container',
		listeners: {
			click: showHideButtonClicked
		}
	});
	
	mapPanel.map.addControl(selectCtrl);
    selectCtrl.activate();
	
	var maxExtent = new OpenLayers.Bounds(6776974.417305551, 2716247.7922399966,8828454.039573975, 4451578.67963478);
	mapPanel.map.setOptions({restrictedExtent: maxExtent});
	mapPanel.map.zoomToMaxExtent();
	
	var formatOptions = {
		'internalProjection': mapPanel.map.baseLayer.projection,
		'externalProjection': new OpenLayers.Projection("EPSG:4326")
	};
	var geojsonReader = new OpenLayers.Format.GeoJSON(formatOptions);
	
	$.getJSON('get_party_turnout_election_history',function(electionHistory){
		var i = 0;
		$.each(electionHistory,function(index, constituency){
			setTimeout(function(){
			Ext.GisApi.Constituency.get_constituency_geojsonstring(constituency.constituency_id,true,function(features, request){
				Ext.each(features,function(feature, index, features){
					var feats = geojsonReader.read(feature.geojson);
					feat = feats[0];
					if(feat.attributes.C_ID){
						var constituency_id = feat.attributes.C_ID.replace('NA','NA-');
						feat.attributes.history = electionHistory[constituency_id];
						constituenciesLayer.addFeatures(feats);
					}
				});
			})
			},50 * ++i);
		});
	});
});

function getElectionHistoryPopup(feature){
	var history = feature.attributes.history;
	var markup = '';
	markup += '<div class="election-history-popup">';
		markup += '<div class="history-heading">Constituency '+history.constituency_id.replace('NA','NA-')+' '+history.constituency+'</div>';
		markup += '<table class="history-table">';
			markup += '<tr>';
				markup += '<td rowspan="2">';
					markup += '<div calss="election-heading">';
						markup += '2013';
					markup += '</div>';
					
					//markup += '<div id="candidates-list-grid"></div>';
					markup += '<div class="candidates-list ext-hide-first-row"><table id="candidate-list-grid-table" >';
						markup += '<thead><tr><th width="100" ><div class="history-left table-head">Party</div></th><th width="200"><div class="history-right table-head">Candidate</div></th></tr></thead>';
						markup += '<tbody>';
						for(candidate_index in history.candidates){
							if(history.candidates[candidate_index].party && history.candidates[candidate_index].name)
							markup += '</tr><td><div class="history-left table-head">'+history.candidates[candidate_index].party+'</div></td><td><div class="history-right table-head">'+history.candidates[candidate_index].name+'</div></td></tr>';
						}
						markup += '</tbody>';
					markup += '</table></div>';
				markup += '</td>';
				
				markup += '<td>';
					markup += '<div calss="election-heading">';
						markup += '2008';
					markup += '</div>';
					
					markup += '<div class="candidates-list ext-hide-first-row"><table id="election-2008-grid-table">';
							markup += '<thead><tr><th><div class="history-left table-head">Election</div></th><th><div class="history-right table-head">2008</div></th></tr></thead>';
							markup += '<tbody>';							
markup += '<tr><td><div class="history-left table-head">Registered Votes</div></td><td><div class="history-right table-head">'+history[2008]['registeredVotes']+'</div></td></tr>';							
							markup += '<tr><td><div class="history-left table-head">Votes Polled</div></td><td><div class="history-right table-head">'+history[2008]['votes']+'</div></td></tr>';							
							markup += '<tr><td><div class="history-left table-head">Turnout</div></td><td><div class="history-right table-head">'+((parseFloat(history[2008]['turnout'])*100).toFixed(2))+'% </div></td></tr>';																					
						if(history[2008]['Winner'])							
							markup += '</tr><td><div class="history-left table-head">'+history[2008]['Winner'].party+'</div></td><td><div class="history-right table-head">'+history[2008]['Winner'].votes+' (Winner)</div></td></tr>';
						if(history[2008]['R-1'])
							markup += '</tr><td><div class="history-left table-head">'+history[2008]['R-1'].party+'</div></td><td><div class="history-right table-head">'+history[2008]['R-1'].votes+'</div></td></tr>';
						if(history[2008]['R-2'])
							markup += '</tr><td><div class="history-left table-head">'+history[2008]['R-2'].party+'</div></td><td><div class="history-right table-head">'+history[2008]['R-2'].votes+'</div></td></tr>';
						if(history[2008]['R-3'])
							markup += '</tr><td><div class="history-left table-head">'+history[2008]['R-3'].party+'</div></td><td><div class="history-right table-head">'+history[2008]['R-3'].votes+'</div></td></tr>';
							markup += '</tbody>';							
					markup += '</table></div>';
				markup += '</td>';
			markup += '</tr><tr>';
				markup += '<td>';
					markup += '<div calss="election-heading">';
						markup += '2002';
					markup += '</div>';
					
					markup += '<div class="candidates-list ext-hide-first-row"><table id="election-2002-grid-table">';
							markup += '<thead><tr><th><div class="history-left table-head">Election</div></th><th><div class="history-right table-head">2002</div></th></tr></thead>';
							markup += '<tbody>';
							markup += '<tr><td><div class="history-left table-head">Registered Votes</div></td><td><div class="history-right table-head">'+history[2002]['registeredVotes']+'</div></td></tr>';
							markup += '<tr><td><div class="history-left table-head">Votes Polled</div></td><td><div class="history-right table-head">'+history[2002]['votes']+'</div></td></tr>';
							markup += '<tr><td><div class="history-left table-head">Turnout</div></td><td><div class="history-right table-head">'+((parseFloat(history[2002]['turnout'])*100).toFixed(2))+'% </div></td></tr>';
						if(history[2002]['Winner'])							
							markup += '</tr><td><div class="history-left table-head">'+history[2002]['Winner'].party+'</div></td><td><div class="history-right table-head">'+history[2002]['Winner'].votes+' (Winner)</div></td></tr>';
						if(history[2002]['R-1'])
							markup += '</tr><td><div class="history-left table-head">'+history[2002]['R-1'].party+'</div></td><td><div class="history-right table-head">'+history[2002]['R-1'].votes+'</div></td></tr>';
						if(history[2002]['R-2'])
							markup += '</tr><td><div class="history-left table-head">'+history[2002]['R-2'].party+'</div></td><td><div class="history-right table-head">'+history[2002]['R-2'].votes+'</div></td></tr>';
						if(history[2002]['R-3'])
							markup += '</tr><td><div class="history-left table-head">'+history[2002]['R-3'].party+'</div></td><td><div class="history-right table-head">'+history[2002]['R-3'].votes+'</div></td></tr>';
							markup += '</tbody>';
					markup += '</table></div>';						
				markup += '</td>';
			markup += '</tr>';
		markup += '</table>';
	markup += '</div>';
	return markup;
}

function popupCreateTableGrids(feature){
    // create the Grid
	var candidateGrid = new Ext.ux.grid.TableGrid("candidate-list-grid-table", {
		stripeRows: true, // stripe alternate rows
		title: 'Election 2013 Candidates',
		width: 300,
	});
	candidateGrid.render();
	
	var election2008Grid = new Ext.ux.grid.TableGrid("election-2008-grid-table", {
		stripeRows: true, // stripe alternate rows
		width: 200,
	});
	election2008Grid.render();
	
	var election2002Grid = new Ext.ux.grid.TableGrid("election-2002-grid-table", {
		stripeRows: true, // stripe alternate rows
		width: 200,
	});
	election2002Grid.render();
}

function electionYearSelected(combo, record, index){
	if(turnoutButton.pressed){
		voterTurnoutClicked();
	}else if(partyButton.pressed){
		partyTurnoutClicked();
	}
}

function showHideButtonClicked(button, e){
	if(button.text == "Show Labels"){
		constituenciesLayer.styleMap.styles.default.defaultStyle.label = labelPropertyValue;
		constituenciesLayer.styleMap.addUniqueValueRules("default", '', null);
		button.setText("Hide Labels");
	}else{
		constituenciesLayer.styleMap.styles.default.defaultStyle.label = false;
		constituenciesLayer.styleMap.addUniqueValueRules("default", '', null);
		button.setText("Show Labels");
	}
	constituenciesLayer.redraw();
}

function partyTurnoutClicked(button, e){
	//turnoutButton
	if(!electionYearCombo.value){
		electionYearCombo.setValue(2008);
	}
	electionYear = electionYearCombo.value;
	var uniqueParties = [];
	constituenciesLayer.features.forEach(function(feature,index,features){
		if(defined(feature.attributes.history[electionYear]) && feature.attributes.history[electionYear]){
			var party = feature.attributes.history[electionYear].Winner.party;
			var votes = feature.attributes.history[electionYear].Winner.votes;
			feature.attributes.winnerParty = feature.attributes.history[electionYear].Winner.party;
			//feature.attributes.title = feature.attributes.constituency;
			//Adding unique stye rules for parties
			if(defined(party) && party && !defined(uniqueParties[party])){
				constituenciesLayer.styleMap.addUniqueValueRules("default", 'winnerParty', partiesColorlookup);
				uniqueParties[party] = party;
			}
		}
	});//END - forEach features
	constituenciesLayer.redraw();
	updateLegendPanelForParites(uniqueParties);
}

function voterTurnoutClicked(){
	//voterTurnoutButton
	if(!electionYearCombo.value){
		electionYearCombo.setValue(2008);
	}
	electionYear = electionYearCombo.value;
	
	var uniqueParties = [];
	constituenciesLayer.features.forEach(function(feature,index,features){
		if(defined(feature.attributes.history[electionYear]) && feature.attributes.history[electionYear]){
			var turnout = feature.attributes.history[electionYear].turnout;
			feature.attributes.turnout = turnout;
		}
	});//END - forEach features
	
	constituenciesLayer.styleMap.styles.default.rules = Array();
	constituenciesLayer.styleMap.styles.default.addRules(turnoutScalingRules);
	constituenciesLayer.redraw();
	
	$('.legend-item-div').remove();
	createLayersLegend(constituenciesLayer, 'legend-div', 'Voter Turnout')
}

var partiesColorlookup = {
	'PTI': 		{title: 'PTI', fillColor: "#1B9646", fillOpacity: 0.5},
	'PPPP': 	{title: 'PPPP', fillColor: "#EF1717", fillOpacity: 0.5},
	'PML (N)': 	{title: 'PML (N)', fillColor: "#215B0A", fillOpacity: 0.5},
	'ANP': 		{title: 'ANP', fillColor: "#FF2C2C", fillOpacity: 0.9},//PSPP
	'IND': 		{title: 'Independet', fillColor: "#3585D6", fillOpacity: 0.5},//Independent  
	'PML': 		{title: 'PML', fillColor: "#29938B", fillOpacity: 0.5},//NA
	'PML (Q)': 	{title: 'PML (Q)', fillColor: "#173A08", fillOpacity: 0.5},//PAT		
	'MQM': 		{title: 'MQM', fillColor: "#0E3C42", fillOpacity: 0.5},//MQMP		
	'PML (F)': 	{title: 'PML (F)', fillColor: "#4B1D54", fillOpacity: 0.5},//PML (Z)
	'PPP (S)': 	{title: 'PPP (S)', fillColor: "#896530", fillOpacity: 0.5},//PPP (S)	
	'MMA': 		{title: 'MMA', fillColor: "#37D3A2", fillOpacity: 0.5},	//PML (J)
	'NPP': 		{title: 'NPP', fillColor: "#4C4FAD", fillOpacity: 0.5},	//PKMAP
	'BNP (A)': 	{title: 'BNP (A)', fillColor: "#EF1A96", fillOpacity: 0.5},//JWP
	'PSPP': 	{title: 'PSPP', fillColor: "#D3F596", fillOpacity: 0.5},
	'NA': 		{title: 'NA', fillColor: "#C91C96", fillOpacity: 0.5},
	'PAT': 		{title: 'PAT', fillColor: "#8815B6", fillOpacity: 0.5},
	'MQMP': 	{title: 'MQMP', fillColor: "#A6159E", fillOpacity: 0.5},
	'PML (Z)': 	{title: 'PML (Z)', fillColor: "#3515C6", fillOpacity: 0.5},
	'PML (J)': 	{title: 'PML (J)', fillColor: "#241C96", fillOpacity: 0.5},
	'PKMAP': 	{title: 'PKMAP', fillColor: "#92C596", fillOpacity: 0.5},
	'JWP': 		{title: 'JWP', fillColor: "#8C1599", fillOpacity: 0.5}
};


function defined(value){
	return !(typeof value == "undefined");
}

function updateLegendPanelForParites(uniqueParties){
	//legendDom.find('input').bind('click', function(){
		//addedLayer.setVisibility(this.checked);
	//});
	//removing previous legend items
	$('.legend-item-div').remove();
	//creating new legends
	for(partyIndex in uniqueParties){
		partyTitle = uniqueParties[partyIndex];
		//adding party element in lookup if it isn't included
		if(!defined(partiesColorlookup[partyTitle])){
			var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
			partiesColorlookup[partyTitle] = {title: partyTitle, fillColor: randomColor, fillOpacity: 0.5};
		}
		
		if(typeof partiesColorlookup[partyTitle].title != "function"){
			var legendDom = $('<div class="legend-item-div"><div class="legend-span"><span class="legend-color-box" style="background-color:'+partiesColorlookup[partyTitle].fillColor+'"></span><span class="legend-title" >'+partiesColorlookup[partyTitle].title+'</span></div></div>');
			legendDom.find('.legend-color-box').css({opacity: partiesColorlookup[partyTitle].fillOpacity + 0.2});
			legendDom.appendTo($('#legend-div'));
		}
	}
	//creating legend panel title
	$('#legend-panel-title').text('Party Position');
}

function createLayersLegend(layer, containerId, legendPanelTitle){
	if(typeof document.getElementById(containerId) == "undefined"){
		console.error('Element of ID ' + containerId + ' does not exist.');
		return false;
	}
	if(!layer){
		console.error('Layer is not defined.');
		return false;
	}

	var rules = layer.styleMap.styles.default.rules;
	if(typeof rules != "undefined" && rules){
		for(ruleIndex in rules){
			var rule = rules[ruleIndex];
			if(typeof rule.symbolizer != "undefined" && typeof rule.title != "undefined" && rule.title){
				var legendDom = $('<div class="legend-item-div"><div class="legend-span"><span class="legend-color-box" style="background-color:'+rule.symbolizer.fillColor+'"></span><span class="legend-title" >'+rule.title+'</span></div></div>');
				legendDom.find('.legend-color-box').css({opacity: rule.symbolizer.fillOpacity + 0.2});
				legendDom.appendTo($('#'+containerId));				
			}
		}
		//creating legend panel title
		$('#legend-panel-title').text(legendPanelTitle);
	}else{
		console.warn('Layer Style\'s default rules are zero, null or undefined');
		return false;
	}
}

var turnoutScalingRules = [
	new OpenLayers.Rule({
		title: " < 10% ",
		maxScaleDenominator: 30000000,
		symbolizer: {
			graphicName: false,
			pointRadius: 6,
			fillColor: "#48935A",
			strokeColor: "#666666",
			strokeWidth: 1,
			fillOpacity: 0.4
		}
	}),
	new OpenLayers.Rule({
		title: "11% - 15%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.15,
			lowerBoundary: 0.100009
		}),
		symbolizer: {
			fillColor: "#94AA33",
			fillOpacity: 0.4				
		}
	}),
	new OpenLayers.Rule({
		title: "16% - 20%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.20,
			lowerBoundary: 0.150009
		}),
		symbolizer: {
			fillColor: "#BAA71D",
			fillOpacity: 0.4				
		}
	}),
	new OpenLayers.Rule({
		title: "21% - 25%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.25,
			lowerBoundary: 0.200009
		}),
		symbolizer: {
			fillColor: "#C45E15",
			fillOpacity: 0.4				
		}
	}),
	new OpenLayers.Rule({
		title: "26% - 30%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.30,
			lowerBoundary: 0.250009
		}),
		symbolizer: {
			fillColor: "#593B77",
			fillOpacity: 0.4				
		}
	}),
	new OpenLayers.Rule({
		title: "31% - 35%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.35,
			lowerBoundary: 0.300009
		}),
		symbolizer: {
			fillColor: "#7A2793",
			fillOpacity: 0.5				
		}
	}),
	new OpenLayers.Rule({
		title: "35% - 40%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.40,
			lowerBoundary: 0.350009
		}),
		symbolizer: {
			fillColor: "#DD2E74",
			fillOpacity: 0.4				
		}
	}),
	new OpenLayers.Rule({
		title: "41% - 45%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.45,
			lowerBoundary: 0.400009
		}),
		symbolizer: {
			fillColor: "#EE2E74",
			fillOpacity: 0.5				
		}
	}),
	new OpenLayers.Rule({
		title: "46% - 50%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "turnout",
			upperBoundary: 0.50,
			lowerBoundary: 0.450009
		}),
		symbolizer: {
			fillColor: "#FA2E74",
			fillOpacity: 0.7				
		}
	}),					
	new OpenLayers.Rule({
		title: " > 50%",
		maxScaleDenominator: 30000000,
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.GREATER_THAN,
			property: "turnout",
			value: 0.500009
		}),
		symbolizer: {
			fillColor: "#FF2104",
			fillOpacity: 0.9			
		}
	})					
];

function fateek_remove_css_rules(rulesArray, hrefs){
	if(typeof rulesArray.length == "undefined")
		rulesArray = [rulesArray];
		
	if(typeof hrefs.length == "undefined")
		hrefs = [hrefs];
	
	styleSheets = document.styleSheets;
	for(sIndex in styleSheets){
		styleSheet = styleSheets[sIndex];
		if(styleSheet){
			for(hIndex in hrefs){
				href = hrefs[hIndex];
				if(href && styleSheet.href){
					if(styleSheet.href.indexOf(href) > -1){
						for(rIndex in rulesArray){
							rule = rulesArray[rIndex];
							styleSheet.deleteRule(rule);
						}
					}					
				}
			}
		}
	}
}