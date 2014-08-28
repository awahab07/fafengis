/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('CF.view.summit.Grid' ,{
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
				dataIndex: 'category'
			},{
				type: 'string',
				dataIndex: 'location'
			},{
				type: 'string',
				dataIndex: 'district'
			},{
				type: 'string',
				dataIndex: 'comments'
			},{
				type: 'string',
				dataIndex: 'location'
			},{
				type: 'date',
				dataIndex: 'time_stamp'
			}]
		};		
		
        Ext.apply(this, {
            border: false,
            columns: [
                {
                    header: '',
                    dataIndex: 'symbolizer',
                    menuDisabled: true,
                    sortable: false,
                    xtype: 'gx_symbolizercolumn',
                    width: 30
                },
                {header: 'ID', dataIndex: 'fid', width: 40},
                {header: 'Category', dataIndex: 'category', flex: 2},
				{header: 'Date & Time', dataIndex: 'time_stamp', flex: 2},
				{header: 'Location', dataIndex: 'location', flex: 2},
				{header: 'District', dataIndex: 'district', flex: 1},
                {header: 'Detail', dataIndex: 'comments', flex: 4},
				
            ],
            flex: 1,
            store: 'Summits',
            selType: 'featuremodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ],
			features: [filters],
			emptyText: 'No matching incidents'
        });
        this.callParent(arguments);
        // store singleton selection model instance
        CF.view.summit.Grid.selectionModel = this.getSelectionModel();
    }
});
