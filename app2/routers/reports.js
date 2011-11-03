(function() {
  var RecordsCollection, ReportsCollection, ReportsIndex, ReportsShow, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  ReportsCollection = require("collections/reports").ReportsCollection;
  RecordsCollection = require("collections/records").RecordsCollection;
  ReportsIndex = require("views/reports/index").ReportsIndex;
  ReportsShow = require("views/reports/show").ReportsShow;
  exports.ReportsRouter = (function() {
    __extends(ReportsRouter, Backbone.Router);
    function ReportsRouter() {
      ReportsRouter.__super__.constructor.apply(this, arguments);
    }
    ReportsRouter.prototype.routes = {
      "reports": "index",
      "/books/:book_id/reports/:id": "show"
    };
    ReportsRouter.prototype.initialize = function(user) {
      return this.options = {
        user: user
      };
    };
    ReportsRouter.prototype.index = function() {
      var reports;
      reports = new ReportsCollection();
      reports.url = app.base_path() + ("/accounts/" + this.options.user.account_id + "/reports.json?callback=?");
      return reports.fetch({
        success: function(collection, resp) {
          var index;
          index = new ReportsIndex({
            items: reports,
            el: $("#page")
          });
          return index.render();
        },
        error: function(resp, error) {
          return console.log(error);
        }
      });
    };
    ReportsRouter.prototype.show = function(book_id, id) {
      var records;
      records = new RecordsCollection();
      records.url = app.base_path() + ("/books/" + book_id + "/reports/" + id + ".json?callback=?");
      return records.fetch({
        success: function(collection, resp) {
          var show;
          show = new ReportsShow({
            items: records,
            el: $("#page")
          });
          return show.render();
        },
        error: function(resp, error) {
          return console.log(error);
        }
      });
    };
    return ReportsRouter;
  })();
}).call(this);
