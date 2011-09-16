(function() {
  var User;
  User = require("models/user").User;
  exports.JSONPSync = function(method, model, options) {
    options.timeout = 10000;
    options.dataType = "jsonp";
    return Backbone.sync(method, model, options);
  };
  exports.base_path = function() {
    return "https://app.workory.com";
  };
  exports.bind_pressed_event = function() {
    $("ul[data-role=listview] li").bind("touchstart", function() {
      return $(this).addClass("pressed");
    });
    return $("ul[data-role=listview] li").bind("touchend", function() {
      return $(this).removeClass("pressed");
    });
  };
  exports.set_title = function(title) {
    return $("li.middle h1").html(title);
  };
  exports.set_navbar = function(item) {
    $("a[data-tabbar-item]").removeClass("enabled");
    return $("a[data-tabbar-item=" + item + "]").addClass("enabled");
  };
  exports.no_buttons = function() {
    return $("#header li.left").html("");
  };
  exports.back_button = function(title) {
    $("#header li.left").html(ich.buttonleft({
      title: title
    }));
    return $("div#header li.left a.back div.body").width($("div#header li.left a.back div.body p").width() + 12);
  };
  exports.current_user = function(user) {
    if (user) {
      return this.user = new User(user);
    } else {
      return this.user;
    }
  };
}).call(this);
