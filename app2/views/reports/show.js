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
  exports.ReportsShow = (function() {
    __extends(ReportsShow, Backbone.View);
    function ReportsShow() {
      this.render = __bind(this.render, this);
      ReportsShow.__super__.constructor.apply(this, arguments);
    }
    ReportsShow.prototype.initialize = function() {
      return app.back_button("Reports");
    };
    ReportsShow.prototype.render = function() {
      return $("#content").html(ich.reportshow({
        items: this.options.items.toJSON()
      }));
    };
    return ReportsShow;
  })();
}).call(this);
