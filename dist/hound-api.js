(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  Symbol.iterator = Symbol();
  freeze(SymbolValue.prototype);
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name] && !privateNames[name])
        rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (privateNames[name])
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    createPrivateName: createPrivateName,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    privateNames: privateNames,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toObject: toObject,
    isObject: isObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf,
    checkObjectCoercible: checkObjectCoercible,
    hasOwnProperty: function(o, p) {
      return hasOwnProperty.call(o, p);
    },
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    keys: $keys
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        return this.value_ = this.func.call(global);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/utils";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Map";
  var $__3 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      isObject = $__3.isObject,
      maybeAddIterator = $__3.maybeAddIterator,
      registerPolyfill = $__3.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__5 = iterable[Symbol.iterator](),
          $__6; !($__6 = $__5.next()).done; ) {
        var $__7 = $__6.value,
            key = $__7[0],
            value = $__7[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__8() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__8, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__9() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__9, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__10() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__7 = global,
        Object = $__7.Object,
        Symbol = $__7.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Map" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Set";
  var $__11 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      isObject = $__11.isObject,
      maybeAddIterator = $__11.maybeAddIterator,
      registerPolyfill = $__11.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Map").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__15 = iterable[Symbol.iterator](),
          $__16; !($__16 = $__15.next()).done; ) {
        var item = $__16.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__13 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__13);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__18() {
      var $__19,
          $__20;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__19 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__20 = $__19[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__20.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__20.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__20.value;
            default:
              return $ctx.end();
          }
      }, $__18, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__21() {
      var $__22,
          $__23;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__22 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__23 = $__22[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__23.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__23.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__23.value;
            default:
              return $ctx.end();
          }
      }, $__21, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__17 = global,
        Object = $__17.Object,
        Symbol = $__17.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Set" + '');
System.register("traceur-runtime@0.0.66/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/node_modules/rsvp/lib/rsvp/asap";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.66/node_modules/rsvp/lib/rsvp/asap").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Promise" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/StringIterator", [], function() {
  "use strict";
  var $__29;
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/StringIterator";
  var $__27 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      createIteratorResultObject = $__27.createIteratorResultObject,
      isObject = $__27.isObject;
  var $__30 = $traceurRuntime,
      hasOwnProperty = $__30.hasOwnProperty,
      toProperty = $__30.toProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__29 = {}, Object.defineProperty($__29, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__29, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__29), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/String";
  var createStringIterator = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/StringIterator").createStringIterator;
  var $__32 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__32.maybeAddFunctions,
      maybeAddIterator = $__32.maybeAddIterator,
      registerPolyfill = $__32.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/String" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__36;
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/ArrayIterator";
  var $__34 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      toObject = $__34.toObject,
      toUint32 = $__34.toUint32,
      createIteratorResultObject = $__34.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__36 = {}, Object.defineProperty($__36, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__36, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__36), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Array";
  var $__37 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/ArrayIterator"),
      entries = $__37.entries,
      keys = $__37.keys,
      values = $__37.values;
  var $__38 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      checkIterable = $__38.checkIterable,
      isCallable = $__38.isCallable,
      isConstructor = $__38.isConstructor,
      maybeAddFunctions = $__38.maybeAddFunctions,
      maybeAddIterator = $__38.maybeAddIterator,
      registerPolyfill = $__38.registerPolyfill,
      toInteger = $__38.toInteger,
      toLength = $__38.toLength,
      toObject = $__38.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__39 = items[Symbol.iterator](),
          $__40; !($__40 = $__39.next()).done; ) {
        var item = $__40.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__41 = 0; $__41 < arguments.length; $__41++)
      items[$__41] = arguments[$__41];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      if (i in object) {
        var value = object[i];
        if (predicate.call(thisArg, value, i, object)) {
          return returnIndex ? i : value;
        }
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__42 = global,
        Array = $__42.Array,
        Object = $__42.Object,
        Symbol = $__42.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Array" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Object";
  var $__43 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__43.maybeAddFunctions,
      registerPolyfill = $__43.registerPolyfill;
  var $__44 = $traceurRuntime,
      defineProperty = $__44.defineProperty,
      getOwnPropertyDescriptor = $__44.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__44.getOwnPropertyNames,
      keys = $__44.keys,
      privateNames = $__44.privateNames;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (privateNames[name])
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (privateNames[name])
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Object" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/Number";
  var $__46 = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils"),
      isNumber = $__46.isNumber,
      maybeAddConsts = $__46.maybeAddConsts,
      maybeAddFunctions = $__46.maybeAddFunctions,
      registerPolyfill = $__46.registerPolyfill,
      toInteger = $__46.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/Number" + '');
System.register("traceur-runtime@0.0.66/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.66/src/runtime/polyfills/polyfills";
  var polyfillAll = System.get("traceur-runtime@0.0.66/src/runtime/polyfills/utils").polyfillAll;
  polyfillAll(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.66/src/runtime/polyfills/polyfills" + '');

System.register("models/internal/debug-helpers", [], function() {
  "use strict";
  var __moduleName = "models/internal/debug-helpers";
  var debug = {
    log: false,
    warn: true,
    error: true
  };
  var isDevAndDebug = function() {
    return window.mhDebug && (window.location.host === 'local.mediahound.com:2014');
  };
  var log = function(override) {
    for (var args = [],
        $__0 = 1; $__0 < arguments.length; $__0++)
      args[$__0 - 1] = arguments[$__0];
    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.log && (override || debug.log || isDevAndDebug())) {
      console.log.apply(console, arguments);
    }
  };
  var warn = function(override) {
    for (var args = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      args[$__1 - 1] = arguments[$__1];
    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.warn && (override || debug.warn || isDevAndDebug())) {
      console.warn.apply(console, args);
    }
  };
  var error = function(override) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.error && (override || debug.error || isDevAndDebug())) {
      console.error.apply(console, args);
    }
  };
  return {
    get log() {
      return log;
    },
    get warn() {
      return warn;
    },
    get error() {
      return error;
    }
  };
});
System.register("origin/hound-origin", [], function() {
  "use strict";
  var __moduleName = "origin/hound-origin";
  var houndOrigin = 'https://dev-api.mediahound.com/';
  ;
  return {get houndOrigin() {
      return houndOrigin;
    }};
});
System.register("request/promise-request", [], function() {
  "use strict";
  var __moduleName = "request/promise-request";
  if (!window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest())) {
    throw new Error("No XMLHttpRequest 2 Object found, please update your browser.");
  }
  var extraEncode = function(str) {
    return encodeURIComponent(str).replace(/\-/g, "%2D").replace(/\_/g, "%5F").replace(/\./g, "%2E").replace(/\!/g, "%21").replace(/\~/g, "%7E").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
  },
      promiseRequest = function(args) {
        var prop,
            rtnPromise,
            method = args.method || 'GET',
            url = args.url || null,
            params = args.params || null,
            data = args.data || null,
            headers = args.headers || null,
            withCreds = args.withCredentials || false,
            onprogress = args.onprogress || args.onProgress || null,
            xhr = new XMLHttpRequest();
        if (url === null) {
          throw new TypeError('url was null or undefined in arguments object', 'promiseRequest.js', 70);
        }
        if (params !== null) {
          url += '?';
          for (prop in params) {
            if (params.hasOwnProperty(prop)) {
              if (url[url.length - 1] !== '?') {
                url += '&';
              }
              if (typeof params[prop] === 'string' || params[prop] instanceof String) {
                url += encodeURIComponent(prop) + '=' + extraEncode(params[prop]).replace('%20', '+');
              } else {
                url += encodeURIComponent(prop) + '=' + extraEncode(JSON.stringify(params[prop])).replace('%20', '+');
              }
            }
          }
          prop = null;
        }
        if (data) {
          if (typeof data === 'string' || data instanceof String || data instanceof Blob || data instanceof ArrayBuffer || data instanceof FormData) {} else {
            data = JSON.stringify(data);
            if (headers == null) {
              headers = {'Content-Type': 'application/json'};
            } else if (!headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          }
        }
        xhr.open(method, url, true);
        xhr.withCredentials = withCreds;
        console.log(method, url, withCreds);
        if (headers !== null) {
          for (prop in headers) {
            if (headers.hasOwnProperty(prop)) {
              xhr.setRequestHeader(prop, headers[prop]);
            }
          }
        }
        rtnPromise = new Promise(function(resolve, reject) {
          xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
              if (this.status >= 200 && this.status < 300) {
                resolve(this);
              } else {
                reject({
                  error: new Error('Request failed with status: ' + this.status + ', ' + this.statusText),
                  'xhr': this
                });
              }
            } else if (this.readyState === 3) {
              if (typeof onprogress === 'function') {
                onprogress(this.responseText);
              }
            } else if (this.readyState === 2) {} else if (this.readyState === 1) {} else if (this.readyState === 0) {}
          };
          xhr.addEventListener('abort', function() {
            console.log('Request to ' + url + ' aborted with status: ' + this.status + ', ' + this.statusText);
          }, false);
          if (data !== null) {
            xhr.send(data);
          } else {
            xhr.send();
          }
        });
        return rtnPromise;
      };
  Object.defineProperty(promiseRequest, 'extraEncode', {
    configurable: false,
    enumerable: false,
    get: function() {
      return extraEncode;
    }
  });
  ;
  var $__default = promiseRequest;
  return {
    get promiseRequest() {
      return promiseRequest;
    },
    get default() {
      return $__default;
    }
  };
});
System.register("request/hound-request", [], function() {
  "use strict";
  var __moduleName = "request/hound-request";
  var houndOrigin = System.get("origin/hound-origin").houndOrigin;
  var log = System.get("models/internal/debug-helpers").log;
  var promiseRequest = System.get("request/promise-request").promiseRequest;
  var extraEncode = promiseRequest.extraEncode,
      requestMap = {},
      defaults = {
        headers: {'Accept': 'application/json'},
        withCredentials: true
      },
      responseThen = function(response) {
        if (!!response) {
          if (response.responseText != null && response.responseText !== '') {
            return JSON.parse(response.responseText);
          }
          if (response.response != null && typeof response.response === 'string' && response.response !== '') {
            return JSON.parse(response.response);
          }
          return response.status;
        }
        return response;
      };
  var houndRequest = function(args) {
    if (!args) {
      throw new TypeError('Arguments not specified for houndRequest', 'houndRequest.js', 27);
    }
    if (typeof args.method === 'string' && (/[a-z]/).test(args.method)) {
      args.method = args.method.toUpperCase();
    }
    if (args.method && args.method === 'POST') {
      defaults.withCredentials = true;
    }
    if (args.endpoint) {
      args.url = houndOrigin + args.endpoint;
      delete args.endpoint;
    }
    if (!args.headers) {
      args.headers = defaults.headers;
    } else {
      var prop;
      for (prop in defaults.headers) {
        if (defaults.headers.hasOwnProperty(prop) && !(prop in args.headers)) {
          args.headers[prop] = defaults.headers[prop];
        }
      }
    }
    if (args.withCredentials == null) {
      args.withCredentials = defaults.withCredentials;
    }
    if (args.method == null || args.method === 'GET') {
      if (requestMap.hasOwnProperty(args.url)) {
        log('request is in map: ', args.url);
        return requestMap[args.url];
      }
      requestMap[args.url] = promiseRequest(args).then((function(res) {
        delete requestMap[args.url];
        return res;
      }), (function(err) {
        delete requestMap[args.url];
        throw err;
      })).then(responseThen);
      return requestMap[args.url];
    }
    log('bypassing requestMap for POST: ', args.url);
    return promiseRequest(args).then(responseThen);
  };
  Object.defineProperty(houndRequest, 'extraEncode', {
    configurable: false,
    enumerable: false,
    get: function() {
      return extraEncode;
    }
  });
  var $__default = houndRequest;
  return {
    get houndRequest() {
      return houndRequest;
    },
    get default() {
      return $__default;
    }
  };
});
System.register("request/hound-paged-request", [], function() {
  "use strict";
  var __moduleName = "request/hound-paged-request";
  var houndRequest = System.get("request/hound-request").houndRequest;
  var defaults = {
    headers: {'Accept': 'application/json'},
    page: 0,
    pageSize: 10,
    startingPage: 0,
    withCredentials: false
  },
      getPageSize = function(args) {
        if (typeof args.pageSize === 'number') {
          return args.pageSize;
        }
        return defaults.pageSize;
      },
      getStartingPage = function(args) {
        if (typeof args.pagingInfo === 'string') {
          return args.pagingInfo;
        }
        if (args.params != null && typeof args.params.page === 'string') {
          return args.params.page;
        }
        return defaults.page;
      },
      setContentArray = function(response) {
        var MHObject = System.get('models/base/MHObject').MHObject;
        var self = this,
            newContent,
            originalContent;
        originalContent = response.content;
        self.pageid = response.content[0].object.metadata.mhid;
        newContent = Promise.all(originalContent.map(function(args) {
          return MHObject.create(args.object);
        }));
        return newContent.then(function(mhObjs) {
          response.content = mhObjs;
          Array.prototype.push.apply(self.content, mhObjs);
          return response;
        });
      };
  var PagedRequest = function PagedRequest(args) {
    if (args.method == null || args.endpoint == null) {
      throw new TypeError('Method or Endpoint was not defined on pagedRequest argument map');
    }
    var pageSize = getPageSize(args),
        startingPage = getStartingPage(args),
        myArgs = args;
    if (pageSize <= 0) {
      pageSize = defaults.pageSize;
    }
    if (startingPage < 0) {
      startingPage = defaults.startingPage;
    }
    myArgs.params = myArgs.params || {};
    myArgs.params.page = startingPage;
    myArgs.params.pageSize = pageSize;
    delete myArgs.pageSize;
    delete myArgs.startingPage;
    this.content = [];
    this.pagePromises = [];
    this.page = startingPage;
    this._args = myArgs;
    this.pagePromises[this.page] = houndRequest(this._args).then(setContentArray.bind(this));
    Object.defineProperties(this, {'pageSize': {
        configurable: false,
        enumerable: true,
        writeable: false,
        value: pageSize
      }});
  };
  ($traceurRuntime.createClass)(PagedRequest, {
    get currentPromise() {
      return this.pagePromises[this.page];
    },
    next: function() {
      var self = this;
      return this.currentPromise.then(function(response) {
        if (!self.lastPage) {
          self.page += 1;
          self._args.params.pageNext = response.pagingInfo.next;
          delete self._args.params.page;
          if (self.pagePromises[self.page] == null) {
            self.pagePromises[self.page] = houndRequest(self._args).then(setContentArray.bind(self));
          }
          return self.pagePromises[self.page];
        }
        return response;
      });
    },
    prev: function() {
      var self = this;
      return this.currentPromise.then(function(response) {
        if (!self.firstPage) {
          self.page -= 1;
          self._args.params.pageNext = self.pagePromises[self.page].pagingInfo.next;
          delete self._args.params.page;
          if (self.pagePromises[self.page] == null) {
            self.pagePromises[self.page] = houndRequest(self._args).then(setContentArray.bind(self));
          }
          return self.pagePromises[self.page];
        }
        return response;
      });
    }
  }, {get extraEncode() {
      return houndRequest.extraEncode;
    }});
  var pagedRequest = function(a) {
    return new PagedRequest(a);
  };
  return {get pagedRequest() {
      return pagedRequest;
    }};
});
System.register("models/internal/MHCache", [], function() {
  "use strict";
  var __moduleName = "models/internal/MHCache";
  var log = System.get("models/internal/debug-helpers").log;
  var keymapSym = Symbol('keymap');
  var MHCache = function MHCache(limit) {
    this.size = 0;
    this.limit = limit;
    this[keymapSym] = {};
  };
  ($traceurRuntime.createClass)(MHCache, {
    put: function(key, value, altId) {
      var entry = {
        key: key,
        value: value,
        altId: altId
      };
      log('putting: ', entry);
      this[keymapSym][key] = entry;
      if (this.tail) {
        this.tail.newer = entry;
        entry.older = this.tail;
      } else {
        this.head = entry;
      }
      this.tail = entry;
      if (this.size === this.limit) {
        return this.shift();
      } else {
        this.size++;
      }
    },
    putMHObj: function(mhObj) {
      if (mhObj && mhObj.mhid && mhObj.username) {
        return this.put(mhObj.mhid, mhObj, mhObj.username);
      }
      if (mhObj && mhObj.mhid) {
        return this.put(mhObj.mhid, mhObj, mhObj.altId);
      }
    },
    shift: function() {
      var entry = this.head;
      if (entry) {
        if (this.head.newer) {
          this.head = this.head.newer;
          this.head.older = undefined;
        } else {
          this.head = undefined;
        }
        entry.newer = entry.older = undefined;
        delete this[keymapSym][entry.key];
      }
      return entry;
    },
    get: function(key) {
      var entry = this[keymapSym][key];
      if (entry === undefined) {
        return;
      }
      if (entry === this.tail) {
        log('getting from cache (is tail): ', entry);
        return entry.value;
      }
      if (entry.newer) {
        if (entry === this.head) {
          this.head = entry.newer;
        }
        entry.newer.older = entry.older;
      }
      if (entry.older) {
        entry.older.newer = entry.newer;
      }
      entry.newer = undefined;
      entry.older = this.tail;
      if (this.tail) {
        this.tail.newer = entry;
      }
      this.tail = entry;
      log('getting from cache: ', entry);
      return entry.value;
    },
    getByAltId: function(altId) {
      var entry = this.tail;
      while (entry) {
        if (entry.altId === altId) {
          log('found altId ' + altId + ', getting from cache');
          return this.get(entry.key);
        }
        entry = entry.older;
      }
    },
    find: function(key) {
      return this[keymapSym][key];
    },
    has: function(key) {
      return this[keymapSym][key] !== undefined;
    },
    hasAltId: function(altId) {
      var entry = this.tail;
      while (entry) {
        if (entry.altId === altId) {
          return true;
        }
        entry = entry.older;
      }
      return false;
    },
    remove: function(key) {
      var entry = this[keymapSym][key];
      if (!entry) {
        return;
      }
      delete this[keymapSym][entry.key];
      if (entry.newer && entry.older) {
        entry.older.newer = entry.newer;
        entry.newer.older = entry.older;
      } else if (entry.newer) {
        entry.newer.older = undefined;
        this.head = entry.newer;
      } else if (entry.older) {
        entry.older.newer = undefined;
        this.tail = entry.older;
      } else {
        this.head = this.tail = undefined;
      }
      this.size--;
      return entry.value;
    },
    removeAll: function() {
      this.head = this.tail = undefined;
      this.size = 0;
      this[keymapSym] = {};
    },
    keys: function() {
      return Object.keys(this[keymapSym]);
    },
    forEach: function(callback) {
      if (typeof callback === 'function') {
        var entry = this.head,
            index = 0;
        while (entry) {
          callback(entry.value, index, this);
          index++;
          entry = entry.newer;
        }
      }
    },
    saveToLocalStorage: function() {
      var storageKey = arguments[0] !== (void 0) ? arguments[0] : 'mhLocalCache';
      var arr = [],
          entry = this.head,
          replacer = function(key, value) {
            if ((/promise|request/gi).test(key)) {
              return;
            }
            return value;
          };
      log('saving to localStorage');
      while (entry) {
        log('adding to arry: ', JSON.stringify(entry.value, replacer));
        arr.push(JSON.stringify(entry.value, replacer));
        entry = entry.newer;
      }
      log('adding to localStorage: ', JSON.stringify(arr));
      localStorage[storageKey] = JSON.stringify(arr);
    },
    restoreFromLocalStorage: function() {
      var storageKey = arguments[0] !== (void 0) ? arguments[0] : 'mhLocalCache';
      var MHObject = System.get('models/base/MHObject').MHObject;
      if (!localStorage || typeof localStorage[storageKey] === 'undefined') {
        log('nothing stored');
        return;
      }
      var i = 0,
          curr,
          stored = JSON.parse(localStorage[storageKey]);
      for (; i < stored.length; i++) {
        curr = MHObject.create(stored[i]);
        if (curr && !this.has(curr.mhid)) {
          log('adding to cache: ', curr);
          this.putMHObj(curr);
        }
      }
    }
  }, {});
  return {get MHCache() {
      return MHCache;
    }};
});
System.register("models/meta/MHMetaData", [], function() {
  "use strict";
  var __moduleName = "models/meta/MHMetaData";
  var MHMetaData = function MHMetaData(args) {
    var mhid = args.mhid || null,
        altid = args.altid || null,
        name = args.name || null,
        description = args.description || null,
        message = args.message || null,
        mixlist = args.mixlist || null,
        username = args.username || null,
        email = args.email || null,
        phoneNumber = args.phoneNumber || null,
        isDefault = args.isDefault || null,
        primaryColor = args.primaryColor || null,
        createdDate = new Date(args.createdDate) * 1000 || null,
        releaseDate = new Date(args.createdDate) * 1000 || null;
    Object.defineProperties(this, {
      'mhid': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mhid
      },
      'altid': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: altid
      },
      'name': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: name
      },
      'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      },
      'message': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: message
      },
      'mixlist': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mixlist
      },
      'username': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: username
      },
      'email': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: email
      },
      'phoneNumber': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: phoneNumber
      },
      'isDefault': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: isDefault
      },
      'primaryColor': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryColor
      },
      'createdDate': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: createdDate
      },
      'releaseDate': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: releaseDate
      }
    });
  };
  ($traceurRuntime.createClass)(MHMetaData, {}, {});
  return {get MHMetaData() {
      return MHMetaData;
    }};
});
System.register("models/social/MHSocial", [], function() {
  "use strict";
  var __moduleName = "models/social/MHSocial";
  var MHSocial = function MHSocial(args) {
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHSocial', 'MHSocial.js', 28);
      }
    }
    for (var $__12 = $MHSocial.members[Symbol.iterator](),
        $__13; !($__13 = $__12.next()).done; ) {
      var prop = $__13.value;
      {
        var curr = typeof args[prop] === 'undefined' ? null : args[prop];
        Object.defineProperty(this, prop, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: curr
        });
      }
    }
  };
  var $MHSocial = MHSocial;
  ($traceurRuntime.createClass)(MHSocial, {
    isEqualToMHSocial: function(otherObj) {
      for (var $__12 = $MHSocial.members[Symbol.iterator](),
          $__13; !($__13 = $__12.next()).done; ) {
        var prop = $__13.value;
        {
          if (typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop]) {
            continue;
          } else if (!this[prop] && !otherObj[prop]) {
            continue;
          }
          return false;
        }
      }
      return true;
    },
    newWithAction: function(action) {
      var newValue,
          toChange,
          alsoFlip,
          newArgs = {};
      switch (action) {
        case $MHSocial.LIKE:
          toChange = 'likers';
          newValue = this.likers + 1;
          alsoFlip = 'userLikes';
          break;
        case $MHSocial.UNLIKE:
          toChange = 'likers';
          newValue = this.likers - 1;
          alsoFlip = 'userLikes';
          break;
        case $MHSocial.DISLIKE:
        case $MHSocial.UNDISLIKE:
          alsoFlip = 'userDislikes';
          break;
        case $MHSocial.FOLLOW:
          toChange = 'followers';
          newValue = this.followers + 1;
          alsoFlip = 'userFollows';
          break;
        case $MHSocial.UNFOLLOW:
          toChange = 'followers';
          newValue = this.followers - 1;
          alsoFlip = 'userFollows';
          break;
        case $MHSocial.COLLECT:
          toChange = 'collectors';
          newValue = this.collectors + 1;
          break;
        default:
          break;
      }
      for (var $__12 = $MHSocial.members[Symbol.iterator](),
          $__13; !($__13 = $__12.next()).done; ) {
        var prop = $__13.value;
        {
          if (prop === toChange) {
            newArgs[prop] = newValue;
          } else if (prop === alsoFlip) {
            newArgs[prop] = !this[prop];
          } else {
            newArgs[prop] = this[prop];
          }
        }
      }
      return new $MHSocial(newArgs);
    }
  }, {
    get LIKE() {
      return 'like';
    },
    get UNLIKE() {
      return 'unlike';
    },
    get DISLIKE() {
      return 'dislike';
    },
    get UNDISLIKE() {
      return 'undislike';
    },
    get FOLLOW() {
      return 'follow';
    },
    get UNFOLLOW() {
      return 'unfollow';
    },
    get SOCIAL_ACTIONS() {
      return [$MHSocial.LIKE, $MHSocial.UNLIKE, $MHSocial.DISLIKE, $MHSocial.UNDISLIKE, $MHSocial.FOLLOW, $MHSocial.UNFOLLOW];
    },
    get POST() {
      return 'post';
    },
    get COLLECT() {
      return 'collect';
    },
    get COMMENT() {
      return 'comment';
    },
    get members() {
      return ['likers', 'followers', 'collectors', 'mentioners', 'following', 'ownedCollections', 'items', 'userLikes', 'userDislikes', 'userFollows'];
    }
  });
  return {get MHSocial() {
      return MHSocial;
    }};
});
System.register("models/base/MHObject", [], function() {
  "use strict";
  var __moduleName = "models/base/MHObject";
  var $__14 = System.get("models/internal/debug-helpers"),
      log = $__14.log,
      warn = $__14.warn,
      error = $__14.error;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request").pagedRequest;
  var MHCache = System.get("models/internal/MHCache").MHCache;
  var MHMetaData = System.get("models/meta/MHMetaData").MHMetaData;
  var MHSocial = System.get("models/social/MHSocial").MHSocial;
  var childrenConstructors = {};
  var mhidLRU = new MHCache(1000);
  if (window.location.host === 'local.mediahound.com:2014') {
    window.mhidLRU = mhidLRU;
  }
  var lastSocialRequestIdSym = Symbol('lastSocialRequestId'),
      socialSym = Symbol('social');
  var MHObject = function MHObject(args) {
    args = $MHObject.parseArgs(args);
    if (typeof args.metadata.mhid === 'undefined' || args.metadata.mhid === null) {
      throw new TypeError('mhid is null or undefined', 'MHObject.js', 89);
    }
    var metadata = new MHMetaData(args.metadata) || null,
        mhid = args.metadata.mhid || null,
        altId = args.metadata.altId || null,
        name = args.metadata.name || null,
        primaryImage = (args.primaryImage != null) ? $MHObject.create(args.primaryImage) : null,
        secondaryImage = (args.secondaryImage != null) ? $MHObject.create(args.secondaryImage) : null,
        social = args.social || null,
        createdDate = new Date(args.metadata.createdDate);
    if (isNaN(createdDate)) {
      createdDate = args.metadata.createdDate || null;
    }
    if (social !== null) {
      social = new MHSocial(args.social);
    }
    Object.defineProperties(this, {
      'mhid': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mhid
      },
      'altId': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: altId
      },
      'name': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: name
      },
      'metadata': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: metadata
      },
      'primaryImage': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryImage
      },
      'secondaryImage': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: secondaryImage
      },
      'social': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: social
      },
      'feedPagedRequest': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }
    });
  };
  var $MHObject = MHObject;
  ($traceurRuntime.createClass)(MHObject, {
    get social() {
      return this[socialSym] || null;
    },
    set social(newSocial) {
      if (newSocial instanceof MHSocial) {
        this[socialSym] = newSocial;
      }
      return this.social;
    },
    get isMedia() {
      return $MHObject.isMedia(this);
    },
    get isContributor() {
      return $MHObject.isContributor(this);
    },
    get isAction() {
      return $MHObject.isAction(this);
    },
    get isUser() {
      return $MHObject.isUser(this);
    },
    get isCollection() {
      return $MHObject.isCollection(this);
    },
    get isImage() {
      return $MHObject.isImage(this);
    },
    get isTrait() {
      return $MHObject.isTrait(this);
    },
    get className() {
      return this.constructor.name;
    },
    isEqualToMHObject: function(otherObj) {
      if (otherObj && otherObj.mhid) {
        return this.metadata.mhid === otherObj.mhid;
      }
      return false;
    },
    hasMhid: function(mhid) {
      if (typeof mhid === 'string' || mhid instanceof String) {
        return this.metadata.mhid === mhid;
      }
      return false;
    },
    toString: function() {
      return this.className + " with mhid " + this.mhid + " and name " + this.name;
    },
    get endpoint() {
      return this.constructor.rootEndpoint + '/' + this.mhid;
    },
    subendpoint: function(sub) {
      if (typeof sub !== 'string' && !(sub instanceof String)) {
        throw new TypeError('Sub not of type string or undefined in (MHObject).subendpoint.');
      }
      return this.endpoint + '/' + sub;
    },
    fetchSocial: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__20 = this;
      var path = this.subendpoint('social');
      if (!force && this.social instanceof MHSocial) {
        return Promise.resolve(this.social);
      }
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then(((function(parsed) {
        return $__20.social = new MHSocial(parsed);
      })).bind(this));
    },
    fetchFeed: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
      var page = arguments[1] !== (void 0) ? arguments[1] : 0;
      var size = arguments[2] !== (void 0) ? arguments[2] : 12;
      var force = arguments[3] !== (void 0) ? arguments[3] : false;
      var path = this.subendpoint('feed');
      if (force || this.feedPagedRequest === null || this.feedPagedRequest.numberOfElements !== size) {
        this.feedPagedRequest = pagedRequest({
          method: 'GET',
          endpoint: path,
          pageSize: size,
          startingPage: page,
          params: {view: view}
        });
      } else if (this.feedPagedRequest.page !== page) {
        this.feedPagedRequest.jumpTo(page);
      }
      return this.feedPagedRequest;
    },
    fetchFeedPage: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
      var page = arguments[1] !== (void 0) ? arguments[1] : 0;
      var size = arguments[2] !== (void 0) ? arguments[2] : 12;
      var force = arguments[3] !== (void 0) ? arguments[3] : false;
      return this.fetchFeed(view, page, size, force).currentPromise;
    },
    takeAction: function(action) {
      var $__20 = this;
      if (typeof action !== 'string' && !(action instanceof String)) {
        throw new TypeError('Action not of type String or undefined');
      }
      if (!MHSocial.SOCIAL_ACTIONS.some((function(a) {
        return action === a;
      }))) {
        throw new TypeError('Action is not of an accepted type in mhObj.takeAction');
      }
      log(("in takeAction, action: " + action + ", obj: " + this.toString()));
      var path = this.subendpoint(action),
          requestId = Math.random(),
          original = this.social,
          self = this;
      if (this.social instanceof MHSocial) {
        this.social = this.social.newWithAction(action);
      }
      this[lastSocialRequestIdSym] = requestId;
      return houndRequest({
        method: 'PUT',
        endpoint: path
      }).then((function(socialRes) {
        var newSocial = new MHSocial(socialRes);
        if ($__20[lastSocialRequestIdSym] === requestId) {
          self.social = newSocial;
        }
        return newSocial;
      })).catch((function(err) {
        if ($__20[lastSocialRequestIdSym] === requestId) {
          self.social = original;
        }
        throw err;
      }));
    }
  }, {
    parseArgs: function(args) {
      var type = typeof args;
      if (type === 'object' && !(args instanceof String) && args.metadata.mhid) {
        return args;
      }
      if (type === 'string' || args instanceof String) {
        try {
          args = JSON.parse(args);
          return args;
        } catch (e) {
          error('JSON.parse failed at MHObject.parseArgs:170. Exception to follow.');
          throw e;
        }
      }
      if (type === 'undefined' || args === null) {
        throw new TypeError('Args is undefined!', 'MHObject.js', 176);
      }
      if (args instanceof Array) {
        throw new TypeError('MHObject arguments cannot be of type Array. Must be JSON String or Object of named parameters.', 'MHObject.js', 180);
      }
      if (args instanceof Error || args.Error || args.error) {
        throw (args.error || args.Error || args);
      }
      throw new TypeError('Args was object without mhid!', 'MHObject.js', 189);
    },
    create: function(args) {
      if (args instanceof Array) {
        log('trying to create MHObject that is new: ' + args);
        return args.map(function(value) {
          try {
            return $MHObject.create(value);
          } catch (e) {
            error(e);
            return value;
          }
        });
      }
      try {
        args = $MHObject.parseArgs(args);
        var mhid = args.metadata.mhid || undefined;
        var mhObj;
        if (mhid !== 'undefined' && mhid !== null) {
          args.mhid = mhid;
          var prefix = $MHObject.getPrefixFromMhid(mhid);
          log(prefix, new childrenConstructors[prefix](args));
          mhObj = new childrenConstructors[prefix](args);
          return mhObj;
        } else {
          mhObj = args;
          return mhObj;
        }
      } catch (err) {
        if (err instanceof TypeError) {
          if (err.message === 'undefined is not a function') {
            warn('Unknown mhid prefix, see args object: ', args);
          }
          if (err.message === 'Args was object without mhid!') {
            warn('Incomplete Object passed to create function: ', args);
          }
        }
        return null;
      }
      return null;
    },
    registerConstructor: function(mhClass) {
      if (mhClass.name === undefined) {
        mhClass.name = mhClass.toString().match(/function (MH[A-Za-z]*)\(args\)/)[1];
        log('shimmed mhClass.name to: ' + mhClass.name);
      }
      var prefix = mhClass.mhidPrefix;
      if (typeof prefix !== 'undefined' && prefix !== null && !(prefix in childrenConstructors)) {
        Object.defineProperty(childrenConstructors, prefix, {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mhClass
        });
        return true;
      }
      return false;
    },
    get prefixes() {
      return Object.keys(childrenConstructors);
    },
    getPrefixFromMhid: function(mhid) {
      for (var pfx in childrenConstructors) {
        if (childrenConstructors.hasOwnProperty(pfx) && (new RegExp('^' + pfx)).test(mhid)) {
          return pfx;
        }
      }
      return null;
    },
    getClassNameFromMhid: function(mhid) {
      var pfx = $MHObject.getPrefixFromMhid(mhid);
      if (childrenConstructors[pfx]) {
        return childrenConstructors[pfx].name;
      }
      return null;
    },
    get mhidPrefix() {
      return null;
    },
    isMedia: function(toCheck) {
      return toCheck instanceof System.get('models/media/MHMedia').MHMedia;
    },
    isContributor: function(toCheck) {
      return toCheck instanceof System.get('models/contributor/MHContributor').MHContributor;
    },
    isAction: function(toCheck) {
      return toCheck instanceof System.get('models/action/MHAction').MHAction;
    },
    isUser: function(toCheck) {
      return toCheck instanceof System.get('models/user/MHUser').MHUser;
    },
    isCollection: function(toCheck) {
      return toCheck instanceof System.get('models/collection/MHCollection').MHCollection;
    },
    isImage: function(toCheck) {
      return toCheck instanceof System.get('models/image/MHImage').MHImage;
    },
    isTrait: function(toCheck) {
      return toCheck instanceof System.get('models/trait/MHTrait').MHTrait;
    },
    fetchByMhid: function(mhid) {
      var view = arguments[1] !== (void 0) ? arguments[1] : 'full';
      var force = arguments[2] !== (void 0) ? arguments[2] : false;
      if (typeof mhid !== 'string' && !(mhid instanceof String)) {
        throw TypeError('MHObject.fetchByMhid argument must be type string.');
      }
      if (view === null || view === undefined) {
        view = 'full';
      }
      if (!force && mhidLRU.has(mhid)) {
        return Promise.resolve(mhidLRU.get(mhid));
      }
      if (!force && mhidLRU.hasAltId(mhid)) {
        return Promise.resolve(mhidLRU.getByAltId(mhid));
      }
      var prefix = $MHObject.getPrefixFromMhid(mhid),
          mhClass = childrenConstructors[prefix],
          newObj;
      if (prefix === null || typeof mhClass === 'undefined') {
        warn('Error in MHObject.fetchByMhid', mhid, prefix, mhClass);
        throw Error('Could not find correct class, unknown mhid: ' + mhid);
      }
      return houndRequest({
        method: 'GET',
        endpoint: mhClass.rootEndpoint + '/' + mhid,
        params: {view: view}
      }).then(function(response) {
        newObj = $MHObject.create(response);
        log('fetched: ', newObj, 'with response: ', response);
        return newObj;
      });
    },
    fetchByMhids: function(mhids) {
      var view = arguments[1] !== (void 0) ? arguments[1] : "basic";
      if (mhids.map) {
        return mhids.map($MHObject.fetchByMhid);
      } else if (mhids.length > 0) {
        var i,
            mhObjs = [];
        for (i = 0; i < mhids.length; i++) {
          mhObjs.push($MHObject.fetchByMhid(mhids[i], view));
        }
        return mhObjs;
      }
      warn('Reached fallback return statement in MHObject.fetchByMhids', mhids);
      return mhids || null;
    },
    get rootEndpoint() {
      return null;
    },
    rootEndpointForMhid: function(mhid) {
      if (typeof mhid !== 'string' && !(mhid instanceof String)) {
        throw new TypeError('Mhid not of type string or undefined in rootEndpointForMhid');
      }
      var prefix = $MHObject.getPrefixFromMhid(mhid),
          mhClass = childrenConstructors[prefix];
      if (prefix === null || typeof mhClass === 'undefined') {
        warn('Error in MHObject.rootEndpointForMhid', mhid, prefix, mhClass);
        throw new Error('Could not find correct class, unknown mhid: ' + mhid);
      }
      return mhClass.rootEndpoint;
    }
  });
  return {
    get mhidLRU() {
      return mhidLRU;
    },
    get MHObject() {
      return MHObject;
    }
  };
});
System.register("models/action/MHAction", [], function() {
  "use strict";
  var __moduleName = "models/action/MHAction";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = function MHAction(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAction.prototype, "constructor", [args]);
    var message = args.metadata.message || null,
        primaryOwner = (args.primaryOwner != null) ? MHObject.create(args.primaryOwner) : null,
        primaryMention = (args.primaryMention != null) ? MHObject.create(args.primaryMention) : null;
    Object.defineProperties(this, {
      "message": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: message
      },
      "primaryOwner": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryOwner
      },
      "primaryMention": {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryMention
      }
    });
  };
  var $MHAction = MHAction;
  ($traceurRuntime.createClass)(MHAction, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAction.prototype, "toString", []);
    }}, {get rootEndpoint() {
      return 'graph/action';
    }}, MHObject);
  return {get MHAction() {
      return MHAction;
    }};
});
System.register("models/action/MHAdd", [], function() {
  "use strict";
  var __moduleName = "models/action/MHAdd";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var MHAdd = function MHAdd(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAdd.prototype, "constructor", [args]);
  };
  var $MHAdd = MHAdd;
  ($traceurRuntime.createClass)(MHAdd, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAdd.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhadd';
    }}, MHAction);
  (function() {
    MHObject.registerConstructor(MHAdd);
  })();
  return {get MHAdd() {
      return MHAdd;
    }};
});
System.register("models/action/MHComment", [], function() {
  "use strict";
  var __moduleName = "models/action/MHComment";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHComment = function MHComment(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHComment.prototype, "constructor", [args]);
    Object.defineProperties(this, {'parentPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }});
  };
  var $MHComment = MHComment;
  ($traceurRuntime.createClass)(MHComment, {
    toString: function() {
      return $traceurRuntime.superCall(this, $MHComment.prototype, "toString", []);
    },
    fetchParentAction: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__30 = this;
      var path = this.subendpoint('parent');
      if (force || this.parentPromise === null) {
        this.parentPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch(((function(err) {
          $__30.parentPromise = null;
          throw err;
        })).bind(this));
      }
      return this.parentPromise;
    }
  }, {get mhidPrefix() {
      return 'mhcmt';
    }}, MHAction);
  (function() {
    MHObject.registerConstructor(MHComment);
  })();
  return {get MHComment() {
      return MHComment;
    }};
});
System.register("models/action/MHCreate", [], function() {
  "use strict";
  var __moduleName = "models/action/MHCreate";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var MHCreate = function MHCreate(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHCreate.prototype, "constructor", [args]);
  };
  var $MHCreate = MHCreate;
  ($traceurRuntime.createClass)(MHCreate, {toString: function() {
      return $traceurRuntime.superCall(this, $MHCreate.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhcrt';
    }}, MHAction);
  (function() {
    MHObject.registerConstructor(MHCreate);
  })();
  return {get MHCreate() {
      return MHCreate;
    }};
});
System.register("models/action/MHFollow", [], function() {
  "use strict";
  var __moduleName = "models/action/MHFollow";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var MHFollow = function MHFollow(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHFollow.prototype, "constructor", [args]);
  };
  var $MHFollow = MHFollow;
  ($traceurRuntime.createClass)(MHFollow, {toString: function() {
      return $traceurRuntime.superCall(this, $MHFollow.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhflw';
    }}, MHAction);
  (function() {
    MHObject.registerConstructor(MHFollow);
  })();
  return {get MHFollow() {
      return MHFollow;
    }};
});
System.register("models/action/MHLike", [], function() {
  "use strict";
  var __moduleName = "models/action/MHLike";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var MHLike = function MHLike(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHLike.prototype, "constructor", [args]);
  };
  var $MHLike = MHLike;
  ($traceurRuntime.createClass)(MHLike, {toString: function() {
      return $traceurRuntime.superCall(this, $MHLike.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhlke';
    }}, MHAction);
  (function() {
    MHObject.registerConstructor(MHLike);
  })();
  return {get MHLike() {
      return MHLike;
    }};
});
System.register("models/action/MHPost", [], function() {
  "use strict";
  var __moduleName = "models/action/MHPost";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHPost = function MHPost(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHPost.prototype, "constructor", [args]);
  };
  var $MHPost = MHPost;
  ($traceurRuntime.createClass)(MHPost, {toString: function() {
      return $traceurRuntime.superCall(this, $MHPost.prototype, "toString", []);
    }}, {
    get mhidPrefix() {
      return 'mhpst';
    },
    createWithMessage: function(message, mentions, primaryMention) {
      if (!message || !mentions || !primaryMention || typeof message !== 'string' || !Array.isArray(mentions) || !mentions.every((function(x) {
        return x instanceof MHObject;
      })) || !(primaryMention instanceof MHObject)) {
        throw new TypeError("Can't create post without message string, mentions array, and primary mention object.");
      }
      var path = $MHPost.rootEndpoint + '/new',
          mentionedMhids = mentions.map((function(m) {
            return m.mhid;
          }));
      return houndRequest({
        method: 'POST',
        endpoint: path,
        data: {
          'message': message,
          'mentions': mentionedMhids,
          'primaryMention': primaryMention.mhid
        }
      }).then((function(res) {
        mentions.forEach((function(m) {
          return m.fetchSocial(true);
        }));
        return res;
      }));
    }
  }, MHAction);
  (function() {
    MHObject.registerConstructor(MHPost);
  })();
  return {get MHPost() {
      return MHPost;
    }};
});
System.register("models/base/MHEmbeddedObject", [], function() {
  "use strict";
  var __moduleName = "models/base/MHEmbeddedObject";
  var MHEmbeddedObject = function MHEmbeddedObject(args) {
    if (args == null) {
      throw new TypeError('Args is null or undefined in MHEmbeddedObject constructor.');
    }
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHEmbeddedObject', 'MHEmbeddedObject.js', 24);
      }
    }
    if (args.mhid == null) {
      throw new TypeError('mhid is null or undefined in MHEmbeddedObject constructor', 'MHEmbeddedObject.js', 29);
    }
    var mhid = args.mhid,
        name = (args.name != null) ? args.name : null;
    Object.defineProperties(this, {
      'mhid': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mhid
      },
      'name': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: name
      }
    });
  };
  var $MHEmbeddedObject = MHEmbeddedObject;
  ($traceurRuntime.createClass)(MHEmbeddedObject, {}, {createFromArray: function(arr) {
      if (Array.isArray(arr)) {
        return arr.map((function(v) {
          try {
            return new $MHEmbeddedObject(v);
          } catch (e) {
            return v;
          }
        }));
      } else if (arr && arr.length > 0) {
        var i = 0,
            len = arr.length,
            newArry = [];
        for (; i < len; i++) {
          newArry.push(new $MHEmbeddedObject(arr[i]));
        }
        return newArry;
      }
      return arr;
    }});
  return {get MHEmbeddedObject() {
      return MHEmbeddedObject;
    }};
});
System.register("models/base/MHEmbeddedRelation", [], function() {
  "use strict";
  var __moduleName = "models/base/MHEmbeddedRelation";
  var MHEmbeddedObject = System.get("models/base/MHEmbeddedObject").MHEmbeddedObject;
  var MHEmbeddedRelation = function MHEmbeddedRelation(args) {
    if (args == null) {
      throw new TypeError('Args is null or undefined in MHEmbeddedRelation constructor.');
    }
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHEmbeddedRelation', 'MHEmbeddedRelation.js', 24);
      }
    }
    $traceurRuntime.superCall(this, $MHEmbeddedRelation.prototype, "constructor", [args]);
    var position = args.position || null;
    Object.defineProperties(this, {'position': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: position
      }});
  };
  var $MHEmbeddedRelation = MHEmbeddedRelation;
  ($traceurRuntime.createClass)(MHEmbeddedRelation, {}, {createFromArray: function(arr) {
      if (Array.isArray(arr)) {
        return arr.map((function(v) {
          return new $MHEmbeddedRelation(v);
        }));
      } else if (arr && arr.length > 0) {
        var i = 0,
            len = arr.length,
            newArry = [];
        for (; i < len; i++) {
          newArry.push(new $MHEmbeddedRelation(arr[i]));
        }
        return newArry;
      }
      return arr;
    }}, MHEmbeddedObject);
  return {get MHEmbeddedRelation() {
      return MHEmbeddedRelation;
    }};
});
System.register("models/base/MHRelationalPair", [], function() {
  "use strict";
  var __moduleName = "models/base/MHRelationalPair";
  var $__48 = System.get("models/base/MHObject"),
      MHObject = $__48.MHObject,
      mhidLRU = $__48.mhidLRU;
  var MHRelationalPair = function MHRelationalPair(args) {
    if (args == null) {
      throw new TypeError('Args is null or undefined in MHRelationalPair constructor.');
    }
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not valid JSON in MHRelationalPair', 'MHRelationalPair.js', 15);
      }
    }
    var position = args.context.sorting.position || null,
        context = args.context || null,
        object = mhidLRU.has(args.object.mhid) ? mhidLRU.get(args.object.mhid) : MHObject.create(args.object) || null;
    if (position == null || object == null) {
      throw new TypeError('Either position or object was not defined in MHRelationalPair', 'MHRelationalPair.js', 23);
    }
    Object.defineProperties(this, {
      'position': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: position
      },
      'context': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: context
      },
      'object': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: object
      }
    });
  };
  var $MHRelationalPair = MHRelationalPair;
  ($traceurRuntime.createClass)(MHRelationalPair, {toString: function() {
      return this.object.name + ' at position ' + this.position;
    }}, {createFromArray: function(arr) {
      if (Array.isArray(arr)) {
        return arr.map((function(v) {
          try {
            return new $MHRelationalPair(v);
          } catch (e) {
            return v;
          }
        }));
      } else if (arr && arr.length > 0) {
        var i = 0,
            len = arr.length,
            newArry = [];
        for (; i < len; i++) {
          newArry.push(new $MHRelationalPair(arr[i]));
        }
        return newArry;
      }
      return arr;
    }});
  return {get MHRelationalPair() {
      return MHRelationalPair;
    }};
});
System.register("models/user/MHUser", [], function() {
  "use strict";
  var __moduleName = "models/user/MHUser";
  var log = System.get("models/internal/debug-helpers").log;
  var $__51 = System.get("models/base/MHObject"),
      MHObject = $__51.MHObject,
      mhidLRU = $__51.mhidLRU;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request").pagedRequest;
  var MHUser = function MHUser(args) {
    args = MHObject.parseArgs(args);
    if (typeof args.metadata.username === 'undefined' || args.metadata.username === null) {
      throw new TypeError('Username is null or undefined', 'MHUser.js', 39);
    }
    $traceurRuntime.superCall(this, $MHUser.prototype, "constructor", [args]);
    var username = args.metadata.username,
        email = args.metadata.email || null,
        phonenumber = args.metadata.phonenumber || args.metadata.phoneNumber || null,
        firstname = args.metadata.firstname || args.metadata.firstName || null,
        lastname = args.metadata.lastname || args.metadata.lastName || null;
    Object.defineProperties(this, {
      'username': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: username
      },
      'email': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: email
      },
      'phonenumber': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: phonenumber
      },
      'firstName': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: firstname
      },
      'lastName': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: lastname
      },
      'interestFeedPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'ownedCollectionsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'followedPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'followedCollectionsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }
    });
  };
  var $MHUser = MHUser;
  ($traceurRuntime.createClass)(MHUser, {
    get isCurrentUser() {
      var currentUser = System.get('models/user/MHLoginSession').MHLoginSession.currentUser;
      return this.isEqualToMHObject(currentUser);
    },
    setPassword: function(password, newPassword) {
      if (!password || (typeof password !== 'string' && !(password instanceof String))) {
        throw new TypeError('password must be type string in MHUser.newPassword');
      }
      if (!newPassword || (typeof newPassword !== 'string' && !(newPassword instanceof String))) {
        throw new TypeError('newPassword must be type string in MHUser.newPassword');
      }
      var path = $MHUser.rootEndpoint + '/forgotpassword/finish',
          data = {};
      data.oldPassword = password;
      data.newPassword = newPassword;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: true,
        data: data
      }).then(function(response) {
        console.log('valid resetPassword: ', response);
        return response;
      }).catch(function(error) {
        if (error.xhr.status === 400) {
          console.error('The password ' + password + ' is an invalid password.');
        } else if (error.xhr.status === 404) {
          console.error('The newPassword ' + newPassword + ' was not found.');
        } else {
          console.log('error in setPassword: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    setProfileImage: function(image) {
      log('in setProfileImage with image: ', image);
      if (!image) {
        throw new TypeError('No Image passed to setProfileImage');
      }
      if (!(image instanceof Blob || image instanceof File)) {
        throw new TypeError('Image was not of type Blob or File.');
      }
      if (!this.isCurrentUser) {
        throw (function() {
          var NoMHSessionError = function(message) {
            this.name = 'NoMHSessionError';
            this.message = message || '';
          };
          NoMHSessionError.prototype = Object.create(Error.prototype);
          NoMHSessionError.constructor = NoMHSessionError;
          return new NoMHSessionError('No valid user session. Please log in to change profile picture');
        })();
      }
      var path = $MHUser.rootEndpoint + '/uploadImage',
          form = new FormData();
      form.append('data', image);
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: true,
        data: form
      }).then(function(userWithImage) {
        var MHLoginSession = System.get('models/user/MHLoginSession').MHLoginSession;
        MHLoginSession.updatedProfileImage(MHObject.create(userWithImage));
        return userWithImage;
      });
    },
    updateProfile: function(key, value) {
      var data = {};
      data[key] = value;
      return this.updateProfileData(data);
    },
    updateProfileData: function(updates) {
      if (updates == null || typeof updates === 'string' || Array.isArray(updates)) {
        throw new TypeError('Update profile data parameter must be of type object');
      }
      var path = $MHUser.rootEndpoint + '/update';
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: true,
        data: updates
      }).catch(function(err) {
        console.log('error on profile update: ', err);
        throw err;
      });
    },
    fetchInterestFeed: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
      var page = arguments[1] !== (void 0) ? arguments[1] : 0;
      var size = arguments[2] !== (void 0) ? arguments[2] : 12;
      var force = arguments[3] !== (void 0) ? arguments[3] : false;
      var path = this.subendpoint('interestFeed');
      if (force || this.interestFeedPromise === null) {
        this.interestFeedPromise = pagedRequest({
          method: 'GET',
          endpoint: path,
          withCredentials: true,
          startingPage: page,
          pageSize: size,
          params: {'view': view}
        });
      }
      return this.interestFeedPromise;
    },
    fetchOwnedCollections: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
      var page = arguments[1] !== (void 0) ? arguments[1] : 0;
      var size = arguments[2] !== (void 0) ? arguments[2] : 12;
      var force = arguments[3] !== (void 0) ? arguments[3] : false;
      var path = this.subendpoint('ownedCollections');
      if (force || this.feedPagedRequest === null || this.feedPagedRequest.numberOfElements !== size) {
        this.ownedCollectionsPromise = pagedRequest({
          method: 'GET',
          endpoint: path,
          pageSize: size,
          params: {view: view}
        });
      }
      return this.ownedCollectionsPromise.content;
    },
    fetchFollowed: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__54 = this;
      var path = this.subendpoint('following');
      if (force || this.followedPromise === null) {
        this.followedPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          withCredentials: true
        }).catch(((function(err) {
          $__54.followedPromise = null;
          throw err;
        })).bind(this));
      }
      return this.followedPromise;
    },
    fetchFollowedCollections: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__54 = this;
      var path = this.subendpoint('following');
      if (force || this.followedCollectionsPromise === null) {
        this.followedCollectionsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          withCredentials: true,
          params: {type: 'collection'}
        }).catch(((function(err) {
          $__54.followedCollectionsPromise = null;
          throw err;
        })).bind(this));
      }
      return this.followedCollectionsPromise;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHUser.prototype, "toString", []) + ' and username ' + this.username;
    }
  }, {
    get mhidPrefix() {
      return 'mhusr';
    },
    get rootEndpoint() {
      return 'graph/user';
    },
    registerNewUser: function(username, password, email, firstName, lastName, optional) {
      var path = $MHUser.rootEndpoint + '/new',
          data = (optional && typeof optional === 'object' && !(optional instanceof Array || optional instanceof String)) ? optional : {},
          notString = function(obj) {
            return (typeof obj !== 'string' && !(obj instanceof String));
          };
      if (notString(username)) {
        throw new TypeError('Username not of type string in MHUser.registerNewUser');
      }
      if (notString(password)) {
        throw new TypeError('Password not of type string in MHUser.registerNewUser');
      }
      if (notString(email)) {
        throw new TypeError('Email not of type string in MHUser.registerNewUser');
      }
      if (notString(firstName)) {
        throw new TypeError('First name not of type string in MHUser.registerNewUser');
      }
      if (notString(lastName)) {
        throw new TypeError('Last name not of type string in MHUser.registerNewUser');
      }
      data.username = username;
      data.password = password;
      data.email = email;
      data.firstName = firstName;
      data.lastName = lastName;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        'data': data,
        withCredentials: true,
        headers: {}
      }).then(function(parsed) {
        return MHObject.fetchByMhid(parsed.metadata.mhid);
      });
    },
    fetchSettings: function(mhid) {
      if (!mhid || (typeof mhid !== 'string' && !(mhid instanceof String))) {
        throw new TypeError('mhid must be type string in MHUser.fetchSettings');
      }
      var path = $MHUser.rootEndpoint + '/' + mhid + '/settings/internal';
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then(function(response) {
        log('valid settings response: ', response);
        return response.internalSettings;
      }).catch(function(error) {
        console.log('error in fetchSettings: ', error.error.message);
        console.error(error.error.stack);
        return false;
      });
    },
    validateUsername: function(username) {
      if (!username || (typeof username !== 'string' && !(username instanceof String))) {
        throw new TypeError('Username must be type string in MHUser.validateUsername');
      }
      var path = $MHUser.rootEndpoint + '/validate/' + encodeURIComponent(username);
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then(function(response) {
        return response === 200;
      }).catch(function(error) {
        if (error.xhr.status === 406) {
          console.error('The username ' + username + ' is already taken.');
        } else {
          console.log('error in validate username: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    validateEmail: function(email) {
      if (!email || (typeof email !== 'string' && !(email instanceof String))) {
        throw new TypeError('Email must be type string in MHUser.validateEmail');
      }
      var path = $MHUser.rootEndpoint + '/validate/email/' + encodeURIComponent(email);
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then(function(response) {
        return response === 200;
      }).catch(function(error) {
        if (error.xhr.status === 406) {
          console.error('The email ' + email + ' is already registered.');
        } else {
          console.log('error in validate username: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    forgotUsernameWithEmail: function(email) {
      if (!email || (typeof email !== 'string' && !(email instanceof String))) {
        throw new TypeError('Email must be type string in MHUser.forgotUsernameWithEmail');
      }
      var path = $MHUser.rootEndpoint + '/forgotusername',
          data = {};
      data.email = email;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: false,
        data: data
      }).then(function(response) {
        console.log('valid forgotUsernameWithEmail: ', response);
        return response;
      }).catch(function(error) {
        if (error.xhr.status === 400) {
          console.error('The email ' + email + ' is missing or an invalid argument.');
        } else if (error.xhr.status === 404) {
          console.error('The user with the email address ' + email + ' was not found.');
        } else {
          console.log('error in new forgotUsernameWithEmail: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    forgotPasswordWithEmail: function(email) {
      if (!email || (typeof email !== 'string' && !(email instanceof String))) {
        throw new TypeError('Email must be type string in MHUser.forgotPasswordWithEmail');
      }
      var path = $MHUser.rootEndpoint + '/forgotpassword',
          data = {};
      data.email = email;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: false,
        data: data
      }).then(function(response) {
        console.log('valid forgotPasswordWithEmail: ', response);
        return response;
      }).catch(function(error) {
        if (error.xhr.status === 400) {
          console.error('The email ' + email + ' is missing or an invalid argument.');
        } else if (error.xhr.status === 404) {
          console.error('The user with the email address ' + email + ' was not found.');
        } else {
          console.log('error in new forgotPasswordWithEmail: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    forgotPasswordWithUsername: function(username) {
      if (!username || (typeof username !== 'string' && !(username instanceof String))) {
        throw new TypeError('username must be type string in MHUser.forgotPasswordWithUsername');
      }
      var path = $MHUser.rootEndpoint + '/forgotpassword',
          data = {};
      data.username = username;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: false,
        data: data
      }).then(function(response) {
        console.log('valid forgotPasswordWithUsername: ', response);
        return response;
      }).catch(function(error) {
        if (error.xhr.status === 400) {
          console.error('The username ' + username + ' is missing or an invalid argument.');
        } else if (error.xhr.status === 404) {
          console.error('The user ' + username + ' was not found.');
        } else {
          console.log('error in forgotPasswordWithUsername: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    newPassword: function(password, ticket) {
      if (!password || (typeof password !== 'string' && !(password instanceof String))) {
        throw new TypeError('password must be type string in MHUser.newPassword');
      }
      if (!ticket || (typeof ticket !== 'string' && !(ticket instanceof String))) {
        throw new TypeError('ticket must be type string in MHUser.newPassword');
      }
      var path = $MHUser.rootEndpoint + '/forgotpassword/finish',
          data = {};
      data.newPassword = password;
      data.ticket = ticket;
      return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials: false,
        data: data
      }).then(function(response) {
        console.log('valid newPassword: ', response);
        return response;
      }).catch(function(error) {
        if (error.xhr.status === 400) {
          console.error('The password ' + password + ' is an invalid password.');
        } else if (error.xhr.status === 404) {
          console.error('The ticket ' + ticket + ' was not found.');
        } else {
          console.log('error in newPassword: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
    },
    fetchByUsername: function(username) {
      var view = arguments[1] !== (void 0) ? arguments[1] : 'full';
      var force = arguments[2] !== (void 0) ? arguments[2] : false;
      if (!username || (typeof username !== 'string' && !(username instanceof String))) {
        throw new TypeError('Username not of type String in fetchByUsername');
      }
      if (MHObject.getPrefixFromMhid(username) != null) {
        throw new TypeError('Passed mhid to fetchByUsername, please use MHObject.fetchByMhid for this request.');
      }
      if (view === null || view === undefined) {
        view = 'full';
      }
      log('in fetchByUsername, looking for: ' + username);
      if (!force && mhidLRU.hasAltId(username)) {
        return Promise.resolve(mhidLRU.getByAltId(username));
      }
      var path = $MHUser.rootEndpoint + '/lookup/' + username,
          newObj;
      return houndRequest({
        method: 'GET',
        endpoint: path,
        withCredentials: true,
        params: {view: view}
      }).then(function(response) {
        newObj = MHObject.create(response);
        mhidLRU.putMHObj(newObj);
        return newObj;
      });
    },
    fetchFeaturedUsers: function() {
      var path = $MHUser.rootEndpoint + '/featured';
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then(function(response) {
        return Promise.all(MHObject.fetchByMhids(response));
      });
    },
    linkTwitterAccount: function(s, f) {
      var success = s || 'https://www.mediahound.com/',
          failure = f || 'https://www.mediahound.com/';
      return houndRequest({
        method: 'GET',
        endpoint: $MHUser.rootEndpoint + '/account/twitter/link?successRedirectUrl=' + success + '&failureRedirectUrl=' + failure,
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        return response;
      });
    },
    unlinkTwitterAccount: function() {
      return houndRequest({
        method: 'GET',
        endpoint: $MHUser.rootEndpoint + '/account/twitter/unlink',
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        return response;
      });
    }
  }, MHObject);
  (function() {
    MHObject.registerConstructor(MHUser);
  })();
  return {get MHUser() {
      return MHUser;
    }};
});
System.register("models/user/MHLoginSession", [], function() {
  "use strict";
  var __moduleName = "models/user/MHLoginSession";
  var $__56 = System.get("models/internal/debug-helpers"),
      log = $__56.log,
      warn = $__56.warn,
      error = $__56.error;
  var $__57 = System.get("models/base/MHObject"),
      MHObject = $__57.MHObject,
      mhidLRU = $__57.mhidLRU;
  var MHUser = System.get("models/user/MHUser").MHUser;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var makeEvent = function(name, options) {
    var evt;
    options.bubbles = options.bubbles || false;
    options.cancelable = options.cancelable || false;
    options.detail = options.detail || (void 0);
    try {
      evt = new CustomEvent(name, options);
    } catch (err) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(name, options.bubbles, options.cancelable, options.detail);
    }
    return evt;
  };
  var MHUserLoginEvent = function MHUserLoginEvent() {};
  ($traceurRuntime.createClass)(MHUserLoginEvent, {}, {create: function(mhUserObj) {
      return makeEvent('mhUserLogin', {
        bubbles: false,
        cancelable: false,
        detail: {mhUser: mhUserObj}
      });
    }});
  var MHUserLogoutEvent = function MHUserLogoutEvent() {};
  ($traceurRuntime.createClass)(MHUserLogoutEvent, {}, {create: function(mhUserObj) {
      return makeEvent('mhUserLogout', {
        bubbles: false,
        cancelable: false,
        detail: {mhUser: mhUserObj}
      });
    }});
  var MHSessionUserProfileImageChange = function MHSessionUserProfileImageChange() {};
  ($traceurRuntime.createClass)(MHSessionUserProfileImageChange, {}, {create: function(mhUserObj) {
      return makeEvent('mhSessionUserProfileImageChange', {
        bubbles: false,
        cancelable: false,
        detail: {mhUser: mhUserObj}
      });
    }});
  var loggedInUser = null,
      onboarded = false,
      access = false,
      count = null;
  var restoreFromSessionStorage = function() {
    var inStorage = window.sessionStorage.currentUser;
    if (inStorage) {
      return true;
    }
    return false;
  };
  var MHLoginSession = function MHLoginSession() {};
  ($traceurRuntime.createClass)(MHLoginSession, {}, {
    get currentUser() {
      return loggedInUser;
    },
    get openSession() {
      return loggedInUser instanceof MHUser;
    },
    get onboarded() {
      return onboarded;
    },
    get access() {
      return access;
    },
    get count() {
      return count;
    },
    updateCount: function() {
      return houndRequest({
        method: 'GET',
        endpoint: MHUser.rootEndpoint + '/count'
      }).then((function(res) {
        count = res.count;
        return res;
      })).catch((function(err) {
        warn('Error fetching user count');
        error(err.error.stack);
        return count;
      }));
    },
    updatedProfileImage: function(updatedUser) {
      log('updatedUploadImage: ', updatedUser);
      if (!(updatedUser instanceof MHUser) || !updatedUser.hasMhid(loggedInUser.mhid)) {
        throw new TypeError("Updated Profile Image must be passed a new MHUser Object that equals the currently logged in user");
      }
      loggedInUser = updatedUser;
      loggedInUser.fetchSocial();
      loggedInUser.fetchOwnedCollections();
      window.dispatchEvent(MHSessionUserProfileImageChange.create(loggedInUser));
      return true;
    },
    completedOnboarding: function() {
      var path = MHUser.rootEndpoint + '/onboard';
      return houndRequest({
        method: 'POST',
        endpoint: path,
        'withCredentials': true
      }).then((function(loginMap) {
        access = loginMap.access;
        onboarded = loginMap.onboarded;
        console.log(loginMap);
        return loginMap;
      }));
    },
    login: function(username, password) {
      if (typeof username !== 'string' && !(username instanceof String)) {
        throw new TypeError('Username not of type string in MHUser.login');
      }
      if (typeof password !== 'string' && !(password instanceof String)) {
        throw new TypeError('Password not of type string in MHUser.login');
      }
      var path = MHUser.rootEndpoint + '/login',
          data = {
            'username': username,
            'password': password
          };
      return houndRequest({
        method: 'POST',
        endpoint: path,
        'data': data,
        withCredentials: true,
        headers: {}
      }).then((function(loginMap) {
        return MHObject.fetchByMhid(loginMap.mhid);
      })).then((function(mhUserLoggedIn) {
        return MHUser.fetchSettings(mhUserLoggedIn.mhid).then(function(settings) {
          mhUserLoggedIn.settings = settings;
          return mhUserLoggedIn;
        });
      })).then((function(user) {
        access = user.access = user.settings.access;
        onboarded = user.onboarded = user.settings.onboarded;
        loggedInUser = user;
        window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));
        sessionStorage.currentUser = JSON.stringify(loggedInUser);
        log('logging in:', loggedInUser);
        return loggedInUser;
      })).catch(function(error) {
        throw new Error('Problem during login: ' + error.error.message, 'MHLoginSession.js');
      });
    },
    logout: function() {
      var currentCookies = document.cookie.split('; ').map((function(c) {
        var keyVal = c.split('=');
        return {
          'key': keyVal[0],
          'value': keyVal[1]
        };
      }));
      window.sessionStorage.currentUser = null;
      currentCookies.forEach((function(cookie) {
        if (cookie.key === 'JSESSIONID') {
          var expires = (new Date(0)).toGMTString();
          document.cookie = (cookie.key + "=" + cookie.value + "; expires=" + expires + "; domain=.mediahound.com");
        }
      }));
      window.dispatchEvent(MHUserLogoutEvent.create(loggedInUser));
      mhidLRU.removeAll();
      return Promise.resolve(loggedInUser).then(function(mhUser) {
        loggedInUser = null;
        access = false;
        onboarded = false;
        return mhUser;
      });
    },
    validateOpenSession: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : "full";
      var path = MHUser.rootEndpoint + '/validateSession';
      return houndRequest({
        method: 'GET',
        endpoint: path,
        params: {view: view},
        withCredentials: true,
        headers: {}
      }).then((function(loginMap) {
        if (restoreFromSessionStorage()) {
          var cachedUser = JSON.parse(window.sessionStorage["currentUser"]);
          if (cachedUser.mhid === loginMap.users[0].metadata.mhid || cachedUser.mhid === loginMap.users[0].mhid) {
            access = cachedUser.settings.access;
            onboarded = cachedUser.settings.onboarded;
            return MHObject.create(loginMap.users[0]);
          }
        } else {
          return MHObject.create(loginMap.users[0]);
        }
      })).then(function(loggedInUser) {
        window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));
        return loggedInUser;
      }).catch(function(error) {
        if (error.xhr.status === 401) {
          console.log('No open MediaHound session');
        }
        return error;
      });
    }
  });
  MHLoginSession.updateCount();
  return {get MHLoginSession() {
      return MHLoginSession;
    }};
});
System.register("models/collection/MHCollection", [], function() {
  "use strict";
  var __moduleName = "models/collection/MHCollection";
  var log = System.get("models/internal/debug-helpers").log;
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHLoginSession = System.get("models/user/MHLoginSession").MHLoginSession;
  var MHRelationalPair = System.get("models/base/MHRelationalPair").MHRelationalPair;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHCollection = function MHCollection(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHCollection.prototype, "constructor", [args]);
    var mixlist = (typeof args.mixlist === 'string') ? args.mixlist.toLowerCase() : null,
        firstContentImage = (args.firstContentImage != null) ? MHObject.create(args.firstContentImage) : null,
        primaryOwner = (args.primaryOwner != null) ? MHObject.create(args.primaryOwner) : null,
        description = args.metadata.description || null;
    switch (mixlist) {
      case 'none':
        mixlist = $MHCollection.MIXLIST_TYPE_NONE;
        break;
      case 'partial':
        mixlist = $MHCollection.MIXLIST_TYPE_PARTIAL;
        break;
      case 'full':
        mixlist = $MHCollection.MIXLIST_TYPE_FULL;
        break;
      default:
        mixlist = $MHCollection.MIXLIST_TYPE_NONE;
        break;
    }
    Object.defineProperties(this, {
      'mixlist': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mixlist
      },
      'firstContentImage': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: firstContentImage
      },
      'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      },
      'primaryOwner': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryOwner
      },
      'ownersPromise': {
        configurable: false,
        enumerable: true,
        writable: true,
        value: null
      },
      'contentPromise': {
        configurable: false,
        enumerable: true,
        writable: true,
        value: null
      },
      'mixlistPromise': {
        configurable: false,
        enumerable: true,
        writable: true,
        value: null
      }
    });
  };
  var $MHCollection = MHCollection;
  ($traceurRuntime.createClass)(MHCollection, {
    get mixlistTypeString() {
      switch (this.mixlist) {
        case $MHCollection.MIXLIST_TYPE_NONE:
          return 'none';
        case $MHCollection.MIXLIST_TYPE_PARTIAL:
          return 'partial';
        case $MHCollection.MIXLIST_TYPE_FULL:
          return 'full';
        default:
          return 'none';
      }
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHCollection.prototype, "toString", []) + ' and description ' + this.description;
    },
    addContent: function(content) {
      return this.addContents([content]);
    },
    addContents: function(contents) {
      return this.changeContents(contents, 'add');
    },
    removeContent: function(content) {
      return this.removeContents([content]);
    },
    removeContents: function(contents) {
      return this.changeContents(contents, 'remove');
    },
    changeContents: function(contents, sub) {
      var $__66 = this;
      if (!Array.isArray(contents)) {
        throw new TypeError('Contents must be an array in changeContents');
      }
      if (typeof sub !== 'string' || (sub !== 'add' && sub !== 'remove')) {
        throw new TypeError('Subendpoint must be add or remove');
      }
      var path = this.subendpoint(sub),
          mhids = contents.map((function(v) {
            if (v instanceof MHObject) {
              return v.mhid;
            } else if (typeof v === 'string' && MHObject.prefixes.indexOf(MHObject.getPrefixFromMhid(v)) > -1) {
              return v;
            }
            return null;
          })).filter((function(v) {
            return v !== null;
          }));
      this.mixlistPromise = null;
      log('content array to be submitted: ', mhids);
      return (this.contentPromise = houndRequest({
        method: 'PUT',
        endpoint: path,
        data: {'content': mhids}
      }).catch(((function(err) {
        $__66.contentPromise = null;
        throw err;
      })).bind(this)).then(function(response) {
        contents.forEach((function(v) {
          return typeof v.fetchSocial === 'function' && v.fetchSocial(true);
        }));
        return response;
      }));
    },
    fetchOwners: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__66 = this;
      var path = this.subendpoint('owners');
      if (force || this.ownersPromise === null) {
        this.ownersPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch(((function(err) {
          $__66.ownersPromise = null;
          throw err;
        })).bind(this));
      }
      return this.ownersPromise;
    },
    fetchContent: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var path = this.subendpoint('content'),
          self = this;
      if (force || this.contentPromise === null) {
        this.contentPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {view: view}
        }).catch((function(err) {
          self.contentPromise = null;
          throw err;
        })).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHRelationalPair.createFromArray(parsed).sort((function(a, b) {
              return a.position - b.position;
            }));
          }
          return parsed;
        });
      }
      return this.contentPromise.then((function(res) {
        if (view === 'full' && Array.isArray(res) && typeof res[0] === 'string') {
          return self.fetchContent(view, true);
        }
        if (view === 'ids' && Array.isArray(res) && res[0].object instanceof MHObject) {
          return res.map((function(pair) {
            return pair.object.mhid;
          }));
        }
        return res;
      }));
    },
    fetchMixlist: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__66 = this;
      var path = this.subendpoint('mixlist');
      if (force || this.mixlistPromise === null) {
        this.mixlistPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch(((function(err) {
          $__66.mixlistPromise = null;
          throw err;
        })).bind(this));
      }
      return this.mixlistPromise;
    }
  }, {
    get MIXLIST_TYPE_NONE() {
      return 0;
    },
    get MIXLIST_TYPE_PARTIAL() {
      return 1;
    },
    get MIXLIST_TYPE_FULL() {
      return 2;
    },
    get mhidPrefix() {
      return 'mhcol';
    },
    get rootEndpoint() {
      return 'graph/collection';
    },
    createWithName: function(name) {
      var path = $MHCollection.rootEndpoint + '/new';
      return houndRequest({
        method: 'POST',
        endpoint: path,
        data: {"name": name}
      }).then(function(response) {
        return MHObject.fetchByMhid(response.mhid);
      }).then(function(newCollection) {
        if (MHLoginSession.openSession) {
          MHLoginSession.currentUser.fetchOwnedCollections(true);
        }
        return newCollection;
      });
    },
    fetchFeaturedCollections: function() {
      var path = $MHCollection.rootEndpoint + '/featured';
      return houndRequest({
        method: 'GET',
        endpoint: path
      }).then((function(res) {
        return Promise.all(MHObject.fetchByMhids(res));
      }));
    }
  }, MHObject);
  (function() {
    MHObject.registerConstructor(MHCollection);
  })();
  return {get MHCollection() {
      return MHCollection;
    }};
});
System.register("models/contributor/MHContributor", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHContributor";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHContributor = function MHContributor(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHContributor.prototype, "constructor", [args]);
    Object.defineProperties(this, {
      'mediaPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'collectionsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }
    });
  };
  var $MHContributor = MHContributor;
  ($traceurRuntime.createClass)(MHContributor, {
    get isGroup() {
      return !this.isIndividual;
    },
    get isFictional() {
      return !this.isReal;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHContributor.prototype, "toString", []);
    },
    fetchMedia: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__70 = this;
      var path = this.subendpoint('media');
      if (force || this.mediaPromise === null) {
        this.mediaPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {'view': view}
        }).catch(((function(err) {
          $__70.mediaPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.mediaPromise;
    },
    fetchCollections: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__70 = this;
      var path = this.subendpoint('collections');
      if (force || this.collectionsPromise === null) {
        this.collectionsPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch(((function(err) {
          $__70.collectionsPromise = null;
          throw err;
        })).bind(this)).then(function(ids) {
          return Promise.all(ids.map((function(v) {
            return MHObject.fetchByMhid(v);
          })));
        });
      }
      return this.collectionsPromise;
    }
  }, {get rootEndpoint() {
      if (this.prototype.isFictional && this.prototype.isReal != null) {
        return 'graph/character';
      }
      return 'graph/contributor';
    }}, MHObject);
  return {get MHContributor() {
      return MHContributor;
    }};
});
System.register("models/contributor/MHFictionalGroupContributor", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHFictionalGroupContributor";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor").MHContributor;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHFictionalGroupContributor = function MHFictionalGroupContributor(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHFictionalGroupContributor.prototype, "constructor", [args]);
    Object.defineProperties(this, {'contributorsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }});
  };
  var $MHFictionalGroupContributor = MHFictionalGroupContributor;
  ($traceurRuntime.createClass)(MHFictionalGroupContributor, {
    get isIndividual() {
      return false;
    },
    get isReal() {
      return false;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHFictionalGroupContributor.prototype, "toString", []);
    },
    fetchContributors: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__75 = this;
      var path = this.subendpoint('contributors');
      if (force || this.contributorsPromise === null) {
        this.contributorsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {'view': view}
        }).catch(((function(err) {
          $__75.contributorsPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.contributorsPromise;
    }
  }, {get mhidPrefix() {
      return 'mhfgc';
    }}, MHContributor);
  (function() {
    MHObject.registerConstructor(MHFictionalGroupContributor);
  }());
  return {get MHFictionalGroupContributor() {
      return MHFictionalGroupContributor;
    }};
});
System.register("models/contributor/MHFictionalIndividualContributor", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHFictionalIndividualContributor";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor").MHContributor;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHFictionalIndividualContributor = function MHFictionalIndividualContributor(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHFictionalIndividualContributor.prototype, "constructor", [args]);
    Object.defineProperties(this, {'contributorsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }});
  };
  var $MHFictionalIndividualContributor = MHFictionalIndividualContributor;
  ($traceurRuntime.createClass)(MHFictionalIndividualContributor, {
    get isIndividual() {
      return true;
    },
    get isReal() {
      return false;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHFictionalIndividualContributor.prototype, "toString", []);
    },
    fetchContributors: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__80 = this;
      var path = this.subendpoint('contributors');
      if (force || this.contributorsPromise === null) {
        this.contributorsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {'view': view}
        }).catch(((function(err) {
          $__80.contributorsPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.contributorsPromise;
    }
  }, {get mhidPrefix() {
      return 'mhfic';
    }}, MHContributor);
  (function() {
    MHObject.registerConstructor(MHFictionalIndividualContributor);
  }());
  return {get MHFictionalIndividualContributor() {
      return MHFictionalIndividualContributor;
    }};
});
System.register("models/contributor/MHRealGroupContributor", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHRealGroupContributor";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor").MHContributor;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHRealGroupContributor = function MHRealGroupContributor(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHRealGroupContributor.prototype, "constructor", [args]);
    Object.defineProperties(this, {'charactersPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }});
  };
  var $MHRealGroupContributor = MHRealGroupContributor;
  ($traceurRuntime.createClass)(MHRealGroupContributor, {
    get isIndividual() {
      return false;
    },
    get isReal() {
      return true;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHRealGroupContributor.prototype, "toString", []);
    },
    fetchCharacters: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__85 = this;
      var path = this.subendpoint('characters');
      if (force || this.charactersPromise === null) {
        this.charactersPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {'view': view}
        }).catch(((function(err) {
          $__85.charactersPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.charactersPromise;
    }
  }, {get mhidPrefix() {
      return 'mhrgc';
    }}, MHContributor);
  (function() {
    MHObject.registerConstructor(MHRealGroupContributor);
  }());
  return {get MHRealGroupContributor() {
      return MHRealGroupContributor;
    }};
});
System.register("models/contributor/MHRealIndividualContributor", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHRealIndividualContributor";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor").MHContributor;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHRealIndividualContributor = function MHRealIndividualContributor(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHRealIndividualContributor.prototype, "constructor", [args]);
    Object.defineProperties(this, {'charactersPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }});
  };
  var $MHRealIndividualContributor = MHRealIndividualContributor;
  ($traceurRuntime.createClass)(MHRealIndividualContributor, {
    get isIndividual() {
      return true;
    },
    get isReal() {
      return true;
    },
    toString: function() {
      return $traceurRuntime.superCall(this, $MHRealIndividualContributor.prototype, "toString", []);
    },
    fetchCharacters: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__90 = this;
      var path = this.subendpoint('characters');
      if (force || this.charactersPromise === null) {
        this.charactersPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {'view': view}
        }).catch(((function(err) {
          $__90.charactersPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.charactersPromise;
    }
  }, {get mhidPrefix() {
      return 'mhric';
    }}, MHContributor);
  (function() {
    MHObject.registerConstructor(MHRealIndividualContributor);
  }());
  return {get MHRealIndividualContributor() {
      return MHRealIndividualContributor;
    }};
});
System.register("models/image/MHImage", [], function() {
  "use strict";
  var __moduleName = "models/image/MHImage";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHImage = function MHImage(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHImage.prototype, "constructor", [args]);
    var url = (typeof args.original.url === 'string') ? args.original.url.replace(/^http:|^https:/i, '') : null,
        width = args.width || null,
        height = args.height || null,
        isDefault = (typeof args.isDefault === 'boolean') ? args.isDefault : null;
    Object.defineProperties(this, {
      'url': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: url
      },
      'isDefault': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: isDefault
      },
      'width': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: width
      },
      'height': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: height
      }
    });
  };
  var $MHImage = MHImage;
  ($traceurRuntime.createClass)(MHImage, {}, {
    get mhidPrefix() {
      return 'mhimg';
    },
    get rootEndpoint() {
      return 'graph/image';
    }
  }, MHObject);
  (function() {
    MHObject.registerConstructor(MHImage);
  }());
  return {get MHImage() {
      return MHImage;
    }};
});
System.register("models/source/MHSourceFormat", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceFormat";
  var MHSourceFormat = function MHSourceFormat(args) {
    var method = arguments[1] !== (void 0) ? arguments[1] : null;
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceFormat', 'MHSourceFormat.js', 28);
      }
    }
    var type = args.type || null,
        price = args.price,
        launchInfo = args.launchInfo || null,
        timeperiod = args.timeperiod || null,
        subscriptionDescription = args.subscriptionDescription || null;
    if (type === null || price === null || launchInfo === null) {
      throw new TypeError('Required info not defined on argument map in MHSourceFormat', 'MHSourceFormat.js', 41);
    }
    if (price === undefined) {
      throw new TypeError('Price is undefined.', 'MHSourceFormat.js', 43);
    }
    Object.defineProperties(this, {
      'type': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: type
      },
      'price': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: price
      },
      'launchInfo': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: launchInfo
      },
      'timeperiod': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: timeperiod
      },
      'subscriptionDescription': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: subscriptionDescription
      },
      'method': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: method
      }
    });
  };
  ($traceurRuntime.createClass)(MHSourceFormat, {get displayPrice() {
      return '$' + this.price;
    }}, {});
  return {get MHSourceFormat() {
      return MHSourceFormat;
    }};
});
System.register("models/source/MHSourceMethod", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMethod";
  var MHSourceFormat = System.get("models/source/MHSourceFormat").MHSourceFormat;
  var MHSourceMethod = function MHSourceMethod(args) {
    var medium = arguments[1] !== (void 0) ? arguments[1] : null;
    var $__96 = this;
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceMethod', 'MHSourceMethod.js', 28);
      }
    }
    var type = args.type || null,
        formats = args.formats || null;
    if (type === null || formats === null) {
      throw new TypeError('Type or formats not defined on args array in MHSourceMethod', 'MHSourceMethod.js', 41);
    }
    formats = formats.map((function(v) {
      return new MHSourceFormat(v, $__96);
    }));
    Object.defineProperties(this, {
      'type': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: type
      },
      'formats': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: formats
      },
      'medium': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: medium
      }
    });
  };
  ($traceurRuntime.createClass)(MHSourceMethod, {}, {get TYPES() {
      return ['purchase', 'rental', 'subscription', 'adSupported'];
    }});
  return {get MHSourceMethod() {
      return MHSourceMethod;
    }};
});
System.register("models/source/MHSourceMedium", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMedium";
  var MHSourceMethod = System.get("models/source/MHSourceMethod").MHSourceMethod;
  var MHSourceMedium = function MHSourceMedium(args) {
    var source = arguments[1] !== (void 0) ? arguments[1] : null;
    var $__99 = this;
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceMedium', 'MHSourceMedium.js', 28);
      }
    }
    var type = args.type || null,
        methods = args.methods || null;
    if (type === null || methods === null) {
      throw new TypeError('Type or methods not defined on args in MHSourceMedium');
    }
    methods = methods.map((function(v) {
      return new MHSourceMethod(v, $__99);
    }));
    Object.defineProperties(this, {
      'type': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: type
      },
      'methods': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: methods
      },
      'source': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: source
      }
    });
  };
  ($traceurRuntime.createClass)(MHSourceMedium, {}, {get TYPES() {
      return ['stream', 'download', 'deliver', 'pickup', 'attend'];
    }});
  return {get MHSourceMedium() {
      return MHSourceMedium;
    }};
});
System.register("models/source/MHSourceModel", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceModel";
  var MHSourceMedium = System.get("models/source/MHSourceMedium").MHSourceMedium;
  var MHSourceModel = function MHSourceModel(args) {
    var content = arguments[1] !== (void 0) ? arguments[1] : null;
    var $__102 = this;
    if (typeof args === 'string' || args instanceof String) {
      try {
        args = JSON.parse(args);
      } catch (e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceModel', 'MHSourceModel.js', 28);
      }
    }
    var name = args.name || null,
        logo = args.logo || null,
        mediums = args.mediums || null,
        consumable = (typeof args.consumable === 'boolean') ? args.consumable : null;
    if (name === null || consumable === null || mediums === null) {
      console.warn('errored args: ', args);
      throw new TypeError('Name, consumable, or mediums null in args in MHSourceModel');
    }
    if (typeof logo.url === 'string') {
      logo.url = logo.url.replace(/http:|https:/gi, '');
    }
    mediums = mediums.map((function(v) {
      return new MHSourceMedium(v, $__102);
    }));
    Object.defineProperties(this, {
      'name': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: name
      },
      'consumable': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: consumable
      },
      'mediums': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mediums
      },
      'logo': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: logo
      },
      'content': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: content
      }
    });
  };
  ($traceurRuntime.createClass)(MHSourceModel, {getAllFormats: function() {
      var allFormats = [];
      this.mediums.forEach(function(medium) {
        medium.methods.forEach(function(method) {
          allFormats = allFormats.concat(method.formats);
        });
      });
      return allFormats;
    }}, {});
  return {get MHSourceModel() {
      return MHSourceModel;
    }};
});
System.register("models/media/MHMedia", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMedia";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHSourceModel = System.get("models/source/MHSourceModel").MHSourceModel;
  var MHEmbeddedObject = System.get("models/base/MHEmbeddedObject").MHEmbeddedObject;
  var MHRelationalPair = System.get("models/base/MHRelationalPair").MHRelationalPair;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHMedia = function MHMedia(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMedia.prototype, "constructor", [args]);
    var releaseDate = new Date(args.releaseDate) * 1000,
        suitabilityRating = args.suitabilityRating || null,
        length = args.length || null,
        primaryGroup = args.primaryGroup || null,
        keyContributors = (!!args.keyContributors) ? MHEmbeddedObject.createFromArray(args.keyContributors) : null;
    if (isNaN(releaseDate)) {
      releaseDate = args.releaseDate || null;
    }
    Object.defineProperties(this, {
      'releaseDate': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: releaseDate
      },
      'suitabilityRating': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: suitabilityRating
      },
      'length': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: length
      },
      'keyContributors': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: keyContributors
      },
      'primaryGroup': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: primaryGroup
      },
      'collectionsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'contentPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'sourcesPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'contributorsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'charactersPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      },
      'traitsPromise': {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      }
    });
  };
  var $MHMedia = MHMedia;
  ($traceurRuntime.createClass)(MHMedia, {
    toString: function() {
      return $traceurRuntime.superCall(this, $MHMedia.prototype, "toString", []) + ' and releaseDate ' + this.releaseDate;
    },
    fetchCollections: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var $__109 = this;
      var path = this.subendpoint('collections');
      if (force || this.collectionsPromise === null) {
        this.collectionsPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch(((function(err) {
          $__109.collectionsPromise = null;
          throw err;
        })).bind(this));
      }
      return this.collectionsPromise;
    },
    fetchContent: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var path = this.subendpoint('content'),
          self = this;
      if (force || this.contentPromise === null) {
        this.contentPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {view: view}
        }).catch((function(err) {
          self.contentPromise = null;
          throw err;
        })).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHRelationalPair.createFromArray(parsed).sort((function(a, b) {
              return a.position - b.position;
            }));
          }
          return parsed;
        });
      }
      return this.contentPromise.then((function(res) {
        if (view === 'full' && Array.isArray(res) && typeof res[0] === 'string') {
          return self.fetchContent(view, true);
        }
        if (view === 'ids' && Array.isArray(res) && res[0].object instanceof MHObject) {
          return res.map((function(pair) {
            return pair.object.mhid;
          }));
        }
        return res;
      }));
    },
    fetchSources: function() {
      var force = arguments[0] !== (void 0) ? arguments[0] : false;
      var self = this,
          path = this.subendpoint('sources');
      if (force || this.sourcesPromise === null) {
        this.sourcesPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch((function(err) {
          self.sourcesPromise = null;
          throw err;
        })).then(function(parsed) {
          return parsed.map((function(v) {
            return new MHSourceModel(v, self);
          }));
        });
      }
      return this.sourcesPromise;
    },
    fetchAvailableSources: function() {
      return this.fetchSources();
    },
    fetchDesiredSource: function() {
      return this.fetchAvailableSources();
    },
    fetchContributors: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__109 = this;
      var path = this.subendpoint('contributors');
      if (force || this.contributorsPromise === null) {
        this.contributorsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {view: view}
        }).catch(((function(err) {
          $__109.contributorsPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.contributorsPromise.then((function(res) {
        if (view === 'full' && Array.isArray(res) && typeof res[0] === 'string') {
          return Promise.all(MHObject.fetchByMhids(res));
        }
        if (view === 'ids' && Array.isArray(res) && typeof res[0] instanceof MHObject) {
          return res.map((function(obj) {
            return obj.mhid;
          }));
        }
        return res;
      }));
    },
    fetchCharacters: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var excludeMinors = arguments[1] !== (void 0) ? arguments[1] : false;
      var force = arguments[2] !== (void 0) ? arguments[2] : false;
      var $__109 = this;
      var path = this.subendpoint('contributors');
      if (force || this.charactersPromise === null) {
        this.charactersPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {
            view: view,
            excludeMinors: excludeMinors
          }
        }).catch(((function(err) {
          $__109.charactersPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.charactersPromise.then((function(res) {
        if (view === 'full' && Array.isArray(res) && typeof res[0] === 'string') {
          return Promise.all(MHObject.fetchByMhids(res));
        }
        if (view === 'ids' && Array.isArray(res) && typeof res[0] instanceof MHObject) {
          return res.map((function(obj) {
            return obj.mhid;
          }));
        }
        return res;
      }));
    },
    fetchTraits: function() {
      var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
      var force = arguments[1] !== (void 0) ? arguments[1] : false;
      var $__109 = this;
      var path = this.subendpoint('traits');
      if (force || this.traitsPromise === null) {
        this.traitsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {view: view}
        }).catch(((function(err) {
          $__109.traitsPromise = null;
          throw err;
        })).bind(this)).then(function(parsed) {
          if (view === 'full' && Array.isArray(parsed)) {
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
      }
      return this.traitsPromise.then((function(res) {
        if (view === 'full' && Array.isArray(res) && typeof res[0] === 'string') {
          return Promise.all(MHObject.fetchByMhids(res));
        }
        if (view === 'ids' && Array.isArray(res) && res[0] instanceof MHObject) {
          return res.map((function(obj) {
            return obj.mhid;
          }));
        }
        return res;
      }));
    }
  }, {get rootEndpoint() {
      return 'graph/media';
    }}, MHObject);
  return {get MHMedia() {
      return MHMedia;
    }};
});
System.register("models/media/MHAlbum", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAlbum";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHAlbum = function MHAlbum(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAlbum.prototype, "constructor", [args]);
  };
  var $MHAlbum = MHAlbum;
  ($traceurRuntime.createClass)(MHAlbum, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAlbum.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhalb';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHAlbum);
  })();
  return {get MHAlbum() {
      return MHAlbum;
    }};
});
System.register("models/media/MHAlbumSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAlbumSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHAlbumSeries = function MHAlbumSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAlbumSeries.prototype, "constructor", [args]);
  };
  var $MHAlbumSeries = MHAlbumSeries;
  ($traceurRuntime.createClass)(MHAlbumSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAlbumSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhals';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHAlbumSeries);
  })();
  return {get MHAlbumSeries() {
      return MHAlbumSeries;
    }};
});
System.register("models/media/MHAnthology", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAnthology";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHAnthology = function MHAnthology(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAnthology.prototype, "constructor", [args]);
  };
  var $MHAnthology = MHAnthology;
  ($traceurRuntime.createClass)(MHAnthology, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAnthology.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhath';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHAnthology);
  })();
  return {get MHAnthology() {
      return MHAnthology;
    }};
});
System.register("models/media/MHBook", [], function() {
  "use strict";
  var __moduleName = "models/media/MHBook";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHBook = function MHBook(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHBook.prototype, "constructor", [args]);
  };
  var $MHBook = MHBook;
  ($traceurRuntime.createClass)(MHBook, {toString: function() {
      return $traceurRuntime.superCall(this, $MHBook.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhbok';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHBook);
  })();
  return {get MHBook() {
      return MHBook;
    }};
});
System.register("models/media/MHBookSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHBookSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHBookSeries = function MHBookSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHBookSeries.prototype, "constructor", [args]);
  };
  var $MHBookSeries = MHBookSeries;
  ($traceurRuntime.createClass)(MHBookSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHBookSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhbks';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHBookSeries);
  })();
  return {get MHBookSeries() {
      return MHBookSeries;
    }};
});
System.register("models/media/MHComicBook", [], function() {
  "use strict";
  var __moduleName = "models/media/MHComicBook";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHComicBook = function MHComicBook(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHComicBook.prototype, "constructor", [args]);
  };
  var $MHComicBook = MHComicBook;
  ($traceurRuntime.createClass)(MHComicBook, {toString: function() {
      return $traceurRuntime.superCall(this, $MHComicBook.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhcbk';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHComicBook);
  })();
  return {get MHComicBook() {
      return MHComicBook;
    }};
});
System.register("models/media/MHComicBookSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHComicBookSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHComicBookSeries = function MHComicBookSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHComicBookSeries.prototype, "constructor", [args]);
  };
  var $MHComicBookSeries = MHComicBookSeries;
  ($traceurRuntime.createClass)(MHComicBookSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHComicBookSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhcbs';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHComicBookSeries);
  })();
  return {get MHComicBookSeries() {
      return MHComicBookSeries;
    }};
});
System.register("models/media/MHGame", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGame";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHGame = function MHGame(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGame.prototype, "constructor", [args]);
  };
  var $MHGame = MHGame;
  ($traceurRuntime.createClass)(MHGame, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGame.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgam';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHGame);
  })();
  return {get MHGame() {
      return MHGame;
    }};
});
System.register("models/media/MHGameSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGameSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHGameSeries = function MHGameSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGameSeries.prototype, "constructor", [args]);
  };
  var $MHGameSeries = MHGameSeries;
  ($traceurRuntime.createClass)(MHGameSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGameSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgms';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHGameSeries);
  })();
  return {get MHGameSeries() {
      return MHGameSeries;
    }};
});
System.register("models/media/MHGraphicNovel", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGraphicNovel";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHGraphicNovel = function MHGraphicNovel(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGraphicNovel.prototype, "constructor", [args]);
  };
  var $MHGraphicNovel = MHGraphicNovel;
  ($traceurRuntime.createClass)(MHGraphicNovel, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGraphicNovel.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgnl';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHGraphicNovel);
  })();
  return {get MHGraphicNovel() {
      return MHGraphicNovel;
    }};
});
System.register("models/media/MHGraphicNovelSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGraphicNovelSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHGraphicNovelSeries = function MHGraphicNovelSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGraphicNovelSeries.prototype, "constructor", [args]);
  };
  var $MHGraphicNovelSeries = MHGraphicNovelSeries;
  ($traceurRuntime.createClass)(MHGraphicNovelSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGraphicNovelSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgns';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHGraphicNovelSeries);
  })();
  return {get MHGraphicNovelSeries() {
      return MHGraphicNovelSeries;
    }};
});
System.register("models/media/MHMovie", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMovie";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHMovie = function MHMovie(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMovie.prototype, "constructor", [args]);
  };
  var $MHMovie = MHMovie;
  ($traceurRuntime.createClass)(MHMovie, {toString: function() {
      return $traceurRuntime.superCall(this, $MHMovie.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhmov';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHMovie);
  })();
  return {get MHMovie() {
      return MHMovie;
    }};
});
System.register("models/media/MHMovieSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMovieSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHMovieSeries = function MHMovieSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMovieSeries.prototype, "constructor", [args]);
  };
  var $MHMovieSeries = MHMovieSeries;
  ($traceurRuntime.createClass)(MHMovieSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHMovieSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhmvs';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHMovieSeries);
  })();
  return {get MHMovieSeries() {
      return MHMovieSeries;
    }};
});
System.register("models/media/MHMusicVideo", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMusicVideo";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHMusicVideo = function MHMusicVideo(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMusicVideo.prototype, "constructor", [args]);
  };
  var $MHMusicVideo = MHMusicVideo;
  ($traceurRuntime.createClass)(MHMusicVideo, {toString: function() {
      return $traceurRuntime.superCall(this, $MHMusicVideo.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhmsv';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHMusicVideo);
  })();
  return {get MHMusicVideo() {
      return MHMusicVideo;
    }};
});
System.register("models/media/MHNovella", [], function() {
  "use strict";
  var __moduleName = "models/media/MHNovella";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHNovella = function MHNovella(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHNovella.prototype, "constructor", [args]);
  };
  var $MHNovella = MHNovella;
  ($traceurRuntime.createClass)(MHNovella, {toString: function() {
      return $traceurRuntime.superCall(this, $MHNovella.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhnov';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHNovella);
  })();
  return {get MHNovella() {
      return MHNovella;
    }};
});
System.register("models/media/MHPeriodical", [], function() {
  "use strict";
  var __moduleName = "models/media/MHPeriodical";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHPeriodical = function MHPeriodical(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHPeriodical.prototype, "constructor", [args]);
  };
  var $MHPeriodical = MHPeriodical;
  ($traceurRuntime.createClass)(MHPeriodical, {toString: function() {
      return $traceurRuntime.superCall(this, $MHPeriodical.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhpdc';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHPeriodical);
  })();
  return {get MHPeriodical() {
      return MHPeriodical;
    }};
});
System.register("models/media/MHPeriodicalSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHPeriodicalSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHPeriodicalSeries = function MHPeriodicalSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHPeriodicalSeries.prototype, "constructor", [args]);
  };
  var $MHPeriodicalSeries = MHPeriodicalSeries;
  ($traceurRuntime.createClass)(MHPeriodicalSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHPeriodicalSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhpds';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHPeriodicalSeries);
  })();
  return {get MHPeriodicalSeries() {
      return MHPeriodicalSeries;
    }};
});
System.register("models/media/MHShowEpisode", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowEpisode";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHShowEpisode = function MHShowEpisode(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHShowEpisode.prototype, "constructor", [args]);
  };
  var $MHShowEpisode = MHShowEpisode;
  ($traceurRuntime.createClass)(MHShowEpisode, {toString: function() {
      return $traceurRuntime.superCall(this, $MHShowEpisode.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsep';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHShowEpisode);
  })();
  return {get MHShowEpisode() {
      return MHShowEpisode;
    }};
});
System.register("models/media/MHShowSeason", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowSeason";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHShowSeason = function MHShowSeason(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHShowSeason.prototype, "constructor", [args]);
  };
  var $MHShowSeason = MHShowSeason;
  ($traceurRuntime.createClass)(MHShowSeason, {toString: function() {
      return $traceurRuntime.superCall(this, $MHShowSeason.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhssn';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHShowSeason);
  })();
  return {get MHShowSeason() {
      return MHShowSeason;
    }};
});
System.register("models/media/MHShowSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHShowSeries = function MHShowSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHShowSeries.prototype, "constructor", [args]);
  };
  var $MHShowSeries = MHShowSeries;
  ($traceurRuntime.createClass)(MHShowSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHShowSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsss';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHShowSeries);
  })();
  return {get MHShowSeries() {
      return MHShowSeries;
    }};
});
System.register("models/media/MHSong", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSong";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHSong = function MHSong(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHSong.prototype, "constructor", [args]);
  };
  var $MHSong = MHSong;
  ($traceurRuntime.createClass)(MHSong, {toString: function() {
      return $traceurRuntime.superCall(this, $MHSong.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsng';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHSong);
  })();
  return {get MHSong() {
      return MHSong;
    }};
});
System.register("models/media/MHSpecial", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSpecial";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHSpecial = function MHSpecial(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHSpecial.prototype, "constructor", [args]);
  };
  var $MHSpecial = MHSpecial;
  ($traceurRuntime.createClass)(MHSpecial, {toString: function() {
      return $traceurRuntime.superCall(this, $MHSpecial.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhspc';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHSpecial);
  })();
  return {get MHSpecial() {
      return MHSpecial;
    }};
});
System.register("models/media/MHSpecialSeries", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSpecialSeries";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHSpecialSeries = function MHSpecialSeries(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHSpecialSeries.prototype, "constructor", [args]);
  };
  var $MHSpecialSeries = MHSpecialSeries;
  ($traceurRuntime.createClass)(MHSpecialSeries, {toString: function() {
      return $traceurRuntime.superCall(this, $MHSpecialSeries.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsps';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHSpecialSeries);
  })();
  return {get MHSpecialSeries() {
      return MHSpecialSeries;
    }};
});
System.register("models/media/MHTrailer", [], function() {
  "use strict";
  var __moduleName = "models/media/MHTrailer";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHTrailer = function MHTrailer(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHTrailer.prototype, "constructor", [args]);
  };
  var $MHTrailer = MHTrailer;
  ($traceurRuntime.createClass)(MHTrailer, {toString: function() {
      return $traceurRuntime.superCall(this, $MHTrailer.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhtrl';
    }}, MHMedia);
  (function() {
    MHObject.registerConstructor(MHTrailer);
  })();
  return {get MHTrailer() {
      return MHTrailer;
    }};
});
System.register("models/trait/MHTrait", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTrait";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = function MHTrait(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHTrait.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHTrait = MHTrait;
  ($traceurRuntime.createClass)(MHTrait, {toString: function() {
      return $traceurRuntime.superCall(this, $MHTrait.prototype, "toString", []);
    }}, {}, MHObject);
  return {get MHTrait() {
      return MHTrait;
    }};
});
System.register("models/trait/MHAchievements", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAchievements";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHAchievements = function MHAchievements(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAchievements.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHAchievements = MHAchievements;
  ($traceurRuntime.createClass)(MHAchievements, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAchievements.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhach';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHAchievements);
  })();
  return {get MHAchievements() {
      return MHAchievements;
    }};
});
System.register("models/trait/MHAudience", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAudience";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHAudience = function MHAudience(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHAudience.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHAudience = MHAudience;
  ($traceurRuntime.createClass)(MHAudience, {toString: function() {
      return $traceurRuntime.superCall(this, $MHAudience.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhaud';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHAudience);
  })();
  return {get MHAudience() {
      return MHAudience;
    }};
});
System.register("models/trait/MHEra", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHEra";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHEra = function MHEra(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHEra.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHEra = MHEra;
  ($traceurRuntime.createClass)(MHEra, {toString: function() {
      return $traceurRuntime.superCall(this, $MHEra.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhera';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHEra);
  })();
  return {get MHEra() {
      return MHEra;
    }};
});
System.register("models/trait/MHFlag", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHFlag";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHFlag = function MHFlag(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHFlag.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHFlag = MHFlag;
  ($traceurRuntime.createClass)(MHFlag, {toString: function() {
      return $traceurRuntime.superCall(this, $MHFlag.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhflg';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHFlag);
  })();
  return {get MHFlag() {
      return MHFlag;
    }};
});
System.register("models/trait/MHGenre", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHGenre";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHGenre = function MHGenre(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGenre.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHGenre = MHGenre;
  ($traceurRuntime.createClass)(MHGenre, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGenre.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgnr';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHGenre);
  })();
  return {get MHGenre() {
      return MHGenre;
    }};
});
System.register("models/trait/MHGraphGenre", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHGraphGenre";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHGraphGenre = function MHGraphGenre(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHGraphGenre.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHGraphGenre = MHGraphGenre;
  ($traceurRuntime.createClass)(MHGraphGenre, {toString: function() {
      return $traceurRuntime.superCall(this, $MHGraphGenre.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhgrg';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHGraphGenre);
  })();
  return {get MHGraphGenre() {
      return MHGraphGenre;
    }};
});
System.register("models/trait/MHMaterialSource", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHMaterialSource";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHMaterialSource = function MHMaterialSource(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMaterialSource.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHMaterialSource = MHMaterialSource;
  ($traceurRuntime.createClass)(MHMaterialSource, {toString: function() {
      return $traceurRuntime.superCall(this, $MHMaterialSource.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhmts';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHMaterialSource);
  })();
  return {get MHMaterialSource() {
      return MHMaterialSource;
    }};
});
System.register("models/trait/MHMood", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHMood";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHMood = function MHMood(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHMood.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHMood = MHMood;
  ($traceurRuntime.createClass)(MHMood, {toString: function() {
      return $traceurRuntime.superCall(this, $MHMood.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhmod';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHMood);
  })();
  return {get MHMood() {
      return MHMood;
    }};
});
System.register("models/trait/MHQuality", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHQuality";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHQuality = function MHQuality(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHQuality.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHQuality = MHQuality;
  ($traceurRuntime.createClass)(MHQuality, {toString: function() {
      return $traceurRuntime.superCall(this, $MHQuality.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhqlt';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHQuality);
  })();
  return {get MHQuality() {
      return MHQuality;
    }};
});
System.register("models/trait/MHStoryElement", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHStoryElement";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHStoryElement = function MHStoryElement(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHStoryElement.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHStoryElement = MHStoryElement;
  ($traceurRuntime.createClass)(MHStoryElement, {toString: function() {
      return $traceurRuntime.superCall(this, $MHStoryElement.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhstr';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHStoryElement);
  })();
  return {get MHStoryElement() {
      return MHStoryElement;
    }};
});
System.register("models/trait/MHStyleElement", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHStyleElement";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHStyleElement = function MHStyleElement(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHStyleElement.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHStyleElement = MHStyleElement;
  ($traceurRuntime.createClass)(MHStyleElement, {toString: function() {
      return $traceurRuntime.superCall(this, $MHStyleElement.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsty';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHStyleElement);
  })();
  return {get MHStyleElement() {
      return MHStyleElement;
    }};
});
System.register("models/trait/MHSubGenre", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHSubGenre";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHSubGenre = function MHSubGenre(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHSubGenre.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHSubGenre = MHSubGenre;
  ($traceurRuntime.createClass)(MHSubGenre, {toString: function() {
      return $traceurRuntime.superCall(this, $MHSubGenre.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhsgn';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHSubGenre);
  })();
  return {get MHSubGenre() {
      return MHSubGenre;
    }};
});
System.register("models/trait/MHTheme", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTheme";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHTheme = function MHTheme(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHTheme.prototype, "constructor", [args]);
    var description = args.description || null;
    Object.defineProperties(this, {'description': {
        configurable: false,
        enumerable: true,
        writable: false,
        value: description
      }});
  };
  var $MHTheme = MHTheme;
  ($traceurRuntime.createClass)(MHTheme, {toString: function() {
      return $traceurRuntime.superCall(this, $MHTheme.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhthm';
    }}, MHTrait);
  (function() {
    MHObject.registerConstructor(MHTheme);
  })();
  return {get MHTheme() {
      return MHTheme;
    }};
});
System.register("models/trait/MHTraitGroup", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTraitGroup";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHTraitGroup = function MHTraitGroup(args) {
    args = MHObject.parseArgs(args);
    $traceurRuntime.superCall(this, $MHTraitGroup.prototype, "constructor", [args]);
  };
  var $MHTraitGroup = MHTraitGroup;
  ($traceurRuntime.createClass)(MHTraitGroup, {toString: function() {
      return $traceurRuntime.superCall(this, $MHTraitGroup.prototype, "toString", []);
    }}, {get mhidPrefix() {
      return 'mhtrg';
    }}, MHObject);
  (function() {
    MHObject.registerConstructor(MHTraitGroup);
  })();
  return {get MHTraitGroup() {
      return MHTraitGroup;
    }};
});
System.register("models/all-models", [], function() {
  "use strict";
  var __moduleName = "models/all-models";
  var MHObject = System.get("models/base/MHObject").MHObject;
  var MHEmbeddedObject = System.get("models/base/MHEmbeddedObject").MHEmbeddedObject;
  var MHEmbeddedRelation = System.get("models/base/MHEmbeddedRelation").MHEmbeddedRelation;
  var MHRelationalPair = System.get("models/base/MHRelationalPair").MHRelationalPair;
  var MHAction = System.get("models/action/MHAction").MHAction;
  var MHAdd = System.get("models/action/MHAdd").MHAdd;
  var MHComment = System.get("models/action/MHComment").MHComment;
  var MHCreate = System.get("models/action/MHCreate").MHCreate;
  var MHLike = System.get("models/action/MHLike").MHLike;
  var MHFollow = System.get("models/action/MHFollow").MHFollow;
  var MHPost = System.get("models/action/MHPost").MHPost;
  var MHUser = System.get("models/user/MHUser").MHUser;
  var MHLoginSession = System.get("models/user/MHLoginSession").MHLoginSession;
  var MHSocial = System.get("models/social/MHSocial").MHSocial;
  var MHMedia = System.get("models/media/MHMedia").MHMedia;
  var MHAlbum = System.get("models/media/MHAlbum").MHAlbum;
  var MHAlbumSeries = System.get("models/media/MHAlbumSeries").MHAlbumSeries;
  var MHAnthology = System.get("models/media/MHAnthology").MHAnthology;
  var MHBook = System.get("models/media/MHBook").MHBook;
  var MHBookSeries = System.get("models/media/MHBookSeries").MHBookSeries;
  var MHComicBook = System.get("models/media/MHComicBook").MHComicBook;
  var MHComicBookSeries = System.get("models/media/MHComicBookSeries").MHComicBookSeries;
  var MHGame = System.get("models/media/MHGame").MHGame;
  var MHGameSeries = System.get("models/media/MHGameSeries").MHGameSeries;
  var MHGraphicNovel = System.get("models/media/MHGraphicNovel").MHGraphicNovel;
  var MHGraphicNovelSeries = System.get("models/media/MHGraphicNovelSeries").MHGraphicNovelSeries;
  var MHMovie = System.get("models/media/MHMovie").MHMovie;
  var MHMovieSeries = System.get("models/media/MHMovieSeries").MHMovieSeries;
  var MHMusicVideo = System.get("models/media/MHMusicVideo").MHMusicVideo;
  var MHNovella = System.get("models/media/MHNovella").MHNovella;
  var MHPeriodical = System.get("models/media/MHPeriodical").MHPeriodical;
  var MHPeriodicalSeries = System.get("models/media/MHPeriodicalSeries").MHPeriodicalSeries;
  var MHShowEpisode = System.get("models/media/MHShowEpisode").MHShowEpisode;
  var MHShowSeason = System.get("models/media/MHShowSeason").MHShowSeason;
  var MHShowSeries = System.get("models/media/MHShowSeries").MHShowSeries;
  var MHSong = System.get("models/media/MHSong").MHSong;
  var MHSpecial = System.get("models/media/MHSpecial").MHSpecial;
  var MHSpecialSeries = System.get("models/media/MHSpecialSeries").MHSpecialSeries;
  var MHTrailer = System.get("models/media/MHTrailer").MHTrailer;
  var MHCollection = System.get("models/collection/MHCollection").MHCollection;
  var MHMetaData = System.get("models/meta/MHMetaData").MHMetaData;
  var MHImage = System.get("models/image/MHImage").MHImage;
  var MHTrait = System.get("models/trait/MHTrait").MHTrait;
  var MHTraitGroup = System.get("models/trait/MHTraitGroup").MHTraitGroup;
  var MHGenre = System.get("models/trait/MHGenre").MHGenre;
  var MHSubGenre = System.get("models/trait/MHSubGenre").MHSubGenre;
  var MHMood = System.get("models/trait/MHMood").MHMood;
  var MHQuality = System.get("models/trait/MHQuality").MHQuality;
  var MHStyleElement = System.get("models/trait/MHStyleElement").MHStyleElement;
  var MHStoryElement = System.get("models/trait/MHStoryElement").MHStoryElement;
  var MHMaterialSource = System.get("models/trait/MHMaterialSource").MHMaterialSource;
  var MHTheme = System.get("models/trait/MHTheme").MHTheme;
  var MHAchievements = System.get("models/trait/MHAchievements").MHAchievements;
  var MHEra = System.get("models/trait/MHEra").MHEra;
  var MHAudience = System.get("models/trait/MHAudience").MHAudience;
  var MHFlag = System.get("models/trait/MHFlag").MHFlag;
  var MHGraphGenre = System.get("models/trait/MHGraphGenre").MHGraphGenre;
  var MHContributor = System.get("models/contributor/MHContributor").MHContributor;
  var MHRealIndividualContributor = System.get("models/contributor/MHRealIndividualContributor").MHRealIndividualContributor;
  var MHRealGroupContributor = System.get("models/contributor/MHRealGroupContributor").MHRealGroupContributor;
  var MHFictionalIndividualContributor = System.get("models/contributor/MHFictionalIndividualContributor").MHFictionalIndividualContributor;
  var MHFictionalGroupContributor = System.get("models/contributor/MHFictionalGroupContributor").MHFictionalGroupContributor;
  var MHSourceFormat = System.get("models/source/MHSourceFormat").MHSourceFormat;
  var MHSourceMethod = System.get("models/source/MHSourceMethod").MHSourceMethod;
  var MHSourceMedium = System.get("models/source/MHSourceMedium").MHSourceMedium;
  var MHSourceModel = System.get("models/source/MHSourceModel").MHSourceModel;
  delete MHObject.registerConstructor;
  var models = {
    get MHObject() {
      return MHObject;
    },
    get MHEmbeddedObject() {
      return MHEmbeddedObject;
    },
    get MHEmbeddedRelation() {
      return MHEmbeddedRelation;
    },
    get MHRelationalPair() {
      return MHRelationalPair;
    },
    get MHAction() {
      return MHAction;
    },
    get MHAdd() {
      return MHAdd;
    },
    get MHComment() {
      return MHComment;
    },
    get MHCreate() {
      return MHCreate;
    },
    get MHLike() {
      return MHLike;
    },
    get MHFollow() {
      return MHFollow;
    },
    get MHPost() {
      return MHPost;
    },
    get MHUser() {
      return MHUser;
    },
    get MHLoginSession() {
      return MHLoginSession;
    },
    get MHSocial() {
      return MHSocial;
    },
    get MHMedia() {
      return MHMedia;
    },
    get MHAlbum() {
      return MHAlbum;
    },
    get MHAlbumSeries() {
      return MHAlbumSeries;
    },
    get MHAnthology() {
      return MHAnthology;
    },
    get MHBook() {
      return MHBook;
    },
    get MHBookSeries() {
      return MHBookSeries;
    },
    get MHComicBook() {
      return MHComicBook;
    },
    get MHComicBookSeries() {
      return MHComicBookSeries;
    },
    get MHGame() {
      return MHGame;
    },
    get MHGameSeries() {
      return MHGameSeries;
    },
    get MHGraphicNovel() {
      return MHGraphicNovel;
    },
    get MHGraphicNovelSeries() {
      return MHGraphicNovelSeries;
    },
    get MHMovie() {
      return MHMovie;
    },
    get MHMovieSeries() {
      return MHMovieSeries;
    },
    get MHMusicVideo() {
      return MHMusicVideo;
    },
    get MHNovella() {
      return MHNovella;
    },
    get MHPeriodical() {
      return MHPeriodical;
    },
    get MHPeriodicalSeries() {
      return MHPeriodicalSeries;
    },
    get MHShowEpisode() {
      return MHShowEpisode;
    },
    get MHShowSeason() {
      return MHShowSeason;
    },
    get MHShowSeries() {
      return MHShowSeries;
    },
    get MHSong() {
      return MHSong;
    },
    get MHSpecial() {
      return MHSpecial;
    },
    get MHSpecialSeries() {
      return MHSpecialSeries;
    },
    get MHTrailer() {
      return MHTrailer;
    },
    get MHCollection() {
      return MHCollection;
    },
    get MHImage() {
      return MHImage;
    },
    get MHMetaData() {
      return MHMetaData;
    },
    get MHTrait() {
      return MHTrait;
    },
    get MHTraitGroup() {
      return MHTraitGroup;
    },
    get MHGenre() {
      return MHGenre;
    },
    get MHSubGenre() {
      return MHSubGenre;
    },
    get MHMood() {
      return MHMood;
    },
    get MHQuality() {
      return MHQuality;
    },
    get MHStyleElement() {
      return MHStyleElement;
    },
    get MHStoryElement() {
      return MHStoryElement;
    },
    get MHMaterialSource() {
      return MHMaterialSource;
    },
    get MHTheme() {
      return MHTheme;
    },
    get MHAchievements() {
      return MHAchievements;
    },
    get MHEra() {
      return MHEra;
    },
    get MHAudience() {
      return MHAudience;
    },
    get MHFlag() {
      return MHFlag;
    },
    get MHGraphGenre() {
      return MHGraphGenre;
    },
    get MHContributor() {
      return MHContributor;
    },
    get MHRealIndividualContributor() {
      return MHRealIndividualContributor;
    },
    get MHRealGroupContributor() {
      return MHRealGroupContributor;
    },
    get MHFictionalIndividualContributor() {
      return MHFictionalIndividualContributor;
    },
    get MHFictionalGroupContributor() {
      return MHFictionalGroupContributor;
    },
    get MHSourceFormat() {
      return MHSourceFormat;
    },
    get MHSourceMethod() {
      return MHSourceMethod;
    },
    get MHSourceMedium() {
      return MHSourceMedium;
    },
    get MHSourceModel() {
      return MHSourceModel;
    }
  };
  return {get models() {
      return models;
    }};
});
System.register("search/paged-search", [], function() {
  "use strict";
  var __moduleName = "search/paged-search";
  var pagedSearch = function() {};
  var $__default = pagedSearch;
  return {
    get pagedSearch() {
      return pagedSearch;
    },
    get default() {
      return $__default;
    }
  };
});
System.register("search/quick-search", [], function() {
  "use strict";
  var __moduleName = "search/quick-search";
  var $__292 = System.get("models/internal/debug-helpers"),
      warn = $__292.warn,
      error = $__292.error;
  var houndRequest = System.get("request/hound-request").houndRequest;
  var MHObject = System.get("models/base/MHObject").MHObject;
  var i,
      prop,
      buildSearchHelper,
      quickSearch,
      search = {},
      extraEncode = houndRequest.extraEncode,
      types = ['all', 'movie', 'song', 'album', 'tvseries', 'book', 'game', 'person', 'collection', 'user'],
      makeEndpoint = function(searchType, query) {
        return 'search/' + searchType + '/find/' + extraEncode(query) + '/autocomplete';
      },
      makeParams = function(size) {
        var params = {page: 0};
        params['page.size'] = (typeof size === 'number') ? size : 8;
        return params;
      },
      makeSearchRequest = function(searchType, query, size) {
        return houndRequest({
          method: 'GET',
          endpoint: makeEndpoint(searchType, query),
          params: makeParams(size)
        });
      };
  buildSearchHelper = function(index) {
    search[types[index]] = function(query, size) {
      return makeSearchRequest(types[index], query, size).then((function(parsed) {
        parsed.content = parsed.content.map((function(v) {
          v.metadata = {};
          v.metadata.mhid = v.mhid;
          v.metadata.name = v.name;
          if (typeof v.primaryImageUrl === 'string') {
            v.primaryImage = {
              metadata: {
                mhid: 'mhimgPlaceHolderSearchShim',
                isDefault: false
              },
              original: {url: v.primaryImageUrl}
            };
          }
          return v;
        }));
        return parsed;
      })).then((function(parsed) {
        var mhObj;
        return parsed.content.map((function(v) {
          try {
            mhObj = MHObject.create(v);
            return mhObj;
          } catch (e) {
            warn('unrecognized mhid prefix: ', v.mhid);
            error(e);
            return v;
          }
        }));
      }));
    };
  };
  for (i = 0; i < types.length; i++) {
    buildSearchHelper(i);
  }
  quickSearch = function(query, size) {
    var j,
        typeMap = {};
    return Promise.all(types.map(function(v) {
      return search[v](query, size);
    })).then(function(results) {
      for (j = 0; j < types.length; j++) {
        typeMap[types[j]] = results[j];
      }
      return typeMap;
    });
  };
  for (prop in search) {
    if (search.hasOwnProperty(prop)) {
      quickSearch[prop] = search[prop];
    }
  }
  quickSearch.everything = function(query, size) {
    var currType,
        i = 0,
        rtn = {};
    for (currType = types[i]; i < types.length; currType = types[++i]) {
      rtn[currType] = search[currType](query, size);
    }
    return rtn;
  };
  ;
  return {get quickSearch() {
      return quickSearch;
    }};
});
System.register("hound-api", [], function() {
  "use strict";
  var __moduleName = "hound-api";
  var request = System.get("request/hound-request").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request").pagedRequest;
  var models = System.get("models/all-models").models;
  var quickSearch = System.get("search/quick-search").quickSearch;
  var pagedSearch = System.get("search/paged-search").pagedSearch;
  ;
  var $__default = {
    get models() {
      return models;
    },
    get request() {
      return request;
    },
    get pagedRequest() {
      return pagedRequest;
    },
    get quickSearch() {
      return quickSearch;
    },
    get pagedSearch() {
      return pagedSearch;
    }
  };
  return {
    get request() {
      return request;
    },
    get pagedRequest() {
      return pagedRequest;
    },
    get models() {
      return models;
    },
    get quickSearch() {
      return quickSearch;
    },
    get pagedSearch() {
      return pagedSearch;
    },
    get default() {
      return $__default;
    }
  };
});
System.get("hound-api" + '');
