class exports.RecordsShow extends Backbone.View
		
	initialize: ->	
		app.ui.back_button("Report")
	
	render: =>
		app.ui.page("full")
		$("#content").html ich.recordshow
			item: this.options.item
			values: this.options.item.values