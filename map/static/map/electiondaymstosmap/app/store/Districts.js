/**
 * The store used for summits
 */
Ext.define('DCG.store.Districts', {
    extend: 'Ext.data.Store',
    fields:[//Inline Model
		{name: 'id', type:'int'},
		{name: 'occurrence', type:'int'},
		{name: 'name', type:'string'},
		{name: 'province', type:'string'}
	],
	sorters:[{
		property: 'province',
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
	autoLoad: true
});
