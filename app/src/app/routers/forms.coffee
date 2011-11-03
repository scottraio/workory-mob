class exports.FormsRouter extends Backbone.Router
	
	routes:
		"forms"											: "index"
		"/books/:book_id/forms/:id" : "show"
	
	index: ->
		forms 		= new app.collections.forms()
		forms.fetch	
			success: (collection, resp) ->
				index = new app.views.forms.index items: forms, el: $("#page")
				index.render()
			error: (resp, error) ->
				console.log error
				
	show: (book_id, id) ->
		fields = new app.collections.forms.fields()
		fields.url = app.ui.get("/books/#{book_id}/forms/#{id}.json?callback=?")
		fields.fetch
			success: (collection, resp) ->
				show = new app.views.forms.show items: fields, el: $("#page")
				show.render()
			error: (resp, error) ->
				console.log error