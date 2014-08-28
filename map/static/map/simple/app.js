/**
 * Ext.Loader
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: base_url + 'assets/map/GeoExt',
        // for dev use
        Ext: base_url + 'assets/map/ext/src'
        // for build purpose
        //Ext: "extjs-4.1.0/src"
    }
});
/**
 * CF.app
 * A MVC application demo that uses GeoExt and Ext components to display
 * geospatial data.
 */
Ext.application({
    name: 'CF',
    appFolder: base_url + 'assets/map/simple/app',
    controllers: [
        'Map'
    ],
    autoCreateViewport: true,
	launch: function(){
		//Ext.create('CF.view.PortalPanel');
	}
});

/**
 * For dev purpose only
 */
var ctrl, map, mapPanel, iStore, vStore;
