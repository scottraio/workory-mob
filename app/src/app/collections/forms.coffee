class exports.FormsCollection extends Backbone.Collection
	
	sync		: 	app.ui.JSONPSync
	model		: 	app.models.form
	url			: 	app.ui.get("/accounts/1/forms.json?callback=?")