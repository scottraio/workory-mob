(function() {
  var RecordsShow, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  RecordsShow = require("views/records/show").RecordsShow;
  exports.RecordsRouter = (function() {
    __extends(RecordsRouter, Backbone.Router);
    function RecordsRouter() {
      RecordsRouter.__super__.constructor.apply(this, arguments);
    }
    RecordsRouter.prototype.routes = {
      "/books/:book_id/records/:id": "show"
    };
    RecordsRouter.prototype.show = function(book_id, id) {
      return $.getJSON(app.base_path() + ("/books/" + book_id + "/records/" + id + ".json?callback=?"), function(data) {
        var show;
        show = new RecordsShow({
          item: data,
          el: $("#page")
        });
        return show.render();
      });
    };
    return RecordsRouter;
  })();
}).call(this);
