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
  exports.ReportsIndex = (function() {
    __extends(ReportsIndex, Backbone.View);
    function ReportsIndex() {
      this.render = __bind(this.render, this);
      ReportsIndex.__super__.constructor.apply(this, arguments);
    }
    ReportsIndex.prototype.initialize = function() {
      app.set_title("Reports");
      app.set_navbar("reports");
      return app.no_buttons();
    };
    ReportsIndex.prototype.render = function() {
      $("#content").html(ich.navlist({
        items: this.options.items.toJSON(),
        url: function() {
          return "#/books/" + this.book_id + "/reports/" + this.id;
        }
      }));
      return app.bind_pressed_event();
    };
    return ReportsIndex;
  })();
}).call(this);
