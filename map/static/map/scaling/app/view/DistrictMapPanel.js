/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('Scaling.view.DistrictMapPanel', {
    extend: 'Ext.panel.Panel',
	requires: [
		'Ext.layout.container.Absolute',
		'Scaling.view.ViolationChart',
		'Scaling.view.Map'
	],
    title: 'District',
    renderTo: 'ext-map-panel',
    layout: 'absolute',
	height: 600,
    requires: [
		'Scaling.view.Map',
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
    ],

    initComponent: function() {
        var me = this;
        Ext.apply(me, {
			items: [{               // Results grid specified as a config object with an xtype of 'grid'
				xtype: 'scaling_mappanel',// The Map view panel
				height: 400,
				width: 600,
				region: 'west'
			},
			{
				xtype: 'violationchart',
				width: 400,
				height: 400,
				x: 600
			},
			{
				xtype: 'incidentsgrid',
				height: 200,
				y: 400
			}]
        });

        me.callParent(arguments);
    }
});