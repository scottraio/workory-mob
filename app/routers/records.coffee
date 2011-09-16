app 				= require("helpers/app")
RecordsShow 	= require("views/records/show").RecordsShow

class exports.RecordsRouter extends Backbone.Router
	
	routes:
		"/books/:book_id/records/:id" : "show"
				
	show: (book_id, id) ->
		$.getJSON app.base_path() + "/books/#{book_id}/records/#{id}.json?callback=?", (data) ->
			show = new RecordsShow(item: data, el: $("#page"))
			show.render()