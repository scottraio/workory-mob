app = require("helpers/app")

class exports.ReportsIndex extends Backbone.View
	
	initialize: ->
		app.set_title("Reports")
		app.set_navbar("reports")
		app.no_buttons()
		
	render: => 
		$("#content").html ich.navlist
			items: this.options.items.toJSON()
			url: () -> "#/books/#{this.book_id}/reports/#{ this.id }"
		app.bind_pressed_event()


		