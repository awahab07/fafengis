/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('DCG.view.Viewport', {
    extend: 'Ext.Viewport',
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
            items: [{
                xtype: 'panel',
                border: false,
                layout: 'border',
                dockedItems: [
                    Ext.create('DCG.view.Header')
                ],
                items: [{
                    xtype: 'cf_mappanel'
                },
				{
                    xtype: 'panel',
                    region: 'center',
                    border: false,
                    id    : 'viewport',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        Ext.create('DCG.view.summit.Grid'),
                        {xtype: 'splitter'},
                        Ext.create('DCG.view.summit.Chart')
                    ]
                }]
            }]
        });

        me.callParent(arguments);
    }
});
