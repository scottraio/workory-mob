app = require("helpers/app")

class exports.FormsIndex extends Backbone.View
		
	initialize: ->
		app.set_title("Forms")
		app.set_navbar("forms")
		app.no_buttons()
		
	render: => 
		$("#content").html ich.navlist
			items: this.options.items.toJSON()
			url: () -> "#/books/#{this.book_id}/forms/#{ this.id }"
		app.bind_pressed_event()
