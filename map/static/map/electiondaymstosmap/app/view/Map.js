/**
 * The GeoExt.panel.Map used in the application.  Useful to define map options
 * and stuff.
 * @extends GeoExt.panel.Map
 */
Ext.define('DCG.view.Map', {
    // Ext.panel.Panel-specific options:
    extend: 'GeoExt.panel.Map',
    alias : 'widget.cf_mappanel',
    requires: [
        'Ext.window.MessageBox',
        'GeoExt.Action',
        'DCG.view.help.Action',
		'Ext.form.field.ComboBox',
		'Ext.XTemplate',
		'GeoExt.panel.Legend',
		'Ext.layout.AbsoluteLayout'
    ],
    border: 'false',
    layout: 'absolute',
    region: 'west',
    width: 800,
    // GeoExt.panel.Map-specific options :
    center: '31.222197,71.40747',
    zoom: 7,

    initComponent: function() {
        var me = this,
            items = [],
            ctrl;

        var map = new OpenLayers.Map();
		map.setOptions({restrictedExtent: new OpenLayers.Bounds(6776974.417305551, 2716247.7922399966,8828454.039573975, 4451578.67963478)});

        // ZoomToMaxExtent control, a "button" control
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text: "max extent",
            tooltip: "zoom to max extent"
        })));

        items.push("-");

        // Navigation control
        items.push(Ext.create('Ext.button.Button',Ext.create('GeoExt.Action', {
            text: "nav",
            control: new OpenLayers.Control.Navigation(),
            map: map,
            // button options
            toggleGroup: "draw",
            allowDepress: false,
            pressed: true,
            tooltip: "navigate",
            // check item options
            group: "draw",
            checked: true
        })));

        items.push("-");

        // Navigation history - two "button" controls
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);
        
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "previous",
            control: ctrl.previous,
            disabled: true,
            tooltip: "previous in history"
        })));
        
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "next",
            control: ctrl.next,
            disabled: true,
            tooltip: "next in history"
        })));
        items.push("->");
		
		me.violationsComboBox = Ext.create('Ext.form.ComboBox', {
			itemId: 'incidentTypeComboBox',
			fieldLabel: 'Select Incident Type',
			queryMode: 'local',
			labelWidth: 120,
			width: 370,
			valueField: 'category',
			store: Ext.create('Ext.data.Store', {
				fields: ['category', 'occurrence', 'incidents'],
				data : [
						{category: 'All'},
						{category: 'Changes in Polling Scheme'}, 
						{category: 'Violence'},
						{category: 'Illegal/Fraudulent Voting'},
						{category: 'Interference by Security/other Officials'},
						{category: 'Polling Station Capture'},
						{category: 'Restrictions to Observation'},
						{category: 'Partisan Election/Security Officials'},
						{category: 'Any Other'}
				]
			}),
			forceSelection: false,
			emptyText: 'All Types',
			// Template for the dropdown menu.
			// Note the use of "x-boundlist-item" class,
			// this is required to make the items selectable.
			tpl: Ext.create('Ext.XTemplate',
				'<tpl for=".">',
					'<div class="x-boundlist-item">{category} <span style="font-size:10px;float:right;"><strong style="color:tomato;">{occurrence}</strong> Incident(s)</span> </div>',
				'</tpl>'
			),
			// template for the content inside text field
			displayTpl: Ext.create('Ext.XTemplate',
				'<tpl for=".">',
					'{category}',
				'</tpl>'
			)
		});
		items.push(me.violationsComboBox);
        // Help action
        /*items.push(
            Ext.create('Ext.button.Button', Ext.create('DCG.view.help.Action', {
                windowContentEl: "help"
            }))
        );*/
		map.legendPanel = Ext.create('GeoExt.panel.Legend', {
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px'
            },
			layout: 'fit',
            bodyStyle: 'padding:5px',
            width: 350,
            autoScroll: true,
        });
		
        Ext.apply(me, {
            map: map,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
				height: 30,
                items: items,
                style: {
                    border: 0,
                    padding: 0
                }
            }],
			items: [{
				xtype: 'panel',
				x:640,
				y:430,
				width: 160,
				height:170,
				html: '<div id="ext-comp-1002" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen7"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen8"><div id="ext-comp-1002-OpenLayers.Layer.Vector_14"><label id="ext-comp-1003" class=" x-form-item x-form-item-label">Legend</label><div id="ext-comp-1004"><div id="ext-comp-1005" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen12"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen13"><div class="x-column-inner" id="ext-gen30" style="width: 150px;"><div id="ext-comp-1006" class=" x-column"><svg id="ext-comp-1006_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1006_root" transform=""><g id="ext-comp-1006_vroot"><path id="OpenLayers.Geometry.Polygon_59529" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#2ECBEA" fill-opacity="0.1" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1006_troot"/></g></svg></div><div id="ext-comp-1007" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen32"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen33" style="background: none repeat scroll 0% 0% transparent;">No Incidents</div></div></div><div class="x-clear" id="ext-gen31"></div></div></div></div></div><div id="ext-comp-1008" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen15"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen16"><div class="x-column-inner" id="ext-gen35" style="width: 150px;"><div id="ext-comp-1009" class=" x-column"><svg id="ext-comp-1009_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1009_root" transform=""><g id="ext-comp-1009_vroot"><path id="OpenLayers.Geometry.Polygon_59541" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#93BC8B" fill-opacity="0.4" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1009_troot"/></g></svg></div><div id="ext-comp-1010" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen37"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen38" style="background: none repeat scroll 0% 0% transparent;">1 - 10</div></div></div><div class="x-clear" id="ext-gen36"></div></div></div></div></div><div id="ext-comp-1011" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen18"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen19"><div class="x-column-inner" id="ext-gen40" style="width: 150px;"><div id="ext-comp-1012" class=" x-column"><svg id="ext-comp-1012_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1012_root" transform=""><g id="ext-comp-1012_vroot"><path id="OpenLayers.Geometry.Polygon_59553" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#776E17" fill-opacity="0.4" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1012_troot"/></g></svg></div><div id="ext-comp-1013" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen42"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen43" style="background: none repeat scroll 0% 0% transparent;">11 - 20</div></div></div><div class="x-clear" id="ext-gen41"></div></div></div></div></div><div id="ext-comp-1014" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen21"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen22"><div class="x-column-inner" id="ext-gen45" style="width: 150px;"><div id="ext-comp-1015" class=" x-column"><svg id="ext-comp-1015_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1015_root" transform=""><g id="ext-comp-1015_vroot"><path id="OpenLayers.Geometry.Polygon_59565" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#DAEA2E" fill-opacity="0.4" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1015_troot"/></g></svg></div><div id="ext-comp-1016" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen47"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen48" style="background: none repeat scroll 0% 0% transparent;">21 - 30</div></div></div><div class="x-clear" id="ext-gen46"></div></div></div></div></div><div id="ext-comp-1017" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen24"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen25"><div class="x-column-inner" id="ext-gen50" style="width: 150px;"><div id="ext-comp-1018" class=" x-column"><svg id="ext-comp-1018_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1018_root" transform=""><g id="ext-comp-1018_vroot"><path id="OpenLayers.Geometry.Polygon_59577" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#FCB932" fill-opacity="0.4" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1018_troot"/></g></svg></div><div id="ext-comp-1019" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen52"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen53" style="background: none repeat scroll 0% 0% transparent;">31 - 40</div></div></div><div class="x-clear" id="ext-gen51"></div></div></div></div></div><div id="ext-comp-1020" class=" x-panel x-panel-noborder"><div class="x-panel-bwrap" id="ext-gen27"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder x-column-layout-ct" id="ext-gen28"><div class="x-column-inner" id="ext-gen55" style="width: 150px;"><div id="ext-comp-1021" class=" x-column"><svg id="ext-comp-1021_svgRoot" width="20" height="20" viewBox="0 0 20 20"><g id="ext-comp-1021_root" transform=""><g id="ext-comp-1021_vroot"><path id="OpenLayers.Geometry.Polygon_59589" d=" M 2,14 4,16 16,16 18,14 18,6 16,4 4,4 2,6 2,14 z" fill-rule="evenodd" fill="#A32420" fill-opacity="0.4" stroke="#666666" stroke-opacity="1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g><g id="ext-comp-1021_troot"/></g></svg></div><div id="ext-comp-1022" class=" x-panel x-form-item x-panel-noborder x-column" style="padding: 0.2em 0.5em 0px;"><div class="x-panel-bwrap" id="ext-gen57"><div class="x-panel-body x-panel-body-noheader x-panel-body-noborder" id="ext-gen58" style="background: none repeat scroll 0% 0% transparent;"> &gt; 40</div></div></div><div class="x-clear" id="ext-gen56"></div></div></div></div></div></div></div></div></div></div>',
				bodyStyle: {
					zIndex: 800,
					textAlign: 'center',
					padding: 10
				}
			}]
        });
        
		layerSwitcher = new OpenLayers.Control.LayerSwitcher();
		layerSwitcher.ascending = false;
		layerSwitcher.useLegendGraphics = true;
		map.addControl(layerSwitcher);
        
		me.callParent(arguments);
    }
});