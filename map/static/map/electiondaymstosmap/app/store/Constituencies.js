/**
 * The store used for summits
 */
Ext.define('DCG.store.Constituencies', {
    extend: 'Ext.data.Store',
	requires: [
		'Ext.data.proxy.Direct'
	],
    fields:[//Inline Model
		{name: 'id', type:'string'},
		{name: 'constituency_id', type:'string'},
		{name: 'district_id', type:'string'}, //may contain multiple slash separated district ids
		{name: 'name', type:'string'},
		{name: 'geojson', type:'string'},
		{name: 'occurrence', type:'int', defaultValue: 0},
		{name: 'Any Other', type:'int', defaultValue: 0},
		{name: 'Changes in Polling Scheme', type:'int', defaultValue: 0},
		{name: 'Misuse of State Resources', type:'int', defaultValue: 0},
		{name: 'Violation of Code of Conduct', type:'int', defaultValue: 0},
		{name: 'Fairness of Proceses', type:'int', defaultValue: 0},
		{name: 'Violence', type:'int', defaultValue: 0},
		{name: 'Illegal/Fraudulent Voting', type:'int', defaultValue: 0},
		{name: 'Interference by Security/other Officials', type:'int', defaultValue: 0},
		{name: 'Polling Station Capture', type:'int', defaultValue: 0},
		{name: 'Restrictions to Observation', type:'int', defaultValue: 0},
		{name: 'Election Administration', type:'int', defaultValue: 0},
		{name: 'Partisan Election/Security Officials', type:'int', defaultValue: 0},
		{name: 'Others', type:'int', defaultValue: 0},
		{name: 'incidentsCalculated', type:'boolean', defaultValue: false}
	],
    proxy: {
        type: 'direct',
        directFn: Ext.GisApi.Constituency.get_all_with_geojsonstring,
        //paramOrder: 'id' // Tells the proxy to pass the id as the first parameter to the remoting method.
    },
	autoLoad: true
});

/*
	Any Other
	Changes in Polling Scheme
	Misuse of State Resources
	Violation of Code of Conduct
	Fairness of Proceses	
	Violence
	Illegal/Fraudulent Voting
	Interference by Security/other Officials
	Polling Station Capture	
	Restrictions to Observation
	Election Administration
		
		Others
	

	
		
		
*/