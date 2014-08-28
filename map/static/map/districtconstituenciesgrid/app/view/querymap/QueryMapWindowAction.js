/**
 * Help Action
 * @extends Ext.Action
 */
Ext.define('DCG.view.querymap.QueryMapWindowAction', {
    extend: 'Ext.Action',
    alias : 'widget.dcg_query_map_action',
    requires: ['DCG.view.querymap.QueryMapWindow'],

    /**
     * @property {String} windowContentEl
     * Sets the window contentEl property
     */
    /**
     * @cfg {Boolean} activateOnEnable
     *  Sets the window contentEl property
     */
    mapWindowContentEl: null,

    /**
     * @private
     * @cfg {_window}
     *  The instance of the help window created.
     */
    _window: null,

    /**
     * @private
     *
     * Create a CF.view.help.Action instance.
     *
     * @param {Object} config (optional) Config object.
     *
     */
    constructor: function(config) {
        console.log("Constructor for MapWindow");
        Ext.apply(config, {
            handler: function() {
                if (!this._window) {
                    this._window = Ext.create('DCG.view.querymap.QueryMapWindow', {
                        contentEl: this.mapWindowContentEl
                    });
                }
                this._window.show();
            },
            text: "Query Map"
        });
        this.callParent(arguments);
    }
});