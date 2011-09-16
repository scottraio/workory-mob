(function() {
  var Record, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  Record = require("models/record").Record;
  exports.RecordsCollection = (function() {
    __extends(RecordsCollection, Backbone.Collection);
    function RecordsCollection() {
      RecordsCollection.__super__.constructor.apply(this, arguments);
    }
    RecordsCollection.prototype.sync = app.JSONPSync;
    RecordsCollection.prototype.model = Record;
    return RecordsCollection;
  })();
}).call(this);
