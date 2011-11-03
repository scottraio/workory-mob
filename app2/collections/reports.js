(function() {
  var Report, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  Report = require("models/report").Report;
  exports.ReportsCollection = (function() {
    __extends(ReportsCollection, Backbone.Collection);
    function ReportsCollection() {
      ReportsCollection.__super__.constructor.apply(this, arguments);
    }
    ReportsCollection.prototype.sync = app.JSONPSync;
    ReportsCollection.prototype.url = app.base_path() + "/accounts/1/reports.json?callback=?";
    ReportsCollection.prototype.model = Report;
    return ReportsCollection;
  })();
}).call(this);
