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
            store: 'ViolationOccurrences',
            style: 'background:#fff',
			animate: true,
            axes: [{
                type: 'Numeric',
                position: 'left',
                fields: ['occurrence'],
                title: this.leftAxeTitleText,
                grid: true,
                minimum: 0,
				adjustMaximumByMajorUnit: false,
				adjustMinimumByMajorUnit: false,
				minorTickSteps: 3,
				majorTickSteps: 7,
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['category'],
                title: this.bottomAxeTitleText
            }],
            series: [{
                type: 'line',
                axis: 'left',
                fill: true,
                listeners: {
                    itemmousedown: function(e) {
                        //DCG.view.summit.Grid.selectionModel.select(e.storeItem);
                    }
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
                    width: 130,
                    height: 60,
                    renderer: function(storeItem, item) {
                        this.setTitle(
                            storeItem.get('category') +
                            '<br />' +
                            'observed ' + item.value[1] + ' times'
                        );
                    }
                },
                title: [
                    this.leftAxeTitleText
                ],
                xField: 'category',
                yField: ['occurrence']
            }],
			listeners:{
				//beforestaterestore: function(){console.log('beforestaterestore');}
			}
        });
        this.callParent(arguments);
    }
});
