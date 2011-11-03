# https://github.com/documentcloud/backbone/pull/307
# Use JSONP instead of JSON
exports.JSONPSync = (method, model, options) ->
	options.timeout = 10000
	options.dataType = "jsonp"
	Backbone.sync(method, model, options)
	
exports.base_path = () -> "https://app.workory.com"

exports.get = (path) -> "#{exports.base_path()}#{path}"

exports.bind_pressed_event = () ->
	#$("ul[data-role=listview] li").bind "tap", () ->
	#	$(this).addClass("pressed")
		
	#$("ul[data-role=listview] li").bind "touchend", () ->
	#	$(this).removeClass("pressed")

exports.page = (size) ->
	if size is "full"
		#$("#header").addClass("hide")
		#$("#header").bind 'webkitTransitionEnd', (event) -> 
		#	$("#header").hide()
		
		#$("#tabbar").addClass("hide")
		#$("#tabbar").bind 'webkitTransitionEnd', (event) -> 
		#	$("#tabbar").hide()
			
		#setHeight()
	else
		#$("#header").show()
		#$("#header").removeClass("hide")
		#$("#header").unbind 'webkitTransitionEnd'
		
		#$("#tabbar").show()
		#$("#tabbar").removeClass("hide")			
		#$("#tabbar").unbind 'webkitTransitionEnd'
		#setHeight()
	
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
		@user = app.models.user
	else
		return @user