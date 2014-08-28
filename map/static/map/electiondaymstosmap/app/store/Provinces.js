/**
 * The store used for summits
 */
Ext.define('DCG.store.Provinces', {
    extend: 'Ext.data.Store',
    fields:[//Inline Model
		{name: 'id', type:'int'},
		{name: 'name', type:'string'},
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
		{name: 'Any Other', type:'int', defaultValue: 0},		
		{name: 'incidentsCalculated', type:'boolean', defaultValue: false}
	],
	sorters:[{
		property: 'name',
		direction: 'ASC'
	}],
	proxy: {
	 type: 'ajax',
	 url: base_url + 'map/get_districts_and_count_incidents/' + province,
	 reader: {
		 type: 'json',
		 root: 'districts'
	 }
	},	
	autoLoad: false
});
