app 	= require("helpers/app")
Field = require("models/field").Field

class exports.FormFieldsCollection extends Backbone.Collection
	
	sync		: 	app.JSONPSync
	model		: 	Field