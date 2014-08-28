/**
 * The store used for summits
 */
Ext.define('Scaling.store.Districts', {
    extend: 'GeoExt.data.FeatureStore',
    model: 'Scaling.model.District',
    autoLoad: false,
	groupField: 'name'
});
