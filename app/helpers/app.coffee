User = require("models/user").User

# https://github.com/documentcloud/backbone/pull/307
# Use JSONP instead of JSON
exports.JSONPSync = (method, model, options) ->
	options.timeout = 10000
	options.dataType = "jsonp"
	Backbone.sync(method, model, options)
	
exports.base_path = () -> "https://app.workory.com"

exports.bind_pressed_event = () ->
	$("ul[data-role=listview] li").bind "touchstart", () ->
		$(this).addClass("pressed")
		
	$("ul[data-role=listview] li").bind "touchend", () ->
		$(this).removeClass("pressed")
		
exports.set_title = (title) ->
	$("li.middle h1").html(title)
	
exports.set_navbar = (item) ->
	$("a[data-tabbar-item]").removeClass("enabled")
	$("a[data-tabbar-item=#{item}]").addClass("enabled")
	
exports.no_buttons = () ->
	$("#header li.left").html("")

exports.back_button = (title) ->
	$("#header li.left").html ich.buttonleft(title: title)
	$("div#header li.left a.back div.body").width($("div#header li.left a.back div.body p").width() + 12)

exports.current_user = (user) ->
	if user
		@user = new User(user)
	else
		return @user