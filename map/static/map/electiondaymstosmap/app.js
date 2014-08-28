/**
 * Ext.Loader
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: static_app_path + 'GeoExt',
        // for dev use
        Ext: static_app_path + 'ext/src'
        // for build purpose
        //Ext: "extjs-4.1.0/src"
    }
});

//Javascript global vars Required: province

Ext.application({
    name: 'DCG',
    appFolder: static_app_path + 'electiondaymstosmap/app',
    controllers: [
        'Map'
    ],
    requires:[
    'Ext.direct.*'
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
