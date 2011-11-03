class exports.ReportsShow extends Backbone.View
	
	initialize: ->
		app.ui.back_button("Reports")
	
	render: =>
		$("#content").html ich.reportshow(items: this.options.items.toJSON())