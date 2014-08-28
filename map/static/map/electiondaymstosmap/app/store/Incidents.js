/**
 * The store used for summits
 */
Ext.define('DCG.store.Incidents', {
    extend: 'Ext.data.Store',
    //model: 'DCG.model.Incident',
	fields:[
		{name: 'id', 				type: 'int'},
        {name: 'category', 			type: 'string'},
		{name: 'time_stamp', 		type: 'string'},
		{name: 'comments', 			type: 'string'},
        {name: 'location', 			type: 'string'},
		{name: 'district', 			type: 'string'},
		{name: 'tehsil', 			type: 'string'},
		{name: 'constituency', 		type: 'string'},
		{name: 'province', 			type: 'string'},
		{name: 'location_id', 		type: 'int'},
		{name: 'district_id', 		type: 'int'},
		{name: 'tehsil_id', 		type: 'int'},
		{name: 'constituency_id', 	type: 'string'},
		{name: 'province_id', 	type: 'int'},
		{name: 'lat', type: 'float'},
		{name: 'lng', type: 'float'},
	],
	proxy: {
	 type: 'ajax',
	 url: base_url + 'map/get_electionday_incidents/',
	 reader: {
		 type: 'json',
		 root: ''
	 }
	},
	autoLoad: false
});
