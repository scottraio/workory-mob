class exports.Navigation extends Backbone.View
	
	events:
		"click li" : "jump"
		
	jump: (e) ->
		app.ui.set_navbar($("a", $(e.currentTarget)).attr("data-tabbar-item"))
		return false