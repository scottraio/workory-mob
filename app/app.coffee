app = require("helpers/app")

FormsRouter 	= require("routers/forms").FormsRouter
ReportsRouter = require("routers/reports").ReportsRouter
RecordsRouter = require("routers/records").RecordsRouter

User					= require("models/user").User

class Navigation extends Backbone.View
	
	events:
		"click li" : "jump"
		
	jump: (e) ->
		app.set_navbar($("a", $(e.currentTarget)).attr("data-tabbar-item"))
		return false
		
class Listview extends Backbone.View
	
	events:
		"click ul[data-role=listview] li" : "select"
	
	select: (e) -> 
		app.set_title($(e.currentTarget).children("a")[0].text)
		window.location.hash = $(e.currentTarget).children("a").attr("href")
		
window.App =
	Models: {}
	Collections: {}
	Controllers: {}
	Routers: {}
	Views: {}
	environment: (env) ->
		if env
			@env = env
		else
			return @env
	start: (user) ->	
		new FormsRouter(user)
		new ReportsRouter(user)
		new RecordsRouter()
		
		new Navigation el: $("#tabbar")
		new Listview el: $("#page")
		

		Backbone.history.start()
	
		
