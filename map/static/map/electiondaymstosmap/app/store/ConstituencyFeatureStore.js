/**
 * The store used for summits
 */
Ext.define('DCG.store.ConstituencyFeatureStore', {
    extend: 'GeoExt.data.FeatureStore',
    fields:[//Inline Model
		{name: 'All', type:'int', defaultValue: 0},
		{name: 'Misuse of State Resources', type:'int', defaultValue: 0},
		{name: 'Violation of Code of Conduct', type:'int', defaultValue: 0},
		{name: 'Posting and Transfer', type:'int', defaultValue: 0},
		{name: 'Fairness of Proceses', type:'int', defaultValue: 0},
		{name: 'Violence', type:'int', defaultValue: 0},
		{name: 'Election Administration', type:'int', defaultValue: 0},
		{name: 'Nomination Process', type:'int', defaultValue: 0},
		{name: 'Electoral Transparency', type:'int', defaultValue: 0},
		{name: 'Others', type:'int', defaultValue: 0}
	],
	autoLoad: false
});
