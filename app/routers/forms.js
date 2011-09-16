(function() {
  var FormFieldsCollection, FormsCollection, FormsIndex, FormsShow, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  FormsCollection = require("collections/forms").FormsCollection;
  FormFieldsCollection = require("collections/form_fields").FormFieldsCollection;
  FormsIndex = require("views/forms/index").FormsIndex;
  FormsShow = require("views/forms/show").FormsShow;
  exports.FormsRouter = (function() {
    __extends(FormsRouter, Backbone.Router);
    function FormsRouter() {
      FormsRouter.__super__.constructor.apply(this, arguments);
    }
    FormsRouter.prototype.routes = {
      "forms": "index",
      "/books/:book_id/forms/:id": "show"
    };
    FormsRouter.prototype.initialize = function(user) {
      return this.options = {
        user: user
      };
    };
    FormsRouter.prototype.index = function() {
      var forms;
      forms = new FormsCollection();
      forms.url = app.base_path() + ("/accounts/" + this.options.user.account_id + "/forms.json?callback=?");
      return forms.fetch({
        success: function(collection, resp) {
          var index;
          index = new FormsIndex({
            items: forms,
            el: $("#page")
          });
          return index.render();
        },
        error: function(resp, error) {
          return console.log(error);
        }
      });
    };
    FormsRouter.prototype.show = function(book_id, id) {
      var fields;
      fields = new FormFieldsCollection();
      fields.url = app.base_path() + ("/books/" + book_id + "/forms/" + id + ".json?callback=?");
      return fields.fetch({
        success: function(collection, resp) {
          var show;
          show = new FormsShow({
            items: fields,
            el: $("#page")
          });
          return show.render();
        },
        error: function(resp, error) {
          return console.log(error);
        }
      });
    };
    return FormsRouter;
  })();
}).call(this);
