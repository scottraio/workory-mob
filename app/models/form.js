(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Form = (function() {
    __extends(Form, Backbone.Model);
    function Form() {
      Form.__super__.constructor.apply(this, arguments);
    }
    return Form;
  })();
}).call(this);
