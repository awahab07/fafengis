/**
 * The application header displayed at the top of the viewport
 * @extends Ext.Component
 */
Ext.define('DCG.view.Header', {
    extend: 'Ext.Component',

    dock: 'top',
    baseCls: 'cf-header',

    initComponent: function() {
        Ext.applyIf(this, {
            html: '<img width="48" height="48" src="'+base_url+'assets/images/logo.png" style="float:left;margin:0;padding:0;" /><div>Reported Incidents</div>'
        });

        this.callParent(arguments);
    }
});
