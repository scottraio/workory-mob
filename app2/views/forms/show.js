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
  exports.FormsShow = (function() {
    __extends(FormsShow, Backbone.View);
    function FormsShow() {
      this.render = __bind(this.render, this);
      FormsShow.__super__.constructor.apply(this, arguments);
    }
    FormsShow.prototype.initialize = function() {
      return app.back_button("Forms");
    };
    FormsShow.prototype.render = function() {
      return $("#content").html(ich.formshow({
        items: this.options.items.toJSON(),
        textbox: function() {
          if (this.field_type === "textbox") {
            return true;
          }
        },
        email: function() {
          if (this.field_type === "email") {
            return true;
          }
        },
        select: function() {
          if (this.field_type === "select") {
            return true;
          }
        },
        phone: function() {
          if (this.field_type === "phone_number") {
            return true;
          }
        },
        paragraph: function() {
          if (this.field_type === "textarea") {
            return true;
          }
        }
      }));
    };
    return FormsShow;
  })();
}).call(this);
