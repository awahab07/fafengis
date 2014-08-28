Ext.define('DCG.view.summit.Chart', {
    extend: 'Ext.chart.Chart',
    alias : 'widget.summitchart',
    requires: ['Ext.chart.*'],

    // i18n properties
    bottomAxeTitleText: "Violation Type",
    leftAxeTitleText: "No. of Incidents",

    initComponent: function() {
        Ext.apply(this, {
            flex: 1,
            legend: {
                position: 'right'
            },
            shadow: true,
            store: 'Provinces',
            style: 'background:#fff',
			animate: true,
            axes: [{
                    type: 'Numeric',
                    position: 'left',
                    fields: [
						'Changes in Polling Scheme', 
						'Violence','Illegal/Fraudulent Voting',
						'Interference by Security/other Officials',
						'Polling Station Capture',
						'Restrictions to Observation',
						'Partisan Election/Security Officials',
						'Any Other'
						],
                    minimum: 0,
                    label: {
                        renderer: function(v) {
                            return v.toFixed(0);
                        }
                    },
                    title: 'Violations On Polling Day'
                },
                {
                    type: 'Category',
                    position: 'bottom',
                    fields: ['name'],
                    title: 'Regions'
                }],
                series: [{
                    type: 'column',
                    axis: 'left',
                    highlight: true,
 
                    label: {
                        fields: [
						'Changes in Polling Scheme', 
						'Violence','Illegal/Fraudulent Voting',
						'Interference by Security/other Officials',
						'Polling Station Capture',
						'Restrictions to Observation',
						'Partisan Election/Security Officials',
						'Any Other'
						]
                    },
					highlight: {
						size: 7,
						radius: 7
					},
					markerConfig: {
						type: 'circle',
						size: 4,
						radius: 4,
						'stroke-width': 0
					},
					smooth: true,
					tips: {
						trackMouse: true,
						width: 150,
						renderer: function(storeItem, item) {
							this.setTitle(
								item.yField + ' At <br />'+
								item.value[0] + '<br />' +
								'observed ' + item.value[1] + ' times'
							);
						}
					},					
                    xField: 'name',
                    yField:  [
						'Changes in Polling Scheme', 
						'Violence','Illegal/Fraudulent Voting',
						'Interference by Security/other Officials',
						'Polling Station Capture',
						'Restrictions to Observation',
						'Partisan Election/Security Officials',
						'Any Other'
						]
                }],
                interactions: [{
                    type: 'panzoom',
                    axes: ['bottom']
                }],
			listeners:{
				//beforestaterestore: function(){console.log('beforestaterestore');}
			}
        });
        this.callParent(arguments);
    }
});
