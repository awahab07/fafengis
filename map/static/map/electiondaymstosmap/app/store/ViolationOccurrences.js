/**
 * The store used for showing violation category/theme / number of occurrence
 */
Ext.define('DCG.store.ViolationOccurrences', {
    extend: 'Ext.data.Store',
    fields:[//Inline Model
		{name: 'category', 		type:'string'},
		{name: 'percentage', 	type:'float'},
		{name: 'province', 		type:'string'},
		{name: 'province_id', 	type:'int'}
	],
    autoLoad: false
});
