(function() {
  var app;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  exports.FormsIndex = (function() {
    __extends(FormsIndex, Backbone.View);
    function FormsIndex() {
      this.render = __bind(this.render, this);
      FormsIndex.__super__.constructor.apply(this, arguments);
    }
    FormsIndex.prototype.initialize = function() {
      app.set_title("Forms");
      app.set_navbar("forms");
      return app.no_buttons();
    };
    FormsIndex.prototype.render = function() {
      $("#content").html(ich.navlist({
        items: this.options.items.toJSON(),
        url: function() {
          return "#/books/" + this.book_id + "/forms/" + this.id;
        }
      }));
      return app.bind_pressed_event();
    };
    return FormsIndex;
  })();
}).call(this);
