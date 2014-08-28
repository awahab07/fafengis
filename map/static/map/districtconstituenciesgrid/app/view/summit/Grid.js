/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('DCG.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.summitgrid',
    requires: [
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number',
		'Ext.ux.grid.FiltersFeature'
    ],
    initComponent: function() {
		var filters = {
			ftype: 'filters',
			// encode and local configuration options defined previously for easier reuse
			local: true,   // defaults to false (remote filtering)
			encode: false,
	
			// Filters are most naturally placed in the column definition, but can also be
			// added here.
			filters: [{
				type: 'string',
				dataIndex: 'name'
			},{
				type: 'string',
				dataIndex: 'province'
			},{
				type: 'int',
				dataIndex: 'occurrence'
			}]
		};
		
        Ext.apply(this, {
            border: false,
            columns: [
                {header: 'District', dataIndex: 'name', flex: 1},
				{header: 'Province', dataIndex: 'province', flex: 1},
				{header: 'Incidents', dataIndex: 'occurrence', flex: 1},
            ],
            flex: 1,
            store: 'Districts',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ],
			features: [filters],
			emptyText: 'No matching locations'
        });
        this.callParent(arguments);
        // store singleton selection model instance
        DCG.view.summit.Grid.selectionModel = this.getSelectionModel();
    }
});
