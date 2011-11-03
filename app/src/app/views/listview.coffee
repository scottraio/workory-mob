class exports.Listview extends Backbone.View
	
	events:
		"click ul[data-role=listview] li" : "select"
	
	select: (e) -> 
		$(e.currentTarget).addClass("pressed")
		app.ui.set_title($(e.currentTarget).find("a")[0].text)
		window.location.hash = $(e.currentTarget).find("a").attr("href")