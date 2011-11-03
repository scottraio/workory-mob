(function() {
  var Field, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  Field = require("models/field").Field;
  exports.FormFieldsCollection = (function() {
    __extends(FormFieldsCollection, Backbone.Collection);
    function FormFieldsCollection() {
      FormFieldsCollection.__super__.constructor.apply(this, arguments);
    }
    FormFieldsCollection.prototype.sync = app.JSONPSync;
    FormFieldsCollection.prototype.model = Field;
    return FormFieldsCollection;
  })();
}).call(this);
