class exports.RecordsCollection extends Backbone.Collection
	
	sync		: 	app.ui.JSONPSync
	model		: 	app.models.record