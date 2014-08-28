/**
 * Model for a summit
 */
Ext.define('DCG.model.Chart', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'violation_type', type: 'string'},
		{name: 'occurence', type: 'string'},
        {name: 'location', type: 'string'},
		{name: 'comments', type: 'string'},
		{name: 'district', type: 'string'},
		{name: 'tehsil', type: 'string'},
		{name: 'location_id', type: 'int'},
        {
            name: 'lat',
            convert: function(value, record) {
                // record.raw a OpenLayers.Feature.Vector instance
                if (record.raw instanceof OpenLayers.Feature.Vector &&
                    record.raw.geometry instanceof OpenLayers.Geometry.Point) {
                    return record.raw.geometry.y;
                } else {
                    return "This is not a Feature or geometry is wrong type";
                }
            }
        },
        {
            name: 'lon',
            convert: function(value, record) {
                // record.raw a OpenLayers.Feature.Vector instance
                if (record.raw instanceof OpenLayers.Feature.Vector) {
                    return record.raw.geometry.x;
                } else {
                    return "This is not a Feature or geometry is wrong type";
                }
            }
        }
    ]
});
