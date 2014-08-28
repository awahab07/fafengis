/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('DCG.view.PortalPanel', {
    extend: 'Ext.panel.Panel',

    title: 'Results',
    renderTo: 'ext-container',
    layout: 'fit',

    requires: [
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
        'DCG.view.Header',
        'DCG.view.Map',
        'DCG.view.summit.Chart',
        'DCG.view.summit.Grid'
    ],

    initComponent: function() {
        var me = this;
        Ext.apply(me, {
			items: [{               // Results grid specified as a config object with an xtype of 'grid'
				xtype: 'grid',
				columns: [{header: 'Column One'}],            // One header just for show. There's no data,
				store: Ext.create('Ext.data.ArrayStore', {}), // A dummy empty data store
				flex: 1                                       // Use 1/3 of Container's height (hint to Box layout)
			}, {
				xtype: 'splitter'   // A splitter between the two child items
			}, {                    // Details Panel specified as a config object (no xtype defaults to 'panel').
				title: 'Details',
				bodyPadding: 5,
				items: [{
					fieldLabel: 'Data item',
					xtype: 'textfield'
				}], // An array of form fields
				flex: 2             // Use 2/3 of Container's height (hint to Box layout)
			}]
        });

        me.callParent(arguments);
    }
});