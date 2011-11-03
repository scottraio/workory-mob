window.app 				= {}
app.ui						= require("helpers/ui") 
app.current_user	= {}

app.routers	 				= {}
app.routers.main 		= require('routers/main_router').MainRouter
app.routers.forms 	= require('routers/forms').FormsRouter
app.routers.reports = require('routers/reports').ReportsRouter
app.routers.records = require('routers/records').RecordsRouter

app.models 				= {}
app.models.user		= require("models/user").User
app.models.form		= require("models/form").Form
app.models.field	= require("models/field").Field
app.models.record	= require("models/record").Record
app.models.report	= require("models/report").Report

app.collections 							= {}
app.collections.forms 				= require("collections/forms").FormsCollection
app.collections.forms.fields 	= require("collections/form_fields").FormFieldsCollection
app.collections.reports 			= require("collections/reports").ReportsCollection
app.collections.records 			= require("collections/records").RecordsCollection

app.views 							= {}
app.views.navigation 		= require('views/navigation').Navigation
app.views.listview 			= require('views/listview').Listview
app.views.home 					= require('views/home').Home
app.views.forms 				= {}
app.views.forms.index 	= require("views/forms/index").FormsIndex
app.views.forms.show 		= require("views/forms/show").FormsShow
app.views.reports 			= {}
app.views.reports.index = require("views/reports/index").ReportsIndex
app.views.reports.show 	= require("views/reports/show").ReportsShow
app.views.records 			= {}
app.views.records.show 	= require("views/records/show").RecordsShow

# app bootstrapping on document ready
$(document).ready () ->
 	
	app.initialize = (user) ->
		app.current_user 							= user
		
		new app.views.navigation({ el: $("#tabbar") })
		new app.views.home()
		new app.views.listview({ el: $("#content") })
		
		main		= new app.routers.main()
		forms 	= new app.routers.forms()
		reports = new app.routers.reports()
		records	= new app.routers.records()
		
		main.navigate 'home', true if Backbone.history.getFragment() is ''
	
	$.getJSON "https://app.workory.com/home.json?callback=?", (user) ->
		app.initialize(user)
		Backbone.history.start()

