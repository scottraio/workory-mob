app = require("helpers/app")

class exports.FormsShow extends Backbone.View
		
	initialize: ->
		app.back_button("Forms")
		
	render: => 
		$("#content").html ich.formshow
			items: this.options.items.toJSON()
			textbox: 		() -> true if this.field_type is "textbox"
			email: 			() -> true if this.field_type is "email"
			select: 		() -> true if this.field_type is "select"
			phone: 			() -> true if this.field_type is "phone_number"
			paragraph: 	() -> true if this.field_type is "textarea"
