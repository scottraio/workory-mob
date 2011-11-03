class exports.ReportsIndex extends Backbone.View
	
	initialize: ->
		app.ui.set_title("Reports")
		app.ui.set_navbar("reports")
		app.ui.no_buttons()
		
	render: => 
		$("#content").html ich.navlist
			items: this.options.items.toJSON()
			url: () -> "#/books/#{this.book_id}/reports/#{ this.id }"
		app.ui.bind_pressed_event()
