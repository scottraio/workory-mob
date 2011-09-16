(function() {
  var Form, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  Form = require("models/form").Form;
  exports.FormsCollection = (function() {
    __extends(FormsCollection, Backbone.Collection);
    function FormsCollection() {
      FormsCollection.__super__.constructor.apply(this, arguments);
    }
    FormsCollection.prototype.sync = app.JSONPSync;
    FormsCollection.prototype.model = Form;
    return FormsCollection;
  })();
}).call(this);
