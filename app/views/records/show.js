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
  exports.RecordsShow = (function() {
    __extends(RecordsShow, Backbone.View);
    function RecordsShow() {
      this.render = __bind(this.render, this);
      RecordsShow.__super__.constructor.apply(this, arguments);
    }
    RecordsShow.prototype.initialize = function() {
      return app.back_button("Report");
    };
    RecordsShow.prototype.render = function() {
      return $("#content").html(ich.recordshow({
        item: this.options.item,
        values: this.options.item.values
      }));
    };
    return RecordsShow;
  })();
}).call(this);
