app 									= require("helpers/app")

FormsCollection 			= require("collections/forms").FormsCollection
FormFieldsCollection 	= require("collections/form_fields").FormFieldsCollection

FormsIndex 						= require("views/forms/index").FormsIndex
FormsShow 						= require("views/forms/show").FormsShow



class exports.FormsRouter extends Backbone.Router
	
	routes:
		"forms"											: "index"
		"/books/:book_id/forms/:id" : "show"
	
	initialize: (user) ->
		this.options = 
			user: user
	
	index: ->
		forms 		= new FormsCollection()
		forms.url = app.base_path() + "/accounts/#{this.options.user.account_id}/forms.json?callback=?"
		forms.fetch	
			success: (collection, resp) ->
				index = new FormsIndex(items: forms, el: $("#page"))
				index.render()
			error: (resp, error) ->
				console.log error
				
	show: (book_id, id) ->
		fields = new FormFieldsCollection()
		fields.url = app.base_path() + "/books/#{book_id}/forms/#{id}.json?callback=?"
		fields.fetch
			success: (collection, resp) ->
				show = new FormsShow(items: fields, el: $("#page"))
				show.render()
			error: (resp, error) ->
				console.log error