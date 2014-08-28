/**
 * The store used for showing violation category/theme / number of occurrence
 */
Ext.define('CF.store.ViolationOccurrences', {
    extend: 'Ext.data.Store',
    fields:[//Inline Model
		{name: 'category', type:'string'},
		{name: 'occurrence', type:'int'},
		{name: 'locations', type:'int'}
	],
    autoLoad: false
});
