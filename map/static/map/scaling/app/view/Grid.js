/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('Scaling.view.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.incidentsgrid',
    requires: [
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number'
    ],
    initComponent: function() {
        Ext.apply(this, {
            border: false,
			autoScroll: true,
			height: 200,
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
            store: 'Incidents',
            selType: 'featuremodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ]
        });
        this.callParent(arguments);
        // store singleton selection model instance
        Scaling.view.Grid.selectionModel = this.getSelectionModel();
    }
});
