//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') };

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError();
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator;
      if(typeof fun != 'function') throw new TypeError();
      if(len == 0 && arguments.length == 1) throw new TypeError();

      if(arguments.length >= 2)
       accumulator = arguments[1];
      else
        do{
          if(k in t){
            accumulator = t[k++];
            break;
          }
          if(++k >= len) throw new TypeError();
        } while (true);

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t);
        k++;
      }
      return accumulator;
    };

})();
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $$, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+)[^>]*>/,
    elementTypes = [1, 9, 11],
    adjacencyOperators = ['prepend', 'after', 'before', 'append'],
    reverseAdjacencyOperators = ['append', 'prepend'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    };

  function isF(value) { return ({}).toString.call(value) == "[object Function]" }
  function isO(value) { return value instanceof Object }
  function isA(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  function camelize(str)  { return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str){
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase();
  }
  function uniq(array)    { return array.filter(function(item,index,array){ return array.indexOf(item) == index }) }

  function classRE(name){
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
  }

  function maybeAddPx(name, value) { return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value; }

  function defaultDisplay(nodeName) {
    var element, display;
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName);
      document.body.appendChild(element);
      display = getComputedStyle(element, '').getPropertyValue("display");
      element.parentNode.removeChild(element);
      display == "none" && (display = "block");
      elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
  }

  function fragment(html, name) {
    if (name === undefined) fragmentRE.test(html) && RegExp.$1;
    if (!(name in containers)) name = '*';
    var container = containers[name];
    container.innerHTML = '' + html;
    return slice.call(container.childNodes);
  }

  function Z(dom, selector){
    dom = dom || emptyArray;
    dom.__proto__ = Z.prototype;
    dom.selector = selector || '';
    return dom;
  }

  function $(selector, context){
    if (!selector) return Z();
    if (context !== undefined) return $(context).find(selector);
    else if (isF(selector)) return $(document).ready(selector);
    else if (selector instanceof Z) return selector;
    else {
      var dom;
      if (isA(selector)) dom = compact(selector);
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null;
      else if (fragmentRE.test(selector))
        dom = fragment(selector, RegExp.$1), selector = null;
      else if (selector.nodeType && selector.nodeType == 3) dom = [selector];
      else dom = $$(document, selector);
      return Z(dom, selector);
    }
  }

  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source) target[key] = source[key];
    })
    return target;
  }
  $.qsa = $$ = function(element, selector){ return slice.call(element.querySelectorAll(selector)) }

  function filtered(nodes, selector){
    return selector === undefined ? $(nodes) : $(nodes).filter(selector);
  }

  function funcArg(context, arg, idx, payload){
   return isF(arg) ? arg.call(context, idx, payload) : arg;
  }

  $.isFunction = isF;
  $.isObject = isO;
  $.isArray = isA;

  $.map = function(elements, callback) {
    var value, values = [], i, key;
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value);
      }
    else
      for (key in elements) {
        value = callback(elements[key], key);
        if (value != null) values.push(value);
      }
    return flatten(values);
  }

  $.each = function(elements, callback) {
    var i, key;
    if (likeArray(elements))
      for(i = 0; i < elements.length; i++) {
        if(callback(i, elements[i]) === false) return elements;
      }
    else
      for(key in elements) {
        if(callback(key, elements[key]) === false) return elements;
      }
    return elements;
  }

  $.fn = {
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) });
    },
    slice: function(){
      return $(slice.apply(this, arguments));
    },
    ready: function(callback){
      if (document.readyState == 'complete' || document.readyState == 'loaded') callback();
      document.addEventListener('DOMContentLoaded', callback, false);
      return this;
    },
    get: function(idx){ return idx === undefined ? this : this[idx] },
    size: function(){ return this.length },
    remove: function () {
      return this.each(function () {
        if (this.parentNode != null) {
          this.parentNode.removeChild(this);
        }
      });
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) });
      return this;
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return $$(element.parentNode, selector).indexOf(element) >= 0;
      }));
    },
    end: function(){
      return this.prevObject || $();
    },
    add:function(selector,context){
      return $(uniq(this.concat($(selector,context))));
    },
    is: function(selector){
      return this.length > 0 && $(this[0]).filter(selector).length > 0;
    },
    not: function(selector){
      var nodes=[];
      if (isF(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this);
        });
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isF(selector.item)) ? slice.call(selector) : $(selector);
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el);
        });
      }
      return $(nodes);
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
    },
    first: function(){ return $(this[0]) },
    last: function(){ return $(this[this.length - 1]) },
    find: function(selector){
      var result;
      if (this.length == 1) result = $$(this[0], selector);
      else result = this.map(function(){ return $$(this, selector) });
      return $(result);
    },
    closest: function(selector, context){
      var node = this[0], nodes = $$(context !== undefined ? context : document, selector);
      if (nodes.length === 0) node = null;
      while(node && node !== document && nodes.indexOf(node) < 0) node = node.parentNode;
      return $(node !== document && node);
    },
    parents: function(selector){
      var ancestors = [], nodes = this;
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node);
            return node;
          }
        });
      return filtered(ancestors, selector);
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector);
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector);
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el });
      }), selector);
    },
    empty: function(){ return this.each(function(){ this.innerHTML = '' }) },
    pluck: function(property){ return this.map(function(){ return this[property] }) },
    show: function(){
      return this.each(function() {
        this.style.display == "none" && (this.style.display = null);
        if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
          this.style.display = defaultDisplay(this.nodeName)
        }
      })
    },
    replaceWith: function(newContent) {
      return this.each(function() {
        var par=this.parentNode,next=this.nextSibling;
        $(this).remove();
        next ? $(next).before(newContent) : $(par).append(newContent);
      });
    },
    wrap: function(newContent) {
      return this.each(function() {
        $(this).wrapAll($(newContent)[0].cloneNode(false));
      });
    },
    wrapAll: function(newContent) {
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent));
        newContent.append(this);
      }
      return this;
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children());
      });
      return this;
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide();
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function (idx) {
          var originHtml = this.innerHTML;
          $(this).empty().append( funcArg(this, html, idx, originHtml) );
        });
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text });
    },
    attr: function(name, value){
      return (typeof name == 'string' && value === undefined) ?
        (this.length > 0 && this[0].nodeName == 'INPUT' && this[0].type == 'text' && name == 'value') ? (this.val()) :
        (this.length > 0 ? this[0].getAttribute(name) || (name in this[0] ? this[0][name] : undefined) : undefined) :
        this.each(function(idx){
          if (isO(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)));
        });
    },
    removeAttr: function(name) {
      return this.each(function() { this.removeAttribute(name); });
    },
    data: function(name, value){
      return this.attr('data-' + name, value);
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : null) :
        this.each(function(){
          this.value = value;
        });
    },
    offset: function(){
      if(this.length==0) return null;
      var obj = this[0].getBoundingClientRect();
      return {
        left: obj.left + document.body.scrollLeft,
        top: obj.top + document.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property);
      var css = '';
      for (key in property) css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
      if (typeof property == 'string') css = dasherize(property) + ":" + maybeAddPx(property, value);
      return this.each(function() { this.style.cssText += ';' + css });
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
    },
    hasClass: function(name){
      if (this.length < 1) return false;
      else return classRE(name).test(this[0].className);
    },
    addClass: function(name){
      return this.each(function(idx) {
        classList = [];
        var cls = this.className, newName = funcArg(this, name, idx, cls);
        newName.split(/\s+/g).forEach(function(klass) {
          if (!$(this).hasClass(klass)) {
            classList.push(klass)
          }
        }, this);
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      });
    },
    removeClass: function(name){
      return this.each(function(idx) {
        if(name === undefined)
          return this.className = '';
        classList = this.className;
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
          classList = classList.replace(classRE(klass), " ")
        });
        this.className = classList.trim()
      });
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
       var cls = this.className, newName = funcArg(this, name, idx, cls);
       ((when !== undefined && !when) || $(this).hasClass(newName)) ?
         $(this).removeClass(newName) : $(this).addClass(newName)
      });
    }
  };

  'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
    var fn = $.fn[property];
    $.fn[property] = function() {
      var ret = fn.apply(this, arguments);
      ret.prevObject = this;
      return ret;
    }
  });

  ['width', 'height'].forEach(function(property){
    $.fn[property] = function(value) {
      var offset;
      if (value === undefined) { return (offset = this.offset()) && offset[property] }
      else return this.css(property, value);
    }
  });

  function insert(operator, target, node) {
    var parent = (!operator || operator == 3) ? target : target.parentNode;
    parent.insertBefore(node,
      !operator ? parent.firstChild :         // prepend
      operator == 1 ? target.nextSibling :    // after
      operator == 2 ? target :                // before
      null);                                  // append
  }

  function traverseNode (node, fun) {
    fun(node);
    for (key in node.childNodes) {
      traverseNode(node.childNodes[key], fun);
    }
  }

  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(html){
      var nodes = typeof(html) == 'object' ? html : fragment(html);
      if (!('length' in nodes)) nodes = [nodes];
      if (nodes.length < 1) return this;
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2;

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i];
          traverseNode(node, function (node) {
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT') {
              window['eval'].call(window, node.innerHTML);
            }
          });
          if (copyByClone && index < size - 1) node = node.cloneNode(true);
          insert(operator, target, node);
        }
      });
    };
  });

  reverseAdjacencyOperators.forEach(function(key) {
    $.fn[key+'To'] = function(html){
      if (typeof(html) != 'object') html = $(html);
      html[key](this);
      return this;
    };
  });

  Z.prototype = $.fn;

  return $;
})();

