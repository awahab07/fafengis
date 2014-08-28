/**
 * Model for a summit
 */
Ext.define('Scaling.model.District', {
    extend: 'Ext.data.Model',
    fields: [
		{name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
		{name: 'occurence', type: 'int'}
    ]
});
