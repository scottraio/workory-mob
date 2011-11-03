class exports.RecordsRouter extends Backbone.Router
	
	routes:
		"/books/:book_id/records/:id" : "show"
				
	show: (book_id, id) ->
		$.getJSON app.ui.get("/books/#{book_id}/records/#{id}.json?callback=?"), (data) ->
			show = new app.views.records.show({ item: data, el: $("#page") })
			show.render()