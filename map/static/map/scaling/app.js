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
    name: 'Scaling', //LocationIncidentMap
	errorMessages: Array(),
    appFolder: base_url + 'assets/map/scaling/app',
    controllers: [
        'Map'
    ],
    autoCreateViewport: false,
	launch: function(){
		/**
		  *	Required global/external vars: incident_id, location_id, controller_name
		  */
		this.activeView = Ext.create('Scaling.view.DistrictMapPanel');
	}
});
