class exports.ReportsCollection extends Backbone.Collection
	
	model		: 	app.models.report
	sync		: 	app.ui.JSONPSync
	url			:		app.ui.get("/accounts/1/reports.json?callback=?")
	