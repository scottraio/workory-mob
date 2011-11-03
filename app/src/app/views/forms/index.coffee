class exports.FormsIndex extends Backbone.View
		
	initialize: ->
		app.ui.set_title("Forms")
		app.ui.set_navbar("forms")
		app.ui.no_buttons()
		
	render: => 
		$("#content").html ich.navlist
			items: this.options.items.toJSON()
			url: () -> "#/books/#{this.book_id}/forms/#{ this.id }"
		#app.ui.bind_pressed_event()
