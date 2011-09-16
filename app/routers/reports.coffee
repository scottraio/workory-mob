app 									= require("helpers/app")

ReportsCollection 		= require("collections/reports").ReportsCollection
RecordsCollection 		= require("collections/records").RecordsCollection

ReportsIndex 					= require("views/reports/index").ReportsIndex
ReportsShow 					= require("views/reports/show").ReportsShow

class exports.ReportsRouter extends Backbone.Router
	
	routes:
		"reports"											: "index"
		"/books/:book_id/reports/:id" : "show"
	
	initialize: (user) ->
		this.options = 
			user: user
	
	index: ->
		reports 		= new ReportsCollection()
		reports.url = app.base_path() + "/accounts/#{this.options.user.account_id}/reports.json?callback=?"
		
		reports.fetch
			success: (collection, resp) ->
				index = new ReportsIndex(items: reports, el: $("#page"))
				index.render()
				
			error: (resp, error) ->
				console.log error	
				
	show: (book_id, id) ->
		records = new RecordsCollection()
		records.url = app.base_path() + "/books/#{book_id}/reports/#{id}.json?callback=?"
		records.fetch
			success: (collection, resp) ->
				show = new ReportsShow(items: records, el: $("#page"))
				show.render()
			error: (resp, error) ->
				console.log error