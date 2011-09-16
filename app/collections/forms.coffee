app 	= require("helpers/app")
Form 	= require("models/form").Form


class exports.FormsCollection extends Backbone.Collection
	
	sync		: 	app.JSONPSync
	model		: 	Form