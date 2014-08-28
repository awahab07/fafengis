/**
 * Query Map Window with static content using 'contentEl' property.
 * @extends Ext.window.Window
 */
Ext.define('DCG.view.querymap.QueryMapWindow', {
    extend: 'Ext.window.Window',
    alias : 'widget.query_map_window',
    require: [
        'DCG.view.querymap.QueryMapPanel'
    ],
    initComponent: function() {
        console.log('initComponent, QueryMapWindow');
        Ext.apply(this, {
            closeAction: "hide",
            layout: 'fit',
            title: "Mark specific area on map to show statistics",
            items: [
                Ext.create('DCG.view.querymap.QueryMapPanel', {
                    
                })
            ]
        });
        this.callParent(arguments);
    }
});