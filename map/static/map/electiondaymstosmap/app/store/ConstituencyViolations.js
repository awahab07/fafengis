/**
 * The store used for summits
 */
Ext.define('DCG.store.ConstituencyViolations', {
    extend: 'Ext.data.Store',
    fields:[//Inline Model
		{name: 'id', type:'string'},
		{name: 'name', type:'string'},
		{name: 'occurrence', type:'int'},
		{name: 'province', type:'string'},
		{name: 'province_id', type:'int'}
	],
	sorters:[{
		property: 'province',
		direction: 'ASC'
	}],
	autoLoad: false
});