'$' in window || (window.$ = Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($){
  var $$ = $.qsa, handlers = {}, _zid = 1;
  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || handler.fn == fn)
        && (!selector || handler.sel == selector);
    });
  }
  function parse(event) {
    var parts = ('' + event).split('.');
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function add(element, events, fn, selector, delegate){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function(event){
      var callback = delegate || fn;
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data));
        if (result === false) {
          event.preventDefault();
        }
        return result;
      };
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length});
      set.push(handler);
      element.addEventListener(handler.e, proxyfn, false);
    });
  }
  function remove(element, events, fn, selector){
    var id = zid(element);
    (events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i];
        element.removeEventListener(handler.e, handler.proxy, false);
      });
    });
  }

  $.event = { add: add, remove: remove }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback);
    });
  };
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback);
    });
  };
  $.fn.one = function(event, callback){
    return this.each(function(){
      var self = this;
      add(this, event, function wrapper(evt){
        callback.call(self, evt);
        remove(self, event, arguments.callee);
      });
    });
  };

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      };
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event);
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue;
        return event[name].apply(event, arguments);
      };
      proxy[predicate] = returnFalse;
    })
    return proxy;
  }

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(i, element){
      add(element, event, callback, selector, function(e, data){
        var target = e.target, nodes = $$(element, selector);
        while (target && nodes.indexOf(target) < 0) target = target.parentNode;
        if (target && !(target === element) && !(target === document)) {
          callback.call(target, $.extend(createProxy(e), {
            currentTarget: target, liveFired: element
          }), data);
        }
      });
    });
  };
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector);
    });
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback);
    return this;
  };
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback);
    return this;
  };

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event);
    event.data = data;
    return this.each(function(){ this.dispatchEvent(event) });
  };

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result;
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event);
      e.data = data; e.target = element;
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e);
        if (e.isImmediatePropagationStopped()) return false;
      });
    });
    return result;
  };

  // shortcut methods for `.bind(event, fn)` for each event type
  ('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) };
  });

  ['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback);
      else if (this.length) try { this.get(0)[name]() } catch(e){};
      return this;
    };
  });

  $.Event = function(type, props) {
    var event = document.createEvent('Events');
    if (props) $.extend(event, props);
    event.initEvent(type, !(props && props.bubbles === false), true);
    return event;
  };

})(Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($){
  function detect(ua){
    var ua = ua, os = {},
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
    if (android) os.android = true, os.version = android[2];
    if (iphone) os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true;
    if (ipad) os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true;
    if (webos) os.webos = true, os.version = webos[2];
    if (touchpad) os.touchpad = true;
    if (blackberry) os.blackberry = true, os.version = blackberry[2];
    return os;
  }

  // ### $.os
  //
  // Object contains information about running environmental
  //
  // *Example:*
  //
  //     $.os.ios      // => true if running on Apple iOS
  //     $.os.android  // => true if running on Android
  //     $.os.webos    // => true if running on HP/Palm WebOS
  //     $.os.touchpad // => true if running on a HP TouchPad
  //     $.os.version  // => string with version number,
  //                         "4.0", "3.1.1", "2.1", etc.
  //     $.os.iphone   // => true if running on iPhone
  //     $.os.ipad     // => true if running on iPad
  //     $.os.blackberry // => true if running on BlackBerry
  //
  $.os = detect(navigator.userAgent);
  $.__detect = detect;

  var v = navigator.userAgent.match(/WebKit\/([\d.]+)/);
  $.browser = v ? { webkit: true, version: v[1] } : { webkit: false };

})(Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($, undefined){
  var supportedTransforms = [
    'scale', 'scaleX', 'scaleY',
    'translate', 'translateX', 'translateY', 'translate3d',
    'skew',      'skewX',      'skewY',
    'rotate',    'rotateX',    'rotateY',    'rotateZ',    'rotate3d',
    'matrix'
  ];

  $.fn.anim = function(properties, duration, ease, callback){
    var transforms = [], cssProperties = {}, key, that = this, wrappedCallback;

    for (key in properties)
      if (supportedTransforms.indexOf(key)>=0)
        transforms.push(key + '(' + properties[key] + ')');
      else
        cssProperties[key] = properties[key];

    wrappedCallback = function(){
      that.css({'-webkit-transition':'none'});
      callback && callback();
    }

    if (duration > 0)
      this.one('webkitTransitionEnd', wrappedCallback);
    else
      setTimeout(wrappedCallback, 0);

    if (transforms.length > 0) {
      cssProperties['-webkit-transform'] = transforms.join(' ')
    }

    cssProperties['-webkit-transition'] = 'all ' + (duration !== undefined ? duration : 0.5) + 's ' + (ease || '');

    setTimeout(function () {
      that.css(cssProperties);
    }, 0);

    return this;
  }
})(Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($){
  var jsonpID = 0,
      isObject = $.isObject,
      key;

  // Empty function, used as default callback
  function empty() {}

  // ### $.ajaxJSONP
  //
  // Load JSON from a server in a different domain (JSONP)
  //
  // *Arguments:*
  //
  //     options — object that configure the request,
  //               see avaliable options below
  //
  // *Avaliable options:*
  //
  //     url     — url to which the request is sent
  //     success — callback that is executed if the request succeeds
  //
  // *Example:*
  //
  //     $.ajaxJSONP({
  //        url:     'http://example.com/projects?callback=?',
  //        success: function (data) {
  //            projects.push(json);
  //        }
  //     });
  //
  $.ajaxJSONP = function(options){
    var jsonpString = 'jsonp' + ++jsonpID,
        script = document.createElement('script');
    window[jsonpString] = function(data){
      options.success(data);
      delete window[jsonpString];
    };
    script.src = options.url.replace(/=\?/, '=' + jsonpString);
    $('head').append(script);
  };

  // ### $.ajaxSettings
  //
  // AJAX settings
  //
  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   'application/json',
      xml:    'application/xml, text/xml',
      html:   'text/html',
      text:   'text/plain'
    }
  };

  // ### $.ajax
  //
  // Perform AJAX request
  //
  // *Arguments:*
  //
  //     options — object that configure the request,
  //               see avaliable options below
  //
  // *Avaliable options:*
  //
  //     type ('GET')          — type of request GET / POST
  //     url (window.location) — url to which the request is sent
  //     data                  — data to send to server,
  //                             can be string or object
  //     dataType ('json')     — what response type you accept from
  //                             the server:
  //                             'json', 'xml', 'html', or 'text'
  //     success               — callback that is executed if
  //                             the request succeeds
  //     error                 — callback that is executed if
  //                             the server drops error
  //
  // *Example:*
  //
  //     $.ajax({
  //        type:     'POST',
  //        url:      '/projects',
  //        data:     { name: 'Zepto.js' },
  //        dataType: 'html',
  //        success:  function (data) {
  //            $('body').append(data);
  //        },
  //        error:    function (xhr, type) {
  //            alert('Error!');
  //        }
  //     });
  //
  $.ajax = function(options){
    options = options || {};
    var settings = $.extend({}, options);
    for (key in $.ajaxSettings) if (!settings[key]) settings[key] = $.ajaxSettings[key];

    if (/=\?/.test(settings.url)) return $.ajaxJSONP(settings);

    if (!settings.url) settings.url = window.location.toString();
    if (settings.data && !settings.contentType) settings.contentType = 'application/x-www-form-urlencoded';
    if (isObject(settings.data)) settings.data = $.param(settings.data);

    if (settings.type.match(/get/i) && settings.data) {
      var queryString = settings.data;
      if (settings.url.match(/\?.*=/)) {
        queryString = '&' + queryString;
      } else if (queryString[0] != '?') {
        queryString = '?' + queryString;
      }
      settings.url += queryString;
    }

    var mime = settings.accepts[settings.dataType],
        xhr = new XMLHttpRequest();

    settings.headers = $.extend({'X-Requested-With': 'XMLHttpRequest'}, settings.headers || {});
    if (mime) settings.headers['Accept'] = mime;

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        var result, error = false;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) {
          if (mime == 'application/json' && !(xhr.responseText == '')) {
            try { result = JSON.parse(xhr.responseText); }
            catch (e) { error = e; }
          }
          else result = xhr.responseText;
          if (error) settings.error(xhr, 'parsererror', error);
          else settings.success(result, 'success', xhr);
        } else {
          error = true;
          settings.error(xhr, 'error');
        }
        settings.complete(xhr, error ? 'error' : 'success');
      }
    };

    xhr.open(settings.type, settings.url, true);
    if (settings.beforeSend(xhr, settings) === false) {
      xhr.abort();
      return false;
    }

    if (settings.contentType) settings.headers['Content-Type'] = settings.contentType;
    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);
    xhr.send(settings.data);

    return xhr;
  };

  // ### $.get
  //
  // Load data from the server using a GET request
  //
  // *Arguments:*
  //
  //     url     — url to which the request is sent
  //     success — callback that is executed if the request succeeds
  //
  // *Example:*
  //
  //     $.get(
  //        '/projects/42',
  //        function (data) {
  //            $('body').append(data);
  //        }
  //     );
  //
  $.get = function(url, success){ $.ajax({ url: url, success: success }) };

  // ### $.post
  //
  // Load data from the server using POST request
  //
  // *Arguments:*
  //
  //     url        — url to which the request is sent
  //     [data]     — data to send to server, can be string or object
  //     [success]  — callback that is executed if the request succeeds
  //     [dataType] — type of expected response
  //                  'json', 'xml', 'html', or 'text'
  //
  // *Example:*
  //
  //     $.post(
  //        '/projects',
  //        { name: 'Zepto.js' },
  //        function (data) {
  //            $('body').append(data);
  //        },
  //        'html'
  //     );
  //
  $.post = function(url, data, success, dataType){
    if ($.isFunction(data)) dataType = dataType || success, success = data, data = null;
    $.ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
  };

  // ### $.getJSON
  //
  // Load JSON from the server using GET request
  //
  // *Arguments:*
  //
  //     url     — url to which the request is sent
  //     success — callback that is executed if the request succeeds
  //
  // *Example:*
  //
  //     $.getJSON(
  //        '/projects/42',
  //        function (json) {
  //            projects.push(json);
  //        }
  //     );
  //
  $.getJSON = function(url, success){ $.ajax({ url: url, success: success, dataType: 'json' }) };

  // ### $.fn.load
  //
  // Load data from the server into an element
  //
  // *Arguments:*
  //
  //     url     — url to which the request is sent
  //     [success] — callback that is executed if the request succeeds
  //
  // *Examples:*
  //
  //     $('#project_container').get(
  //        '/projects/42',
  //        function () {
  //            alert('Project was successfully loaded');
  //        }
  //     );
  //
  //     $('#project_comments').get(
  //        '/projects/42 #comments',
  //        function () {
  //            alert('Comments was successfully loaded');
  //        }
  //     );
  //
  $.fn.load = function(url, success){
    if (!this.length) return this;
    var self = this, parts = url.split(/\s/), selector;
    if (parts.length > 1) url = parts[0], selector = parts[1];
    $.get(url, function(response){
      self.html(selector ?
        $(document.createElement('div')).html(response).find(selector).html()
        : response);
      success && success();
    });
    return this;
  };

  // ### $.param
  //
  // Encode object as a string for submission
  //
  // *Arguments:*
  //
  //     obj — object to serialize
  //     [v] — root node
  //
  // *Example:*
  //
  //     $.param( { name: 'Zepto.js', version: '0.6' } );
  //
  $.param = function(obj, v){
    var result = [], add = function(key, value){
      result.push(encodeURIComponent(v ? v + '[' + key + ']' : key)
        + '=' + encodeURIComponent(value));
      },
      isObjArray = $.isArray(obj);

    for(key in obj)
      if(isObject(obj[key]))
        result.push($.param(obj[key], (v ? v + '[' + key + ']' : key)));
      else
        add(isObjArray ? '' : key, obj[key]);

    return result.join('&').replace('%20', '+');
  };
})(Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function ($) {

  // ### $.fn.serializeArray
  //
  // Encode a set of form elements as an array of names and values
  //
  // *Example:*
  //
  //     $('#login_form').serializeArray();
  //
  //  returns
  //
  //     [
  //         {
  //             name: 'email',
  //             value: 'koss@nocorp.me'
  //         },
  //         {
  //             name: 'password',
  //             value: '123456'
  //         }
  //     ]
  //
  $.fn.serializeArray = function () {
    var result = [], el;
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this);
      if ( (el.attr('type') !== 'radio' || el.is(':checked')) && !(el.attr('type') === 'checkbox' && !el.is(':checked'))) {
        result.push({
          name: el.attr('name'),
          value: el.val()
        });
      }
    });
    return result;
  };

  // ### $.fn.serialize
  //
  //
  // Encode a set of form elements as a string for submission
  //
  // *Example:*
  //
  //     $('#login_form').serialize();
  //
  //  returns
  //
  //     "email=koss%40nocorp.me&password=123456"
  //
  $.fn.serialize = function () {
    var result = [];
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) );
    });
    return result.join('&');
  };

  // ### $.fn.submit
  //
  // Bind or trigger the submit event for a form
  //
  // *Examples:*
  //
  // To bind a handler for the submit event:
  //
  //     $('#login_form').submit(function (e) {
  //         alert('Form was submitted!');
  //         e.preventDefault();
  //     });
  //
  // To trigger form submit:
  //
  //     $('#login_form').submit();
  //
  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit');
      this.eq(0).trigger(event);
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this;
  }

})(Zepto);
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($){
  var touch = {}, touchTimeout;

  function parentIfText(node){
    return 'tagName' in node ? node : node.parentNode;
  }

  function swipeDirection(x1, x2, y1, y2){
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
    if (xDelta >= yDelta) {
      return (x1 - x2 > 0 ? 'Left' : 'Right');
    } else {
      return (y1 - y2 > 0 ? 'Up' : 'Down');
    }
  }

  var longTapDelay = 750;
  function longTap(){
    if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
      $(touch.target).trigger('longTap');
      touch = {};
    }
  }

  $(document).ready(function(){
    $(document.body).bind('touchstart', function(e){
      var now = Date.now(), delta = now - (touch.last || now);
      touch.target = parentIfText(e.touches[0].target);
      touchTimeout && clearTimeout(touchTimeout);
      touch.x1 = e.touches[0].pageX;
      touch.y1 = e.touches[0].pageY;
      if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
      touch.last = now;
      setTimeout(longTap, longTapDelay);
    }).bind('touchmove', function(e){
      touch.x2 = e.touches[0].pageX;
      touch.y2 = e.touches[0].pageY;
    }).bind('touchend', function(e){
      if (touch.isDoubleTap) {
        $(touch.target).trigger('doubleTap');
        touch = {};
      } else if (touch.x2 > 0 || touch.y2 > 0) {
        (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30)  &&
          $(touch.target).trigger('swipe') &&
          $(touch.target).trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
        touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
      } else if ('last' in touch) {
        touchTimeout = setTimeout(function(){
          touchTimeout = null;
          $(touch.target).trigger('tap')
          touch = {};
        }, 250);
      }
    }).bind('touchcancel', function(){ touch = {} });
  });

  ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  });
})(Zepto);

