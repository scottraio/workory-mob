app 		= require("helpers/app")
Report 	= require("models/report").Report

class exports.ReportsCollection extends Backbone.Collection
	
	sync		: 	app.JSONPSync
	url			: 	app.base_path() + "/accounts/1/reports.json?callback=?"
	model		: 	Report