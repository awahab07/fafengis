Ext.define('Scaling.view.ViolationChart', {
    extend: 'Ext.chart.Chart',
    alias : 'widget.violationchart',
    requires: ['Ext.chart.*'],
	layout: 'fit',
	theme: 'Base:gradients',
    // i18n properties
    bottomAxeTitleText: "Violation Type",
    leftAxeTitleText: "No. of Incidents",

    initComponent: function() {
        Ext.apply(this, {
            legend: {
                position: 'right'
            },
            shadow: true,
            store: 'ViolationOccurrences',
            style: 'background:#fff',
			height: 300,
			width: 350,
			series: [{
				type: 'pie',
				angleField: 'occurrence',
				showInLegend: true,
				tips: {
					trackMouse: true,
					width: 140,
					height: 50,
					renderer: function(storeItem, item) {
						// calculate and display percentage on hover
						var total = 0;
						storeItem.store.each(function(rec) {
							total += rec.get('occurrence');
						});
						this.setTitle(storeItem.get('category') + ': ' + Math.round(storeItem.get('occurrence') / total * 100) + '%');
					}
				},
				highlight: {
					segment: {
						margin: 20
					}
				},
				label: {
					field: 'category',
					display: 'rotate',
					contrast: true,
					font: '10px Arial'
				}
			}]
        });
        this.callParent(arguments);
    }
});