//     Underscore.js 1.1.7
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.1.7';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result |= iterator.call(context, value, index, list)) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion produced by an iterator
  _.groupBy = function(obj, iterator) {
    var result = {};
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and another.
  // Only the elements present in just the first array will remain.
  _.difference = function(array, other) {
    return _.filter(array, function(value){ return !_.include(other, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, obj) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };


  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    if (b.isEqual) return b.isEqual(a);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
  // that does not equal itself.
  _.isNaN = function(obj) {
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();
//     Backbone.js 0.5.3
//     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://documentcloud.github.com/backbone

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object.
  var root = this;

  // Save the previous value of the `Backbone` variable.
  var previousBackbone = root.Backbone;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.5.3';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;

  // For Backbone's purposes, jQuery or Zepto owns the `$` variable.
  var $ = root.jQuery || root.Zepto;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option will
  // fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
  // `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may `bind` or `unbind` a callback function to an event;
  // `trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.bind('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Backbone.Events = {

    // Bind an event, specified by a string name, `ev`, to a `callback` function.
    // Passing `"all"` will bind the callback to all events fired.
    bind : function(ev, callback, context) {
      var calls = this._callbacks || (this._callbacks = {});
      var list  = calls[ev] || (calls[ev] = []);
      list.push([callback, context]);
      return this;
    },

    // Remove one or many callbacks. If `callback` is null, removes all
    // callbacks for the event. If `ev` is null, removes all bound callbacks
    // for all events.
    unbind : function(ev, callback) {
      var calls;
      if (!ev) {
        this._callbacks = {};
      } else if (calls = this._callbacks) {
        if (!callback) {
          calls[ev] = [];
        } else {
          var list = calls[ev];
          if (!list) return this;
          for (var i = 0, l = list.length; i < l; i++) {
            if (list[i] && callback === list[i][0]) {
              list[i] = null;
              break;
            }
          }
        }
      }
      return this;
    },

    // Trigger an event, firing all bound callbacks. Callbacks are passed the
    // same arguments as `trigger` is, apart from the event name.
    // Listening for `"all"` passes the true event name as the first argument.
    trigger : function(eventName) {
      var list, calls, ev, callback, args;
      var both = 2;
      if (!(calls = this._callbacks)) return this;
      while (both--) {
        ev = both ? eventName : 'all';
        if (list = calls[ev]) {
          for (var i = 0, l = list.length; i < l; i++) {
            if (!(callback = list[i])) {
              list.splice(i, 1); i--; l--;
            } else {
              args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
              callback[0].apply(callback[1] || this, args);
            }
          }
        }
      }
      return this;
    }

  };

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (defaults = this.defaults) {
      if (_.isFunction(defaults)) defaults = defaults.call(this);
      attributes = _.extend({}, defaults, attributes);
    }
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.set(attributes, {silent : true});
    this._changed = false;
    this._previousAttributes = _.clone(this.attributes);
    if (options && options.collection) this.collection = options.collection;
    this.initialize(attributes, options);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Backbone.Model.prototype, Backbone.Events, {

    // A snapshot of the model's previous attributes, taken immediately
    // after the last `"change"` event was fired.
    _previousAttributes : null,

    // Has the item been changed since the last `"change"` event?
    _changed : false,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute : 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Return a copy of the model's `attributes` object.
    toJSON : function() {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get : function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape : function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.attributes[attr];
      return this._escapedAttributes[attr] = escapeHTML(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has : function(attr) {
      return this.attributes[attr] != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless you
    // choose to silence it.
    set : function(attrs, options) {

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs.attributes) attrs = attrs.attributes;
      var now = this.attributes, escaped = this._escapedAttributes;

      // Run validation.
      if (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // We're about to start triggering change events.
      var alreadyChanging = this._changing;
      this._changing = true;

      // Update attributes.
      for (var attr in attrs) {
        var val = attrs[attr];
        if (!_.isEqual(now[attr], val)) {
          now[attr] = val;
          delete escaped[attr];
          this._changed = true;
          if (!options.silent) this.trigger('change:' + attr, this, val, options);
        }
      }

      // Fire the `"change"` event, if the model has been changed.
      if (!alreadyChanging && !options.silent && this._changed) this.change(options);
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset : function(attr, options) {
      if (!(attr in this.attributes)) return this;
      options || (options = {});
      var value = this.attributes[attr];

      // Run validation.
      var validObj = {};
      validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      // Remove the attribute.
      delete this.attributes[attr];
      delete this._escapedAttributes[attr];
      if (attr == this.idAttribute) delete this.id;
      this._changed = true;
      if (!options.silent) {
        this.trigger('change:' + attr, this, void 0, options);
        this.change(options);
      }
      return this;
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear : function(options) {
      options || (options = {});
      var attr;
      var old = this.attributes;

      // Run validation.
      var validObj = {};
      for (attr in old) validObj[attr] = void 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      this.attributes = {};
      this._escapedAttributes = {};
      this._changed = true;
      if (!options.silent) {
        for (attr in old) {
          this.trigger('change:' + attr, this, void 0, options);
        }
        this.change(options);
      }
      return this;
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch : function(options) {
      options || (options = {});
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save : function(attrs, options) {
      options || (options = {});
      if (attrs && !this.set(attrs, options)) return false;
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp, xhr);
      };
      options.error = wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      return (this.sync || Backbone.sync).call(this, method, this, options);
    },

    // Destroy this model on the server if it was already persisted. Upon success, the model is removed
    // from its collection, if it has one.
    destroy : function(options) {
      options || (options = {});
      if (this.isNew()) return this.trigger('destroy', this, this.collection, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        model.trigger('destroy', model, model.collection, options);
        if (success) success(model, resp);
      };
      options.error = wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'delete', this, options);
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url : function() {
      var base = getUrl(this.collection) || this.urlRoot || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse : function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone : function() {
      return new this.constructor(this);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew : function() {
      return this.id == null;
    },

    // Call this method to manually fire a `change` event for this model.
    // Calling this will cause all objects observing the model to update.
    change : function(options) {
      this.trigger('change', this, options);
      this._previousAttributes = _.clone(this.attributes);
      this._changed = false;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged : function(attr) {
      if (attr) return this._previousAttributes[attr] != this.attributes[attr];
      return this._changed;
    },

    // Return an object containing all the attributes that have changed, or false
    // if there are no changed attributes. Useful for determining what parts of a
    // view need to be updated and/or what attributes need to be persisted to
    // the server.
    changedAttributes : function(now) {
      now || (now = this.attributes);
      var old = this._previousAttributes;
      var changed = false;
      for (var attr in now) {
        if (!_.isEqual(old[attr], now[attr])) {
          changed = changed || {};
          changed[attr] = now[attr];
        }
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous : function(attr) {
      if (!attr || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes : function() {
      return _.clone(this._previousAttributes);
    },

    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _performValidation : function(attrs, options) {
      var error = this.validate(attrs);
      if (error) {
        if (options.error) {
          options.error(this, error, options);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
      return true;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.comparator) this.comparator = options.comparator;
    _.bindAll(this, '_onModelEvent', '_removeReference');
    this._reset();
    if (models) this.reset(models, {silent: true});
    this.initialize.apply(this, arguments);
  };

  // Define the Collection's inheritable methods.
  _.extend(Backbone.Collection.prototype, Backbone.Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model : Backbone.Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `added` event for every new model.
    add : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._add(models[i], options);
        }
      } else {
        this._add(models, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `removed` event for every model removed.
    remove : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._remove(models[i], options);
        }
      } else {
        this._remove(models, options);
      }
      return this;
    },

    // Get a model from the set by id.
    get : function(id) {
      if (id == null) return null;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid : function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Force the collection to re-sort itself. You don't need to call this under normal
    // circumstances, as the set will maintain sort order as each item is added.
    sort : function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      this.models = this.sortBy(this.comparator);
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck : function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `added` or `removed` events. Fires `reset` when finished.
    reset : function(models, options) {
      models  || (models = []);
      options || (options = {});
      this.each(this._removeReference);
      this._reset();
      this.add(models, {silent: true});
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch : function(options) {
      options || (options = {});
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. After the model
    // has been created on the server, it will be added to the collection.
    // Returns the model, or 'false' if validation on a new model fails.
    create : function(model, options) {
      var coll = this;
      options || (options = {});
      model = this._prepareModel(model, options);
      if (!model) return false;
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        coll.add(nextModel, options);
        if (success) success(nextModel, resp, xhr);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse : function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset : function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model to be added to this collection
    _prepareModel: function(model, options) {
      if (!(model instanceof Backbone.Model)) {
        var attrs = model;
        model = new this.model(attrs, {collection: this});
        if (model.validate && !model._performValidation(attrs, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal implementation of adding a single model to the set, updating
    // hash indexes for `id` and `cid` lookups.
    // Returns the model, or 'false' if validation on a new model fails.
    _add : function(model, options) {
      options || (options = {});
      model = this._prepareModel(model, options);
      if (!model) return false;
      var already = this.getByCid(model);
      if (already) throw new Error(["Can't add the same model to a set twice", already.id]);
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      var index = options.at != null ? options.at :
                  this.comparator ? this.sortedIndex(model, this.comparator) :
                  this.length;
      this.models.splice(index, 0, model);
      model.bind('all', this._onModelEvent);
      this.length++;
      if (!options.silent) model.trigger('add', model, this, options);
      return model;
    },

    // Internal implementation of removing a single model from the set, updating
    // hash indexes for `id` and `cid` lookups.
    _remove : function(model, options) {
      options || (options = {});
      model = this.getByCid(model) || this.get(model);
      if (!model) return null;
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      this.models.splice(this.indexOf(model), 1);
      this.length--;
      if (!options.silent) model.trigger('remove', model, this, options);
      this._removeReference(model);
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference : function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.unbind('all', this._onModelEvent);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent : function(ev, model, collection, options) {
      if ((ev == 'add' || ev == 'remove') && collection != this) return;
      if (ev == 'destroy') {
        this._remove(model, options);
      }
      if (model && ev === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
    'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:([\w\d]+)/g;
  var splatParam    = /\*([\w\d]+)/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Backbone.Router.prototype, Backbone.Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route : function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
      }, this));
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate : function(fragment, triggerRoute) {
      Backbone.history.navigate(fragment, triggerRoute);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes : function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp : function(route) {
      route = route.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters : function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning hashes.
  var hashStrip = /^#*/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  var historyStarted = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(Backbone.History.prototype, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment : function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
          if (fragment.indexOf(this.options.root) == 0) fragment = fragment.substr(this.options.root.length);
        } else {
          fragment = window.location.hash;
        }
      }
      return decodeURIComponent(fragment.replace(hashStrip, ''));
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start : function(options) {

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      if (historyStarted) throw new Error("Backbone.history has already been started");
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if ('onhashchange' in window && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else {
        setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      historyStarted = true;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;
      if (this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = loc.hash.replace(hashStrip, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Add a route to be tested when the fragment changes. Routes added later may
    // override previous routes.
    route : function(route, callback) {
      this.handlers.unshift({route : route, callback : callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl : function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.iframe.location.hash);
      if (current == this.fragment || current == decodeURIComponent(this.fragment)) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(window.location.hash);
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl : function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history. You are responsible for properly
    // URL-encoding the fragment in advance. This does not trigger
    // a `hashchange` event.
    navigate : function(fragment, triggerRoute) {
      var frag = (fragment || '').replace(hashStrip, '');
      if (this.fragment == frag || this.fragment == decodeURIComponent(frag)) return;
      if (this._hasPushState) {
        var loc = window.location;
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history.pushState({}, document.title, loc.protocol + '//' + loc.host + frag);
      } else {
        window.location.hash = this.fragment = frag;
        if (this.iframe && (frag != this.getFragment(this.iframe.location.hash))) {
          this.iframe.document.open().close();
          this.iframe.location.hash = frag;
        }
      }
      if (triggerRoute) this.loadUrl(fragment);
    }

  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.delegateEvents();
    this.initialize.apply(this, arguments);
  };

  // Element lookup, scoped to DOM elements within the current view.
  // This should be prefered to global lookups, if you're dealing with
  // a specific view.
  var selectorDelegate = function(selector) {
    return $(selector, this.el);
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(Backbone.View.prototype, Backbone.Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName : 'div',

    // Attach the `selectorDelegate` function as the `$` property.
    $       : selectorDelegate,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render : function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove : function() {
      $(this.el).remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make : function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Set callbacks, where `this.callbacks` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents : function(events) {
      if (!(events || (events = this.events))) return;
      if (_.isFunction(events)) events = events.call(this);
      $(this.el).unbind('.delegateEvents' + this.cid);
      for (var key in events) {
        var method = this[events[key]];
        if (!method) throw new Error('Event "' + events[key] + '" does not exist');
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          $(this.el).bind(eventName, method);
        } else {
          $(this.el).delegate(selector, eventName, method);
        }
      }
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` proeprties.
    _ensureElement : function() {
      if (!this.el) {
        var attrs = this.attributes || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.el = this.make(this.tagName, attrs);
      } else if (_.isString(this.el)) {
        this.el = $(this.el).get(0);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Backbone.Model.extend = Backbone.Collection.extend =
    Backbone.Router.extend = Backbone.View.extend = extend;

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, uses makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded` instead of
  // `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
      type:         type,
      dataType:     'json'
    }, options);

    // Ensure that we have a URL.
    if (!params.url) {
      params.url = getUrl(model) || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!params.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data        = params.data ? {model : params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request.
    return $.ajax(params);
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a URL from a Model or Collection as a property
  // or as a function.
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(onError, model, options) {
    return function(resp) {
      if (onError) {
        onError(model, resp, options);
      } else {
        model.trigger('error', model, resp, options);
      }
    };
  };

  // Helper function to escape a string for HTML rendering.
  var escapeHTML = function(string) {
    return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

}).call(this);
/*!
ICanHaz.js version 0.9 -- by @HenrikJoreteg
More info at: http://icanhazjs.com
*/
(function ($) {
/*!
  mustache.js -- Logic-less templates in JavaScript

  by @janl (MIT Licensed, https://github.com/janl/mustache.js/blob/master/LICENSE).

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the curent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || partials[name] === undefined) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.0",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();/*!
  ICanHaz.js -- by @HenrikJoreteg
*/
/*global jQuery  */
function ICanHaz() {
    var self = this;
    self.VERSION = "0.9";
    self.templates = {};
    self.partials = {};
    
    // public function for adding templates
    // We're enforcing uniqueness to avoid accidental template overwrites.
    // If you want a different template, it should have a different name.
    self.addTemplate = function (name, templateString) {
        if (self[name]) throw "Invalid name: " + name + ".";
        if (self.templates[name]) throw "Template \" + name + \" exists";
        
        self.templates[name] = templateString;
        self[name] = function (data, raw) {
            data = data || {};
            var result = Mustache.to_html(self.templates[name], data, self.partials);
            return raw ? result : $(result);
        };       
    };
    
    // public function for adding partials
    self.addPartial = function (name, templateString) {
        if (self.partials[name]) {
            throw "Partial \" + name + \" exists";
        } else {
            self.partials[name] = templateString;
        }
    };
    
    // grabs templates from the DOM and caches them.
    // Loop through and add templates.
    // Whitespace at beginning and end of all templates inside <script> tags will 
    // be trimmed. If you want whitespace around a partial, add it in the parent, 
    // not the partial. Or do it explicitly using <br/> or &nbsp;
    self.grabTemplates = function () {        
        $('script[type="text/html"]').each(function (a, b) {
            var script = $((typeof a === 'number') ? b : a), // Zepto doesn't bind this
                text = (''.trim) ? script.html().trim() : $.trim(script.html());
            
            self[script.hasClass('partial') ? 'addPartial' : 'addTemplate'](script.attr('id'), text);
            script.remove();
        });
    };
    
    // clears all retrieval functions and empties caches
    self.clearAll = function () {
        for (var key in self.templates) {
            delete self[key];
        }
        self.templates = {};
        self.partials = {};
    };
    
    self.refresh = function () {
        self.clearAll();
        self.grabTemplates();
    };
}

window.ich = new ICanHaz();

// init itself on document ready
$(function () {
    ich.grabTemplates();
});
})(window.jQuery || window.Zepto);
/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.7.1 - Last updated: 2010.10.08
 * 
 */

(function(){
function iScroll (el, options) {
	var that = this, i;
	that.element = typeof el == 'object' ? el : document.getElementById(el);
	that.wrapper = that.element.parentNode;

	that.element.style.webkitTransitionProperty = '-webkit-transform';
	that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
	that.element.style.webkitTransitionDuration = '0';
	that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;

	// Default options
	that.options = {
		bounce: has3d,
		momentum: has3d,
		checkDOMChanges: true,
		topOnDOMChanges: false,
		hScrollbar: has3d,
		vScrollbar: has3d,
		fadeScrollbar: isIthing || !isTouch,
		shrinkScrollbar: isIthing || !isTouch,
		desktopCompatibility: false,
		overflow: 'auto',
		snap: false,
		bounceLock: false,
		scrollbarColor: 'rgba(0,0,0,0.5)',
		onScrollEnd: function () {}
	};
	
	// User defined options
	if (typeof options == 'object') {
		for (i in options) {
			that.options[i] = options[i];
		}
	}

	if (that.options.desktopCompatibility) {
		that.options.overflow = 'hidden';
	}
	
	that.onScrollEnd = that.options.onScrollEnd;
	delete that.options.onScrollEnd;
	
	that.wrapper.style.overflow = that.options.overflow;
	
	that.refresh();

	window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);

	if (isTouch || that.options.desktopCompatibility) {
		that.element.addEventListener(START_EVENT, that, false);
		that.element.addEventListener(MOVE_EVENT, that, false);
		that.element.addEventListener(END_EVENT, that, false);
	}
	
	if (that.options.checkDOMChanges) {
		that.element.addEventListener('DOMSubtreeModified', that, false);
	}
}

iScroll.prototype = {
	x: 0,
	y: 0,
	enabled: true,

	handleEvent: function (e) {
		var that = this;
		
		switch (e.type) {
			case START_EVENT:
				that.touchStart(e);
				break;
			case MOVE_EVENT:
				that.touchMove(e);
				break;
			case END_EVENT:
				that.touchEnd(e);
				break;
			case 'webkitTransitionEnd':
				that.transitionEnd();
				break;
			case 'orientationchange':
			case 'resize':
				that.refresh();
				break;
			case 'DOMSubtreeModified':
				that.onDOMModified(e);
				break;
		}
	},
	
	onDOMModified: function (e) {
		var that = this;

		// (Hopefully) execute onDOMModified only once
		if (e.target.parentNode != that.element) {
			return;
		}

		setTimeout(function () { that.refresh(); }, 0);

		if (that.options.topOnDOMChanges && (that.x!=0 || that.y!=0)) {
			that.scrollTo(0,0,'0');
		}
	},

	refresh: function () {
		var that = this,
			resetX = that.x, resetY = that.y,
			snap;
		
		that.scrollWidth = that.wrapper.clientWidth;
		that.scrollHeight = that.wrapper.clientHeight;
		that.scrollerWidth = that.element.offsetWidth;
		that.scrollerHeight = that.element.offsetHeight;
		that.maxScrollX = that.scrollWidth - that.scrollerWidth;
		that.maxScrollY = that.scrollHeight - that.scrollerHeight;
		that.directionX = 0;
		that.directionY = 0;

		if (that.scrollX) {
			if (that.maxScrollX >= 0) {
				resetX = 0;
			} else if (that.x < that.maxScrollX) {
				resetX = that.maxScrollX;
			}
		}
		if (that.scrollY) {
			if (that.maxScrollY >= 0) {
				resetY = 0;
			} else if (that.y < that.maxScrollY) {
				resetY = that.maxScrollY;
			}
		}

		// Snap
		if (that.options.snap) {
			that.maxPageX = -Math.floor(that.maxScrollX/that.scrollWidth);
			that.maxPageY = -Math.floor(that.maxScrollY/that.scrollHeight);

			snap = that.snap(resetX, resetY);
			resetX = snap.x;
			resetY = snap.y;
		}

		if (resetX!=that.x || resetY!=that.y) {
			that.setTransitionTime('0');
			that.setPosition(resetX, resetY, true);
		}
		
		that.scrollX = that.scrollerWidth > that.scrollWidth;
		that.scrollY = !that.options.bounceLock && !that.scrollX || that.scrollerHeight > that.scrollHeight;

		// Update horizontal scrollbar
		if (that.options.hScrollbar && that.scrollX) {
			that.scrollBarX = that.scrollBarX || new scrollbar('horizontal', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
			that.scrollBarX.init(that.scrollWidth, that.scrollerWidth);
		} else if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		// Update vertical scrollbar
		if (that.options.vScrollbar && that.scrollY && that.scrollerHeight > that.scrollHeight) {
			that.scrollBarY = that.scrollBarY || new scrollbar('vertical', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
			that.scrollBarY.init(that.scrollHeight, that.scrollerHeight);
		} else if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
	},

	setPosition: function (x, y, hideScrollBars) {
		var that = this;
		
		that.x = x;
		that.y = y;

		that.element.style.webkitTransform = translateOpen + that.x + 'px,' + that.y + 'px' + translateClose;

		// Move the scrollbars
		if (!hideScrollBars) {
			if (that.scrollBarX) {
				that.scrollBarX.setPosition(that.x);
			}
			if (that.scrollBarY) {
				that.scrollBarY.setPosition(that.y);
			}
		}
	},
	
	setTransitionTime: function(time) {
		var that = this;
		
		time = time || '0';
		that.element.style.webkitTransitionDuration = time;
		
		if (that.scrollBarX) {
			that.scrollBarX.bar.style.webkitTransitionDuration = time;
			that.scrollBarX.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
		if (that.scrollBarY) {
			that.scrollBarY.bar.style.webkitTransitionDuration = time;
			that.scrollBarY.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
	},
		
	touchStart: function(e) {
		var that = this,
			matrix;
		
		if (!that.enabled) {
			return;
		}
		
		if (e.target.tagName != "SELECT") 
		{ 
		     e.preventDefault(); 
		     e.stopPropagation(); 
		}
		
		that.scrolling = true;		// This is probably not needed, but may be useful if iScroll is used in conjuction with other frameworks

		that.moved = false;
		that.distX = 0;
		that.distY = 0;

		that.setTransitionTime('0');

		// Check if the scroller is really where it should be
		if (that.options.momentum || that.options.snap) {
			matrix = new WebKitCSSMatrix(window.getComputedStyle(that.element).webkitTransform);
			if (matrix.e != that.x || matrix.f != that.y) {
				document.removeEventListener('webkitTransitionEnd', that, false);
				that.setPosition(matrix.e, matrix.f);
				that.moved = true;
			}
		}

		that.touchStartX = isTouch ? e.changedTouches[0].pageX : e.pageX;
		that.scrollStartX = that.x;

		that.touchStartY = isTouch ? e.changedTouches[0].pageY : e.pageY;
		that.scrollStartY = that.y;

		that.scrollStartTime = e.timeStamp;

		that.directionX = 0;
		that.directionY = 0;
	},
	
	touchMove: function(e) {
		if (!this.scrolling) {
			return;
		}

		var that = this,
			pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
			pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
			leftDelta = that.scrollX ? pageX - that.touchStartX : 0,
			topDelta = that.scrollY ? pageY - that.touchStartY : 0,
			newX = that.x + leftDelta,
			newY = that.y + topDelta;

		//e.preventDefault();
		e.stopPropagation();	// Stopping propagation just saves some cpu cycles (I presume)

		that.touchStartX = pageX;
		that.touchStartY = pageY;

		// Slow down if outside of the boundaries
		if (newX >= 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? Math.round(that.x + leftDelta / 3) : (newX >= 0 || that.maxScrollX>=0) ? 0 : that.maxScrollX;
		}
		if (newY >= 0 || newY < that.maxScrollY) { 
			newY = that.options.bounce ? Math.round(that.y + topDelta / 3) : (newY >= 0 || that.maxScrollY>=0) ? 0 : that.maxScrollY;
		}

		if (that.distX + that.distY > 5) {			// 5 pixels threshold

			// Lock scroll direction
			if (that.distX-3 > that.distY) {
				newY = that.y;
				topDelta = 0;
			} else if (that.distY-3 > that.distX) {
				newX = that.x;
				leftDelta = 0;
			}

			that.setPosition(newX, newY);
			that.moved = true;
			that.directionX = leftDelta > 0 ? -1 : 1;
			that.directionY = topDelta > 0 ? -1 : 1;
		} else {
			that.distX+= Math.abs(leftDelta);
			that.distY+= Math.abs(topDelta);
//			that.dist+= Math.abs(leftDelta) + Math.abs(topDelta);
		}
	},
	
	touchEnd: function(e) {
		if (!this.scrolling) {
			return;
		}

		var that = this,
			time = e.timeStamp - that.scrollStartTime,
			point = isTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX, momentumY,
			newDuration = 0,
			newPositionX = that.x, newPositionY = that.y,
			snap;

		that.scrolling = false;

		if (!that.moved) {
			that.resetPosition();

			if (isTouch) {
				// Find the last touched element
				target = point.target;
				while (target.nodeType != 1) {
					target = target.parentNode;
				}

				// Create the fake event
				ev = document.createEvent('MouseEvents');
				ev.initMouseEvent('click', true, true, e.view, 1,
					point.screenX, point.screenY, point.clientX, point.clientY,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					0, null);
				ev._fake = true;
				target.dispatchEvent(ev);
			}

			return;
		}

		if (!that.options.snap && time > 250) {			// Prevent slingshot effect
			that.resetPosition();
			return;
		}

		if (that.options.momentum) {
			momentumX = that.scrollX === true
				? that.momentum(that.x - that.scrollStartX,
								time,
								that.options.bounce ? -that.x + that.scrollWidth/5 : -that.x,
								that.options.bounce ? that.x + that.scrollerWidth - that.scrollWidth + that.scrollWidth/5 : that.x + that.scrollerWidth - that.scrollWidth)
				: { dist: 0, time: 0 };

			momentumY = that.scrollY === true
				? that.momentum(that.y - that.scrollStartY,
								time,
								that.options.bounce ? -that.y + that.scrollHeight/5 : -that.y,
								that.options.bounce ? (that.maxScrollY < 0 ? that.y + that.scrollerHeight - that.scrollHeight : 0) + that.scrollHeight/5 : that.y + that.scrollerHeight - that.scrollHeight)
				: { dist: 0, time: 0 };

			newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);		// The minimum animation length must be 1ms
			newPositionX = that.x + momentumX.dist;
			newPositionY = that.y + momentumY.dist;
		}

		if (that.options.snap) {
			snap = that.snap(newPositionX, newPositionY);
			newPositionX = snap.x;
			newPositionY = snap.y;
			newDuration = Math.max(snap.time, newDuration);
		}

		that.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
	},

	transitionEnd: function () {
		var that = this;
		document.removeEventListener('webkitTransitionEnd', that, false);
		that.resetPosition();
	},

	resetPosition: function () {
		var that = this,
			resetX = that.x,
		 	resetY = that.y;

		if (that.x >= 0) {
			resetX = 0;
		} else if (that.x < that.maxScrollX) {
			resetX = that.maxScrollX;
		}

		if (that.y >= 0 || that.maxScrollY > 0) {
			resetY = 0;
		} else if (that.y < that.maxScrollY) {
			resetY = that.maxScrollY;
		}
		
		if (resetX != that.x || resetY != that.y) {
			that.scrollTo(resetX, resetY);
		} else {
			if (that.moved) {
				that.onScrollEnd();		// Execute custom code on scroll end
				that.moved = false;
			}

			// Hide the scrollbars
			if (that.scrollBarX) {
				that.scrollBarX.hide();
			}
			if (that.scrollBarY) {
				that.scrollBarY.hide();
			}
		}
	},
	
	snap: function (x, y) {
		var that = this, time;

		if (that.directionX > 0) {
			x = Math.floor(x/that.scrollWidth);
		} else if (that.directionX < 0) {
			x = Math.ceil(x/that.scrollWidth);
		} else {
			x = Math.round(x/that.scrollWidth);
		}
		that.pageX = -x;
		x = x * that.scrollWidth;
		if (x > 0) {
			x = that.pageX = 0;
		} else if (x < that.maxScrollX) {
			that.pageX = that.maxPageX;
			x = that.maxScrollX;
		}

		if (that.directionY > 0) {
			y = Math.floor(y/that.scrollHeight);
		} else if (that.directionY < 0) {
			y = Math.ceil(y/that.scrollHeight);
		} else {
			y = Math.round(y/that.scrollHeight);
		}
		that.pageY = -y;
		y = y * that.scrollHeight;
		if (y > 0) {
			y = that.pageY = 0;
		} else if (y < that.maxScrollY) {
			that.pageY = that.maxPageY;
			y = that.maxScrollY;
		}

		// Snap with constant speed (proportional duration)
		time = Math.round(Math.max(
				Math.abs(that.x - x) / that.scrollWidth * 500,
				Math.abs(that.y - y) / that.scrollHeight * 500
			));
			
		return { x: x, y: y, time: time };
	},

	scrollTo: function (destX, destY, runtime) {
		var that = this;

		if (that.x == destX && that.y == destY) {
			that.resetPosition();
			return;
		}

		that.moved = true;
		that.setTransitionTime(runtime || '350ms');
		that.setPosition(destX, destY);

		if (runtime==='0' || runtime=='0s' || runtime=='0ms') {
			that.resetPosition();
		} else {
			document.addEventListener('webkitTransitionEnd', that, false);	// At the end of the transition check if we are still inside of the boundaries
		}
	},
	
	scrollToPage: function (pageX, pageY, runtime) {
		var that = this, snap;

		if (!that.options.snap) {
			that.pageX = -Math.round(that.x / that.scrollWidth);
			that.pageY = -Math.round(that.y / that.scrollHeight);
		}

		if (pageX == 'next') {
			pageX = ++that.pageX;
		} else if (pageX == 'prev') {
			pageX = --that.pageX;
		}

		if (pageY == 'next') {
			pageY = ++that.pageY;
		} else if (pageY == 'prev') {
			pageY = --that.pageY;
		}

		pageX = -pageX*that.scrollWidth;
		pageY = -pageY*that.scrollHeight;

		snap = that.snap(pageX, pageY);
		pageX = snap.x;
		pageY = snap.y;

		that.scrollTo(pageX, pageY, runtime || '500ms');
	},

	scrollToElement: function (el, runtime) {
		el = typeof el == 'object' ? el : this.element.querySelector(el);

		if (!el) {
			return;
		}

		var that = this,
			x = that.scrollX ? -el.offsetLeft : 0,
			y = that.scrollY ? -el.offsetTop : 0;

		if (x >= 0) {
			x = 0;
		} else if (x < that.maxScrollX) {
			x = that.maxScrollX;
		}

		if (y >= 0) {
			y = 0;
		} else if (y < that.maxScrollY) {
			y = that.maxScrollY;
		}

		that.scrollTo(x, y, runtime);
	},

	momentum: function (dist, time, maxDistUpper, maxDistLower) {
		var friction = 2.5,
			deceleration = 1.2,
			speed = Math.abs(dist) / time * 1000,
			newDist = speed * speed / friction / 1000,
			newTime = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			speed = speed * maxDistUpper / newDist / friction;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			speed = speed * maxDistLower / newDist / friction;
			newDist = maxDistLower;
		}
		
		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: Math.round(newDist), time: Math.round(newTime) };
	},
	
	destroy: function (full) {
		var that = this;

		window.removeEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);		
		that.element.removeEventListener(START_EVENT, that, false);
		that.element.removeEventListener(MOVE_EVENT, that, false);
		that.element.removeEventListener(END_EVENT, that, false);
		document.removeEventListener('webkitTransitionEnd', that, false);

		if (that.options.checkDOMChanges) {
			that.element.removeEventListener('DOMSubtreeModified', that, false);
		}

		if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
		
		if (full) {
			that.wrapper.parentNode.removeChild(that.wrapper);
		}
		
		return null;
	}
};

function scrollbar (dir, wrapper, fade, shrink, color) {
	var that = this,
		doc = document;
	
	that.dir = dir;
	that.fade = fade;
	that.shrink = shrink;
	that.uid = ++uid;

	// Create main scrollbar
	that.bar = doc.createElement('div');

	that.bar.style.cssText = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:' + color + ';' +
		'-webkit-transform:' + translateOpen + '0,0' + translateClose + ';' +
		(dir == 'horizontal' ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px');

	// Create scrollbar wrapper
	that.wrapper = doc.createElement('div');
	that.wrapper.style.cssText = '-webkit-mask:-webkit-canvas(scrollbar' + that.uid + that.dir + ');position:absolute;z-index:10;pointer-events:none;overflow:hidden;opacity:0;-webkit-transition-duration:' + (fade ? '300ms' : '0') + ';-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
		(that.dir == 'horizontal' ? 'bottom:2px;left:2px;right:7px;height:5px' : 'top:2px;right:2px;bottom:7px;width:5px;');

	// Add scrollbar to the DOM
	that.wrapper.appendChild(that.bar);
	wrapper.appendChild(that.wrapper);
}

scrollbar.prototype = {
	init: function (scroll, size) {
		var that = this,
			doc = document,
			pi = Math.PI,
			ctx;

		// Create scrollbar mask
		if (that.dir == 'horizontal') {
			if (that.maxSize != that.wrapper.offsetWidth) {
				that.maxSize = that.wrapper.offsetWidth;
				ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, that.maxSize, 5);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.beginPath();
				ctx.arc(2.5, 2.5, 2.5, pi/2, -pi/2, false);
				ctx.lineTo(that.maxSize-2.5, 0);
				ctx.arc(that.maxSize-2.5, 2.5, 2.5, -pi/2, pi/2, false);
				ctx.closePath();
				ctx.fill();
			}
		} else {
			if (that.maxSize != that.wrapper.offsetHeight) {
				that.maxSize = that.wrapper.offsetHeight;
				ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, 5, that.maxSize);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.beginPath();
				ctx.arc(2.5, 2.5, 2.5, pi, 0, false);
				ctx.lineTo(5, that.maxSize-2.5);
				ctx.arc(2.5, that.maxSize-2.5, 2.5, 0, pi, false);
				ctx.closePath();
				ctx.fill();
			}
		}

		that.size = Math.max(Math.round(that.maxSize * that.maxSize / size), 6);
		that.maxScroll = that.maxSize - that.size;
		that.toWrapperProp = that.maxScroll / (scroll - size);
		that.bar.style[that.dir == 'horizontal' ? 'width' : 'height'] = that.size + 'px';
	},
	
	setPosition: function (pos) {
		var that = this;
		
		if (that.wrapper.style.opacity != '1') {
			that.show();
		}

		pos = Math.round(that.toWrapperProp * pos);

		if (pos < 0) {
			pos = that.shrink ? pos + pos*3 : 0;
			if (that.size + pos < 7) {
				pos = -that.size + 6;
			}
		} else if (pos > that.maxScroll) {
			pos = that.shrink ? pos + (pos-that.maxScroll)*3 : that.maxScroll;
			if (that.size + that.maxScroll - pos < 7) {
				pos = that.size + that.maxScroll - 6;
			}
		}

		pos = that.dir == 'horizontal'
			? translateOpen + pos + 'px,0' + translateClose
			: translateOpen + '0,' + pos + 'px' + translateClose;

		that.bar.style.webkitTransform = pos;
	},

	show: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '0';
		}
		this.wrapper.style.opacity = '1';
	},

	hide: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '350ms';
		}
		this.wrapper.style.opacity = '0';
	},
	
	remove: function () {
		this.wrapper.parentNode.removeChild(this.wrapper);
		return null;
	}
};

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
	// Device sniffing
	isIthing = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouch = ('ontouchstart' in window),
	// Event sniffing
	START_EVENT = isTouch ? 'touchstart' : 'mousedown',
	MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
	END_EVENT = isTouch ? 'touchend' : 'mouseup',
	// Translate3d helper
	translateOpen = 'translate' + (has3d ? '3d(' : '('),
	translateClose = has3d ? ',0)' : ')',
	// Unique ID
	uid = 0;

// Expose iScroll to the world
window.iScroll = iScroll;
})();
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var module = cache[name], path = expand(root, name), fn;
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: name, exports: {}};
        try {
          cache[name] = module.exports;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return cache[name] = module.exports;
        } catch (err) {
          delete cache[name];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"collections/form_fields": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.FormFieldsCollection = (function() {
    __extends(FormFieldsCollection, Backbone.Collection);
    function FormFieldsCollection() {
      FormFieldsCollection.__super__.constructor.apply(this, arguments);
    }
    FormFieldsCollection.prototype.sync = app.ui.JSONPSync;
    FormFieldsCollection.prototype.model = app.models.field;
    return FormFieldsCollection;
  })();
}).call(this);
}, "collections/forms": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.FormsCollection = (function() {
    __extends(FormsCollection, Backbone.Collection);
    function FormsCollection() {
      FormsCollection.__super__.constructor.apply(this, arguments);
    }
    FormsCollection.prototype.sync = app.ui.JSONPSync;
    FormsCollection.prototype.model = app.models.form;
    FormsCollection.prototype.url = app.ui.get("/accounts/1/forms.json?callback=?");
    return FormsCollection;
  })();
}).call(this);
}, "collections/records": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.RecordsCollection = (function() {
    __extends(RecordsCollection, Backbone.Collection);
    function RecordsCollection() {
      RecordsCollection.__super__.constructor.apply(this, arguments);
    }
    RecordsCollection.prototype.sync = app.ui.JSONPSync;
    RecordsCollection.prototype.model = app.models.record;
    return RecordsCollection;
  })();
}).call(this);
}, "collections/reports": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.ReportsCollection = (function() {
    __extends(ReportsCollection, Backbone.Collection);
    function ReportsCollection() {
      ReportsCollection.__super__.constructor.apply(this, arguments);
    }
    ReportsCollection.prototype.model = app.models.report;
    ReportsCollection.prototype.sync = app.ui.JSONPSync;
    ReportsCollection.prototype.url = app.ui.get("/accounts/1/reports.json?callback=?");
    return ReportsCollection;
  })();
}).call(this);
}, "helpers/ui": function(exports, require, module) {(function() {
  exports.JSONPSync = function(method, model, options) {
    options.timeout = 10000;
    options.dataType = "jsonp";
    return Backbone.sync(method, model, options);
  };
  exports.base_path = function() {
    return "https://app.workory.com";
  };
  exports.get = function(path) {
    return "" + (exports.base_path()) + path;
  };
  exports.bind_pressed_event = function() {};
  exports.page = function(size) {
    if (size === "full") {} else {

    }
  };
  exports.set_title = function(title) {
    return $("li.middle h1").html(title);
  };
  exports.set_navbar = function(item) {
    $("a[data-tabbar-item]").removeClass("enabled");
    return $("a[data-tabbar-item=" + item + "]").addClass("enabled");
  };
  exports.no_buttons = function() {
    return $("#header li.left").html("");
  };
  exports.back_button = function(title) {
    $("#header li.left").html(ich.buttonleft({
      title: title
    }));
    return $("div#header li.left a.back div.body").width($("div#header li.left a.back div.body p").width() + 12);
  };
  exports.current_user = function(user) {
    if (user) {
      return this.user = app.models.user;
    } else {
      return this.user;
    }
  };
}).call(this);
}, "main": function(exports, require, module) {(function() {
  window.app = {};
  app.ui = require("helpers/ui");
  app.current_user = {};
  app.routers = {};
  app.routers.main = require('routers/main_router').MainRouter;
  app.routers.forms = require('routers/forms').FormsRouter;
  app.routers.reports = require('routers/reports').ReportsRouter;
  app.routers.records = require('routers/records').RecordsRouter;
  app.models = {};
  app.models.user = require("models/user").User;
  app.models.form = require("models/form").Form;
  app.models.field = require("models/field").Field;
  app.models.record = require("models/record").Record;
  app.models.report = require("models/report").Report;
  app.collections = {};
  app.collections.forms = require("collections/forms").FormsCollection;
  app.collections.forms.fields = require("collections/form_fields").FormFieldsCollection;
  app.collections.reports = require("collections/reports").ReportsCollection;
  app.collections.records = require("collections/records").RecordsCollection;
  app.views = {};
  app.views.navigation = require('views/navigation').Navigation;
  app.views.listview = require('views/listview').Listview;
  app.views.home = require('views/home').Home;
  app.views.forms = {};
  app.views.forms.index = require("views/forms/index").FormsIndex;
  app.views.forms.show = require("views/forms/show").FormsShow;
  app.views.reports = {};
  app.views.reports.index = require("views/reports/index").ReportsIndex;
  app.views.reports.show = require("views/reports/show").ReportsShow;
  app.views.records = {};
  app.views.records.show = require("views/records/show").RecordsShow;
  $(document).ready(function() {
    app.initialize = function(user) {
      var forms, main, records, reports;
      app.current_user = user;
      new app.views.navigation({
        el: $("#tabbar")
      });
      new app.views.home();
      new app.views.listview({
        el: $("#content")
      });
      main = new app.routers.main();
      forms = new app.routers.forms();
      reports = new app.routers.reports();
      records = new app.routers.records();
      if (Backbone.history.getFragment() === '') {
        return main.navigate('home', true);
      }
    };
    return $.getJSON("https://app.workory.com/home.json?callback=?", function(user) {
      app.initialize(user);
      return Backbone.history.start();
    });
  });
}).call(this);
}, "models/field": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Field = (function() {
    __extends(Field, Backbone.Model);
    function Field() {
      Field.__super__.constructor.apply(this, arguments);
    }
    return Field;
  })();
}).call(this);
}, "models/form": function(exports, require, module) {(function() {
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
}, "models/record": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Record = (function() {
    __extends(Record, Backbone.Model);
    function Record() {
      Record.__super__.constructor.apply(this, arguments);
    }
    return Record;
  })();
}).call(this);
}, "models/report": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Report = (function() {
    __extends(Report, Backbone.Model);
    function Report() {
      Report.__super__.constructor.apply(this, arguments);
    }
    return Report;
  })();
}).call(this);
}, "models/user": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.User = (function() {
    __extends(User, Backbone.Model);
    function User() {
      User.__super__.constructor.apply(this, arguments);
    }
    return User;
  })();
}).call(this);
}, "routers/forms": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.FormsRouter = (function() {
    __extends(FormsRouter, Backbone.Router);
    function FormsRouter() {
      FormsRouter.__super__.constructor.apply(this, arguments);
    }
    FormsRouter.prototype.routes = {
      "forms": "index",
      "/books/:book_id/forms/:id": "show"
    };
    FormsRouter.prototype.index = function() {
      var forms;
      forms = new app.collections.forms();
      return forms.fetch({
        success: function(collection, resp) {
          var index;
          index = new app.views.forms.index({
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
      fields = new app.collections.forms.fields();
      fields.url = app.ui.get("/books/" + book_id + "/forms/" + id + ".json?callback=?");
      return fields.fetch({
        success: function(collection, resp) {
          var show;
          show = new app.views.forms.show({
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
}, "routers/main_router": function(exports, require, module) {(function() {
  var Home;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Home = require('views/home').Home;
  exports.MainRouter = (function() {
    var home;
    __extends(MainRouter, Backbone.Router);
    function MainRouter() {
      MainRouter.__super__.constructor.apply(this, arguments);
    }
    MainRouter.prototype.routes = {
      "home": "index"
    };
    MainRouter.prototype.index = function() {};
    home = new Home({
      el: $("content")
    });
    home.render();
    return MainRouter;
  })();
}).call(this);
}, "routers/records": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.RecordsRouter = (function() {
    __extends(RecordsRouter, Backbone.Router);
    function RecordsRouter() {
      RecordsRouter.__super__.constructor.apply(this, arguments);
    }
    RecordsRouter.prototype.routes = {
      "/books/:book_id/records/:id": "show"
    };
    RecordsRouter.prototype.show = function(book_id, id) {
      return $.getJSON(app.ui.get("/books/" + book_id + "/records/" + id + ".json?callback=?"), function(data) {
        var show;
        show = new app.views.records.show({
          item: data,
          el: $("#page")
        });
        return show.render();
      });
    };
    return RecordsRouter;
  })();
}).call(this);
}, "routers/reports": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.ReportsRouter = (function() {
    __extends(ReportsRouter, Backbone.Router);
    function ReportsRouter() {
      ReportsRouter.__super__.constructor.apply(this, arguments);
    }
    ReportsRouter.prototype.routes = {
      "reports": "index",
      "/books/:book_id/reports/:id": "show"
    };
    ReportsRouter.prototype.index = function() {
      var reports;
      reports = new app.collections.reports();
      return reports.fetch({
        success: function(collection, resp) {
          var index;
          index = new app.views.reports.index({
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
      records = new app.collections.records();
      records.url = app.ui.get("/books/" + book_id + "/reports/" + id + ".json?callback=?");
      return records.fetch({
        success: function(collection, resp) {
          var show;
          show = new app.views.reports.show({
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
}, "templates/home": function(exports, require, module) {module.exports = function(__obj) {
  if (!__obj) __obj = {};
  var __out = [], __capture = function(callback) {
    var out = __out, result;
    __out = [];
    callback.call(this);
    result = __out.join('');
    __out = out;
    return __safe(result);
  }, __sanitize = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else if (typeof value !== 'undefined' && value != null) {
      return __escape(value);
    } else {
      return '';
    }
  }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
  __safe = __obj.safe = function(value) {
    if (value && value.ecoSafe) {
      return value;
    } else {
      if (!(typeof value !== 'undefined' && value != null)) value = '';
      var result = new String(value);
      result.ecoSafe = true;
      return result;
    }
  };
  if (!__escape) {
    __escape = __obj.escape = function(value) {
      return ('' + value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
  }
  (function() {
    (function() {
      __out.push('<!-- START you can remove this -->\n<div id="content">\n  <span id="props">with coffee</span>\n  <h1>brunch</h1>\n  <h2>Welcome!</h2>\n  <ul>\n    <li><a href="http://brunchwithcoffee.com/#documentation">Documentation</a></li>\n    <li><a href="https://github.com/brunch/brunch/issues">Github Issues</a></li>\n    <li><a href="https://github.com/brunch/example-todos">Todos Example App</a></li>\n  </ul>\n</div>\n<!-- END you can remove this -->\n');
    }).call(this);
    
  }).call(__obj);
  __obj.safe = __objSafe, __obj.escape = __escape;
  return __out.join('');
}}, "views/forms/index": function(exports, require, module) {(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.FormsIndex = (function() {
    __extends(FormsIndex, Backbone.View);
    function FormsIndex() {
      this.render = __bind(this.render, this);
      FormsIndex.__super__.constructor.apply(this, arguments);
    }
    FormsIndex.prototype.initialize = function() {
      app.ui.set_title("Forms");
      app.ui.set_navbar("forms");
      return app.ui.no_buttons();
    };
    FormsIndex.prototype.render = function() {
      return $("#content").html(ich.navlist({
        items: this.options.items.toJSON(),
        url: function() {
          return "#/books/" + this.book_id + "/forms/" + this.id;
        }
      }));
    };
    return FormsIndex;
  })();
}).call(this);
}, "views/forms/show": function(exports, require, module) {(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.FormsShow = (function() {
    __extends(FormsShow, Backbone.View);
    function FormsShow() {
      this.render = __bind(this.render, this);
      FormsShow.__super__.constructor.apply(this, arguments);
    }
    FormsShow.prototype.initialize = function() {
      return app.ui.back_button("Forms");
    };
    FormsShow.prototype.render = function() {
      app.ui.page("full");
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
}, "views/home": function(exports, require, module) {(function() {
  var homeTemplate;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  homeTemplate = require('templates/home');
  exports.Home = (function() {
    __extends(Home, Backbone.View);
    function Home() {
      Home.__super__.constructor.apply(this, arguments);
    }
    Home.prototype.render = function() {};
    $(Home.el).html("test");
    return Home;
  })();
}).call(this);
}, "views/listview": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Listview = (function() {
    __extends(Listview, Backbone.View);
    function Listview() {
      Listview.__super__.constructor.apply(this, arguments);
    }
    Listview.prototype.events = {
      "click ul[data-role=listview] li": "select"
    };
    Listview.prototype.select = function(e) {
      $(e.currentTarget).addClass("pressed");
      app.ui.set_title($(e.currentTarget).find("a")[0].text);
      return window.location.hash = $(e.currentTarget).find("a").attr("href");
    };
    return Listview;
  })();
}).call(this);
}, "views/navigation": function(exports, require, module) {(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.Navigation = (function() {
    __extends(Navigation, Backbone.View);
    function Navigation() {
      Navigation.__super__.constructor.apply(this, arguments);
    }
    Navigation.prototype.events = {
      "click li": "jump"
    };
    Navigation.prototype.jump = function(e) {
      app.ui.set_navbar($("a", $(e.currentTarget)).attr("data-tabbar-item"));
      return false;
    };
    return Navigation;
  })();
}).call(this);
}, "views/records/show": function(exports, require, module) {(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.RecordsShow = (function() {
    __extends(RecordsShow, Backbone.View);
    function RecordsShow() {
      this.render = __bind(this.render, this);
      RecordsShow.__super__.constructor.apply(this, arguments);
    }
    RecordsShow.prototype.initialize = function() {
      return app.ui.back_button("Report");
    };
    RecordsShow.prototype.render = function() {
      app.ui.page("full");
      return $("#content").html(ich.recordshow({
        item: this.options.item,
        values: this.options.item.values
      }));
    };
    return RecordsShow;
  })();
}).call(this);
}, "views/reports/index": function(exports, require, module) {(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.ReportsIndex = (function() {
    __extends(ReportsIndex, Backbone.View);
    function ReportsIndex() {
      this.render = __bind(this.render, this);
      ReportsIndex.__super__.constructor.apply(this, arguments);
    }
    ReportsIndex.prototype.initialize = function() {
      app.ui.set_title("Reports");
      app.ui.set_navbar("reports");
      return app.ui.no_buttons();
    };
    ReportsIndex.prototype.render = function() {
      $("#content").html(ich.navlist({
        items: this.options.items.toJSON(),
        url: function() {
          return "#/books/" + this.book_id + "/reports/" + this.id;
        }
      }));
      return app.ui.bind_pressed_event();
    };
    return ReportsIndex;
  })();
}).call(this);
}, "views/reports/show": function(exports, require, module) {(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  exports.ReportsShow = (function() {
    __extends(ReportsShow, Backbone.View);
    function ReportsShow() {
      this.render = __bind(this.render, this);
      ReportsShow.__super__.constructor.apply(this, arguments);
    }
    ReportsShow.prototype.initialize = function() {
      return app.ui.back_button("Reports");
    };
    ReportsShow.prototype.render = function() {
      return $("#content").html(ich.reportshow({
        items: this.options.items.toJSON()
      }));
    };
    return ReportsShow;
  })();
}).call(this);
}});
