/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('Scaling.view.Error', {
    extend: 'Ext.panel.Panel',
	alias: 'widget.lim_error',
    title: 'Error',
    renderTo: 'ext-container',
    layout: 'fit',
	height: 600,
	errorMessage: 'Error',
    requires: [
		'Scaling.view.Map',
        'Ext.layout.container.Border',
        'Ext.resizer.Splitter',
    ],

    initComponent: function() {
        var me = this;
        Ext.apply(me, {
			items: [{               // Results grid specified as a config object with an xtype of 'grid'
				xtype: 'text',
				color: 'red',
				text: this.errorMessage,
				height: 100
			}, ]
        });

        me.callParent(arguments);
    }
});