(function() {
  var FormsRouter, Listview, Navigation, RecordsRouter, ReportsRouter, User, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  app = require("helpers/app");
  FormsRouter = require("routers/forms").FormsRouter;
  ReportsRouter = require("routers/reports").ReportsRouter;
  RecordsRouter = require("routers/records").RecordsRouter;
  User = require("models/user").User;
  Navigation = (function() {
    __extends(Navigation, Backbone.View);
    function Navigation() {
      Navigation.__super__.constructor.apply(this, arguments);
    }
    Navigation.prototype.events = {
      "click li": "jump"
    };
    Navigation.prototype.jump = function(e) {
      app.set_navbar($("a", $(e.currentTarget)).attr("data-tabbar-item"));
      return false;
    };
    return Navigation;
  })();
  Listview = (function() {
    __extends(Listview, Backbone.View);
    function Listview() {
      Listview.__super__.constructor.apply(this, arguments);
    }
    Listview.prototype.events = {
      "click ul[data-role=listview] li": "select"
    };
    Listview.prototype.select = function(e) {
      app.set_title($(e.currentTarget).children("a")[0].text);
      return window.location.hash = $(e.currentTarget).children("a").attr("href");
    };
    return Listview;
  })();
  window.App = {
    Models: {},
    Collections: {},
    Controllers: {},
    Routers: {},
    Views: {},
    environment: function(env) {
      if (env) {
        return this.env = env;
      } else {
        return this.env;
      }
    },
    start: function(user) {
      new FormsRouter(user);
      new ReportsRouter(user);
      new RecordsRouter();
      new Navigation({
        el: $("#tabbar")
      });
      new Listview({
        el: $("#page")
      });
      return Backbone.history.start();
    }
  };
}).call(this);
