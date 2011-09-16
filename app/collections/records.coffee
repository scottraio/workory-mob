app 		= require("helpers/app")
Record 	= require("models/record").Record

class exports.RecordsCollection extends Backbone.Collection
	
	sync		: 	app.JSONPSync
	model		: 	Record