class exports.ReportsRouter extends Backbone.Router
	
	routes:
		"reports"											: "index"
		"/books/:book_id/reports/:id" : "show"
	
	index: ->		
		reports 		= new app.collections.reports()
		reports.fetch
			success: (collection, resp) ->
				index = new app.views.reports.index items: reports, el: $("#page")
				index.render()
			error: (resp, error) ->
				console.log error	
				
	show: (book_id, id) ->
		records = new app.collections.records()
		records.url = app.ui.get("/books/#{book_id}/reports/#{id}.json?callback=?")
		records.fetch
			success: (collection, resp) ->
				show = new app.views.reports.show items: records, el: $("#page") 
				show.render()
			error: (resp, error) ->
				console.log error