app = require("helpers/app")

class exports.RecordsShow extends Backbone.View
		
	initialize: ->	
		app.back_button("Report")
	
	render: =>
		$("#content").html ich.recordshow
			item: this.options.item
			values: this.options.item.values