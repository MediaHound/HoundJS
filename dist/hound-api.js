(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return ;
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
  var $apply = Function.prototype.call.bind(Function.prototype.apply);
  function $bind(operand, thisArg, args) {
    var argArray = [thisArg];
    for (var i = 0; i < args.length; i++) {
      argArray[i + 1] = args[i];
    }
    var func = $apply(Function.prototype.bind, operand, argArray);
    return func;
  }
  function $construct(func, argArray) {
    var object = new ($bind(func, null, argArray));
    return object;
  }
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  var CONTINUATION_TYPE = Object.create(null);
  function createContinuation(operand, thisArg, argsArray) {
    return [CONTINUATION_TYPE, operand, thisArg, argsArray];
  }
  function isContinuation(object) {
    return object && object[0] === CONTINUATION_TYPE;
  }
  var isTailRecursiveName = null;
  function setupProperTailCalls() {
    isTailRecursiveName = createPrivateName();
    Function.prototype.call = initTailRecursiveFunction(function call(thisArg) {
      var result = tailCall(function(thisArg) {
        var argArray = [];
        for (var i = 1; i < arguments.length; ++i) {
          argArray[i - 1] = arguments[i];
        }
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
    Function.prototype.apply = initTailRecursiveFunction(function apply(thisArg, argArray) {
      var result = tailCall(function(thisArg, argArray) {
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
  }
  function initTailRecursiveFunction(func) {
    if (isTailRecursiveName === null) {
      setupProperTailCalls();
    }
    func[isTailRecursiveName] = true;
    return func;
  }
  function isTailRecursive(func) {
    return !!func[isTailRecursiveName];
  }
  function tailCall(func, thisArg, argArray) {
    var continuation = argArray[0];
    if (isContinuation(continuation)) {
      continuation = $apply(func, thisArg, continuation[3]);
      return continuation;
    }
    continuation = createContinuation(func, thisArg, argArray);
    while (true) {
      if (isTailRecursive(func)) {
        continuation = $apply(func, continuation[2], [continuation]);
      } else {
        continuation = $apply(func, continuation[2], continuation[3]);
      }
      if (!isContinuation(continuation)) {
        return continuation;
      }
      func = continuation[1];
    }
  }
  function construct() {
    var object;
    if (isTailRecursive(this)) {
      object = $construct(this, [createContinuation(null, null, arguments)]);
    } else {
      object = $construct(this, arguments);
    }
    return object;
  }
  var $traceurRuntime = {
    initTailRecursiveFunction: initTailRecursiveFunction,
    call: tailCall,
    continuation: createContinuation,
    construct: construct
  };
  (function() {
    function nonEnum(value) {
      return {
        configurable: true,
        enumerable: false,
        value: value,
        writable: true
      };
    }
    var method = nonEnum;
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    function isShimSymbol(symbol) {
      return typeof symbol === 'object' && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
      if (isShimSymbol(v))
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
      return symbolValue[symbolInternalProperty];
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
    freeze(SymbolValue.prototype);
    function isSymbolString(s) {
      return symbolValues[s] || privateNames[s];
    }
    function toProperty(name) {
      if (isShimSymbol(name))
        return name[symbolInternalProperty];
      return name;
    }
    function removeSymbolKeys(array) {
      var rv = [];
      for (var i = 0; i < array.length; i++) {
        if (!isSymbolString(array[i])) {
          rv.push(array[i]);
        }
      }
      return rv;
    }
    function getOwnPropertyNames(object) {
      return removeSymbolKeys($getOwnPropertyNames(object));
    }
    function keys(object) {
      return removeSymbolKeys($keys(object));
    }
    function getOwnPropertySymbols(object) {
      var rv = [];
      var names = $getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var symbol = symbolValues[names[i]];
        if (symbol) {
          rv.push(symbol);
        }
      }
      return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
      return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function hasOwnProperty(name) {
      return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
      return global.$traceurRuntime.options[name];
    }
    function defineProperty(object, name, descriptor) {
      if (isShimSymbol(name)) {
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
      $defineProperty(Object, 'keys', {value: keys});
    }
    function exportStar(object) {
      for (var i = 1; i < arguments.length; i++) {
        var names = $getOwnPropertyNames(arguments[i]);
        for (var j = 0; j < names.length; j++) {
          var name = names[j];
          if (name === '__esModule' || isSymbolString(name))
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
    function polyfillSymbol(global, Symbol) {
      if (!global.Symbol) {
        global.Symbol = Symbol;
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
      }
      if (!global.Symbol.iterator) {
        global.Symbol.iterator = Symbol('Symbol.iterator');
      }
      if (!global.Symbol.observer) {
        global.Symbol.observer = Symbol('Symbol.observer');
      }
    }
    function setupGlobals(global) {
      polyfillSymbol(global, Symbol);
      global.Reflect = global.Reflect || {};
      global.Reflect.global = global.Reflect.global || global;
      polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
      call: tailCall,
      checkObjectCoercible: checkObjectCoercible,
      construct: construct,
      continuation: createContinuation,
      createPrivateName: createPrivateName,
      defineProperties: $defineProperties,
      defineProperty: $defineProperty,
      exportStar: exportStar,
      getOwnHashObject: getOwnHashObject,
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      getOwnPropertyNames: $getOwnPropertyNames,
      initTailRecursiveFunction: initTailRecursiveFunction,
      isObject: isObject,
      isPrivateName: isPrivateName,
      isSymbolString: isSymbolString,
      keys: $keys,
      options: {},
      setupGlobals: setupGlobals,
      toObject: toObject,
      toProperty: toProperty,
      typeof: typeOf
    };
  })();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
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
  var $__1 = $traceurRuntime,
      canonicalizeUrl = $__1.canonicalizeUrl,
      resolveUrl = $__1.resolveUrl,
      isAbsolute = $__1.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  }
  function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  }
  ModuleEvaluationError.prototype = Object.create(Error.prototype);
  ModuleEvaluationError.prototype.constructor = ModuleEvaluationError;
  ModuleEvaluationError.prototype.stripError = function(message) {
    return message.replace(/.*Error:/, this.constructor.name + ':');
  };
  ModuleEvaluationError.prototype.stripCause = function(cause) {
    if (!cause)
      return '';
    if (!cause.message)
      return cause + '';
    return this.stripError(cause.message);
  };
  ModuleEvaluationError.prototype.loadedBy = function(moduleName) {
    this.stack += '\n loaded by ' + moduleName;
  };
  ModuleEvaluationError.prototype.stripStack = function(causeStack) {
    var stack = [];
    causeStack.split('\n').some((function(frame) {
      if (/UncoatedModuleInstantiator/.test(frame))
        return true;
      stack.push(frame);
    }));
    stack[0] = this.stripError(stack[0]);
    return stack.join('\n');
  };
  function beforeLines(lines, number) {
    var result = [];
    var first = number - 3;
    if (first < 0)
      first = 0;
    for (var i = first; i < number; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function afterLines(lines, number) {
    var last = number + 1;
    if (last > lines.length - 1)
      last = lines.length - 1;
    var result = [];
    for (var i = number; i <= last; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function columnSpacing(columns) {
    var result = '';
    for (var i = 0; i < columns - 1; i++) {
      result += '-';
    }
    return result;
  }
  function UncoatedModuleInstantiator(url, func) {
    UncoatedModuleEntry.call(this, url, null);
    this.func = func;
  }
  UncoatedModuleInstantiator.prototype = Object.create(UncoatedModuleEntry.prototype);
  UncoatedModuleInstantiator.prototype.getUncoatedModule = function() {
    var $__0 = this;
    if (this.value_)
      return this.value_;
    try {
      var relativeRequire;
      if (typeof $traceurRuntime !== undefined && $traceurRuntime.require) {
        relativeRequire = $traceurRuntime.require.bind(null, this.url);
      }
      return this.value_ = this.func.call(global, relativeRequire);
    } catch (ex) {
      if (ex instanceof ModuleEvaluationError) {
        ex.loadedBy(this.url);
        throw ex;
      }
      if (ex.stack) {
        var lines = this.func.toString().split('\n');
        var evaled = [];
        ex.stack.split('\n').some((function(frame, index) {
          if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
            return true;
          var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
          if (m) {
            var line = parseInt(m[2], 10);
            evaled = evaled.concat(beforeLines(lines, line));
            if (index === 1) {
              evaled.push(columnSpacing(m[3]) + '^ ' + $__0.url);
            } else {
              evaled.push(columnSpacing(m[3]) + '^');
            }
            evaled = evaled.concat(afterLines(lines, line));
            evaled.push('= = = = = = = = =');
          } else {
            evaled.push(frame);
          }
        }));
        ex.stack = evaled.join('\n');
      }
      throw new ModuleEvaluationError(this.url, ex);
    }
  };
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return ;
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
      if (typeof name !== 'string')
        throw new TypeError('module name must be a string, not ' + typeof name);
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
    registerModule: function(name, deps, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, deps, func);
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
    }
  };
  var moduleStoreModule = new Module({ModuleStore: ModuleStore});
  ModuleStore.set('@traceur/src/runtime/ModuleStore.js', moduleStoreModule);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    registerModule: ModuleStore.registerModule.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
System.registerModule("traceur-runtime@0.0.89/src/runtime/async.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/async.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var $createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $create = Object.create;
  var thisName = $createPrivateName();
  var argsName = $createPrivateName();
  var observeName = $createPrivateName();
  function AsyncGeneratorFunction() {}
  function AsyncGeneratorFunctionPrototype() {}
  AsyncGeneratorFunction.prototype = AsyncGeneratorFunctionPrototype;
  AsyncGeneratorFunctionPrototype.constructor = AsyncGeneratorFunction;
  $defineProperty(AsyncGeneratorFunctionPrototype, 'constructor', {enumerable: false});
  var AsyncGeneratorContext = (function() {
    function AsyncGeneratorContext(observer) {
      var $__0 = this;
      this.decoratedObserver = $traceurRuntime.createDecoratedGenerator(observer, (function() {
        $__0.done = true;
      }));
      this.done = false;
      this.inReturn = false;
    }
    return ($traceurRuntime.createClass)(AsyncGeneratorContext, {
      throw: function(error) {
        if (!this.inReturn) {
          throw error;
        }
      },
      yield: function(value) {
        if (this.done) {
          this.inReturn = true;
          throw undefined;
        }
        var result;
        try {
          result = this.decoratedObserver.next(value);
        } catch (e) {
          this.done = true;
          throw e;
        }
        if (result === undefined) {
          return ;
        }
        if (result.done) {
          this.done = true;
          this.inReturn = true;
          throw undefined;
        }
        return result.value;
      },
      yieldFor: function(observable) {
        var ctx = this;
        return $traceurRuntime.observeForEach(observable[$traceurRuntime.toProperty(Symbol.observer)].bind(observable), function(value) {
          if (ctx.done) {
            this.return();
            return ;
          }
          var result;
          try {
            result = ctx.decoratedObserver.next(value);
          } catch (e) {
            ctx.done = true;
            throw e;
          }
          if (result === undefined) {
            return ;
          }
          if (result.done) {
            ctx.done = true;
          }
          return result;
        });
      }
    }, {});
  }());
  AsyncGeneratorFunctionPrototype.prototype[Symbol.observer] = function(observer) {
    var observe = this[observeName];
    var ctx = new AsyncGeneratorContext(observer);
    $traceurRuntime.schedule((function() {
      return observe(ctx);
    })).then((function(value) {
      if (!ctx.done) {
        ctx.decoratedObserver.return(value);
      }
    })).catch((function(error) {
      if (!ctx.done) {
        ctx.decoratedObserver.throw(error);
      }
    }));
    return ctx.decoratedObserver;
  };
  $defineProperty(AsyncGeneratorFunctionPrototype.prototype, Symbol.observer, {enumerable: false});
  function initAsyncGeneratorFunction(functionObject) {
    functionObject.prototype = $create(AsyncGeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = AsyncGeneratorFunctionPrototype;
    return functionObject;
  }
  function createAsyncGeneratorInstance(observe, functionObject) {
    for (var args = [],
        $__2 = 2; $__2 < arguments.length; $__2++)
      args[$__2 - 2] = arguments[$__2];
    var object = $create(functionObject.prototype);
    object[thisName] = this;
    object[argsName] = args;
    object[observeName] = observe;
    return object;
  }
  function observeForEach(observe, next) {
    return new Promise((function(resolve, reject) {
      var generator = observe({
        next: function(value) {
          return next.call(generator, value);
        },
        throw: function(error) {
          reject(error);
        },
        return: function(value) {
          resolve(value);
        }
      });
    }));
  }
  function schedule(asyncF) {
    return Promise.resolve().then(asyncF);
  }
  var generator = Symbol();
  var onDone = Symbol();
  var DecoratedGenerator = (function() {
    function DecoratedGenerator(_generator, _onDone) {
      this[generator] = _generator;
      this[onDone] = _onDone;
    }
    return ($traceurRuntime.createClass)(DecoratedGenerator, {
      next: function(value) {
        var result = this[generator].next(value);
        if (result !== undefined && result.done) {
          this[onDone].call(this);
        }
        return result;
      },
      throw: function(error) {
        this[onDone].call(this);
        return this[generator].throw(error);
      },
      return: function(value) {
        this[onDone].call(this);
        return this[generator].return(value);
      }
    }, {});
  }());
  function createDecoratedGenerator(generator, onDone) {
    return new DecoratedGenerator(generator, onDone);
  }
  $traceurRuntime.initAsyncGeneratorFunction = initAsyncGeneratorFunction;
  $traceurRuntime.createAsyncGeneratorInstance = createAsyncGeneratorInstance;
  $traceurRuntime.observeForEach = observeForEach;
  $traceurRuntime.schedule = schedule;
  $traceurRuntime.createDecoratedGenerator = createDecoratedGenerator;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/classes.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/classes.js";
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
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
  function superConstructor(ctor) {
    return ctor.__proto__;
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
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function forEachPropertyKey(object, f) {
    getOwnPropertyNames(object).forEach(f);
    getOwnPropertySymbols(object).forEach(f);
  }
  function getDescriptors(object) {
    var descriptors = {};
    forEachPropertyKey(object, (function(key) {
      descriptors[key] = $getOwnPropertyDescriptor(object, key);
      descriptors[key].enumerable = false;
    }));
    return descriptors;
  }
  var nonEnum = {enumerable: false};
  function makePropertiesNonEnumerable(object) {
    forEachPropertyKey(object, (function(key) {
      $defineProperty(object, key, nonEnum);
    }));
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
      makePropertiesNonEnumerable(object);
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
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/destructuring.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/destructuring.js";
  function iteratorToArray(iter) {
    var rv = [];
    var i = 0;
    var tmp;
    while (!(tmp = iter.next()).done) {
      rv[i++] = tmp.value;
    }
    return rv;
  }
  $traceurRuntime.iteratorToArray = iteratorToArray;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/generators.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/generators.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
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
  var RETURN_SENTINEL = {};
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.oldReturnValue = undefined;
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
    maybeUncatchable: function() {
      if (this.storedException === RETURN_SENTINEL) {
        throw RETURN_SENTINEL;
      }
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
    },
    wrapYieldStar: function(iterator) {
      var ctx = this;
      return {
        next: function(v) {
          return iterator.next(v);
        },
        throw: function(e) {
          var result;
          if (e === RETURN_SENTINEL) {
            if (iterator.return) {
              result = iterator.return(ctx.returnValue);
              if (!result.done) {
                ctx.returnValue = ctx.oldReturnValue;
                return result;
              }
              ctx.returnValue = result.value;
            }
            throw e;
          }
          if (iterator.throw) {
            return iterator.throw(e);
          }
          iterator.return && iterator.return();
          throw $TypeError('Inner iterator does not have a throw method');
        }
      };
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
        if (x === RETURN_SENTINEL) {
          return {
            value: ctx.returnValue,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          if (x === RETURN_SENTINEL) {
            return {
              value: ctx.returnValue,
              done: true
            };
          }
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value;
        try {
          value = moveNext(ctx);
        } catch (ex) {
          if (ex === RETURN_SENTINEL) {
            value = ctx;
          } else {
            throw ex;
          }
        }
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
    },
    return: function(v) {
      this[ctxName].oldReturnValue = this[ctxName].returnValue;
      this[ctxName].returnValue = v;
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', RETURN_SENTINEL);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false},
    return: {enumerable: false}
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
      return ;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/relativeRequire.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/relativeRequire.js";
  var path;
  function relativeRequire(callerPath, requiredPath) {
    path = path || typeof require !== 'undefined' && require('path');
    function isDirectory(path) {
      return path.slice(-1) === '/';
    }
    function isAbsolute(path) {
      return path[0] === '/';
    }
    function isRelative(path) {
      return path[0] === '.';
    }
    if (isDirectory(requiredPath) || isAbsolute(requiredPath))
      return ;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/spread.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/spread.js";
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
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/template.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/template.js";
  var $__0 = Object,
      defineProperty = $__0.defineProperty,
      freeze = $__0.freeze;
  var slice = Array.prototype.slice;
  var map = Object.create(null);
  function getTemplateObject(raw) {
    var cooked = arguments[1];
    var key = raw.join('${}');
    var templateObject = map[key];
    if (templateObject)
      return templateObject;
    if (!cooked) {
      cooked = slice.call(raw);
    }
    return map[key] = freeze(defineProperty(cooked, 'raw', {value: freeze(raw)}));
  }
  $traceurRuntime.getTemplateObject = getTemplateObject;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/type-assertions.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/type-assertions.js";
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = (function() {
    function GenericType(type, argumentTypes) {
      this.type = type;
      this.argumentTypes = argumentTypes;
    }
    return ($traceurRuntime.createClass)(GenericType, {}, {});
  }());
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      argumentTypes[$__1 - 1] = arguments[$__1];
    var typeMap = typeRegister;
    var key = $traceurRuntime.getOwnHashObject(type).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
    for (var i = 0; i < argumentTypes.length - 1; i++) {
      key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
      if (!typeMap[key]) {
        typeMap[key] = Object.create(null);
      }
      typeMap = typeMap[key];
    }
    var tail = argumentTypes[argumentTypes.length - 1];
    key = $traceurRuntime.getOwnHashObject(tail).hash;
    if (!typeMap[key]) {
      typeMap[key] = new GenericType(type, argumentTypes);
    }
    return typeMap[key];
  }
  $traceurRuntime.GenericType = GenericType;
  $traceurRuntime.genericType = genericType;
  $traceurRuntime.type = types;
  return {};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/runtime-modules.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/runtime-modules.js";
  System.get("traceur-runtime@0.0.89/src/runtime/relativeRequire.js");
  System.get("traceur-runtime@0.0.89/src/runtime/spread.js");
  System.get("traceur-runtime@0.0.89/src/runtime/destructuring.js");
  System.get("traceur-runtime@0.0.89/src/runtime/classes.js");
  System.get("traceur-runtime@0.0.89/src/runtime/async.js");
  System.get("traceur-runtime@0.0.89/src/runtime/generators.js");
  System.get("traceur-runtime@0.0.89/src/runtime/template.js");
  System.get("traceur-runtime@0.0.89/src/runtime/type-assertions.js");
  return {};
});
System.get("traceur-runtime@0.0.89/src/runtime/runtime-modules.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/utils.js";
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
      return ;
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
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
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
  var Map = (function() {
    function Map() {
      var $__10,
          $__11;
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Map called on incompatible type');
      if ($hasOwnProperty.call(this, 'entries_')) {
        throw new TypeError('Map can not be reentrantly initialised');
      }
      initMap(this);
      if (iterable !== null && iterable !== undefined) {
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var $__9 = $__3.value,
                key = ($__10 = $__9[$traceurRuntime.toProperty(Symbol.iterator)](), ($__11 = $__10.next()).done ? void 0 : $__11.value),
                value = ($__11 = $__10.next()).done ? void 0 : $__11.value;
            {
              this.set(key, value);
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
      }
    }
    return ($traceurRuntime.createClass)(Map, {
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
      entries: $traceurRuntime.initGeneratorFunction(function $__12() {
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
        }, $__12, this);
      }),
      keys: $traceurRuntime.initGeneratorFunction(function $__13() {
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
        }, $__13, this);
      }),
      values: $traceurRuntime.initGeneratorFunction(function $__14() {
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
        }, $__14, this);
      })
    }, {});
  }());
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__9 = global,
        Object = $__9.Object,
        Symbol = $__9.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = (function() {
    function Set() {
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Set called on incompatible type');
      if ($hasOwnProperty.call(this, 'map_')) {
        throw new TypeError('Set can not be reentrantly initialised');
      }
      initSet(this);
      if (iterable !== null && iterable !== undefined) {
        var $__7 = true;
        var $__8 = false;
        var $__9 = undefined;
        try {
          for (var $__5 = void 0,
              $__4 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
            var item = $__5.value;
            {
              this.add(item);
            }
          }
        } catch ($__10) {
          $__8 = true;
          $__9 = $__10;
        } finally {
          try {
            if (!$__7 && $__4.return != null) {
              $__4.return();
            }
          } finally {
            if ($__8) {
              throw $__9;
            }
          }
        }
      }
    }
    return ($traceurRuntime.createClass)(Set, {
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
        var $__2 = this;
        return this.map_.forEach((function(value, key) {
          callbackFn.call(thisArg, key, key, $__2);
        }));
      },
      values: $traceurRuntime.initGeneratorFunction(function $__12() {
        var $__13,
            $__14;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__13 = $ctx.wrapYieldStar(this.map_.keys()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__14 = $__13[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__14.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__14.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__14.value;
              default:
                return $ctx.end();
            }
        }, $__12, this);
      }),
      entries: $traceurRuntime.initGeneratorFunction(function $__15() {
        var $__16,
            $__17;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__16 = $ctx.wrapYieldStar(this.map_.entries()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__17 = $__16[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__17.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__17.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__17.value;
              default:
                return $ctx.end();
            }
        }, $__15, this);
      })
    }, {});
  }());
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
    var $__11 = global,
        Object = $__11.Object,
        Symbol = $__11.Symbol;
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.89/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/node_modules/rsvp/lib/rsvp/asap.js";
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
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.89/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js").registerPolyfill;
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
  var Promise = (function() {
    function Promise(resolver) {
      if (resolver === promiseRaw)
        return ;
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
    }
    return ($traceurRuntime.createClass)(Promise, {
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
          var makeCountdownFunction = function(i) {
            return (function(x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            });
          };
          var count = 0;
          var i = 0;
          var $__6 = true;
          var $__7 = false;
          var $__8 = undefined;
          try {
            for (var $__4 = void 0,
                $__3 = (values)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
              var value = $__4.value;
              {
                var countdownFunction = makeCountdownFunction(i);
                this.resolve(value).then(countdownFunction, (function(r) {
                  deferred.reject(r);
                }));
                ++i;
                ++count;
              }
            }
          } catch ($__9) {
            $__7 = true;
            $__8 = $__9;
          } finally {
            try {
              if (!$__6 && $__3.return != null) {
                $__3.return();
              }
            } finally {
              if ($__7) {
                throw $__8;
              }
            }
          }
          if (count === 0) {
            deferred.resolve(resolutions);
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
  }());
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
      return ;
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = (function() {
    var $__2;
    function StringIterator() {}
    return ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
      value: function() {
        var o = this;
        if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
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
    }), Object.defineProperty($__2, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__2), {});
  }());
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
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
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
  function includes(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    if (search && $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (pos != pos) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    if (searchLength + start > stringLength) {
      return false;
    }
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
  function fromCodePoint(_) {
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
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'endsWith', endsWith, 'includes', includes, 'repeat', repeat, 'startsWith', startsWith]);
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
    get includes() {
      return includes;
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = (function() {
    var $__2;
    function ArrayIterator() {}
    return ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
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
    }), Object.defineProperty($__2, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__2), {});
  }());
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
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      jsValues = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
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
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (items)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var item = $__3.value;
          {
            if (mapping) {
              arr[k] = mapFn.call(thisArg, item, k);
            } else {
              arr[k] = item;
            }
            k++;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
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
        $__9 = 0; $__9 < arguments.length; $__9++)
      items[$__9] = arguments[$__9];
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
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__10 = global,
        Array = $__10.Array,
        Object = $__10.Object,
        Symbol = $__10.Symbol;
    var values = jsValues;
    if (Symbol && Symbol.iterator && Array.prototype[Symbol.iterator]) {
      values = Array.prototype[Symbol.iterator];
    }
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = source == null ? [] : keys(source);
      var p = void 0,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
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
      if (isPrivateName(name))
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
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
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/fround.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/fround.js";
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__0 = Math,
      LN2 = $__0.LN2,
      abs = $__0.abs,
      floor = $__0.floor,
      log = $__0.log,
      min = $__0.min,
      pow = $__0.pow;
  function packIEEE754(v, ebits, fbits) {
    var bias = (1 << (ebits - 1)) - 1,
        s,
        e,
        f,
        ln,
        i,
        bits,
        str,
        bytes;
    function roundToEven(n) {
      var w = floor(n),
          f = n - w;
      if (f < 0.5)
        return w;
      if (f > 0.5)
        return w + 1;
      return w % 2 ? w + 1 : w;
    }
    if (v !== v) {
      e = (1 << ebits) - 1;
      f = pow(2, fbits - 1);
      s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << ebits) - 1;
      f = 0;
      s = (v < 0) ? 1 : 0;
    } else if (v === 0) {
      e = 0;
      f = 0;
      s = (1 / v === -Infinity) ? 1 : 0;
    } else {
      s = v < 0;
      v = abs(v);
      if (v >= pow(2, 1 - bias)) {
        e = min(floor(log(v) / LN2), 1023);
        f = roundToEven(v / pow(2, e) * pow(2, fbits));
        if (f / pow(2, fbits) >= 2) {
          e = e + 1;
          f = 1;
        }
        if (e > bias) {
          e = (1 << ebits) - 1;
          f = 0;
        } else {
          e = e + bias;
          f = f - pow(2, fbits);
        }
      } else {
        e = 0;
        f = roundToEven(v / pow(2, 1 - bias - fbits));
      }
    }
    bits = [];
    for (i = fbits; i; i -= 1) {
      bits.push(f % 2 ? 1 : 0);
      f = floor(f / 2);
    }
    for (i = ebits; i; i -= 1) {
      bits.push(e % 2 ? 1 : 0);
      e = floor(e / 2);
    }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');
    bytes = [];
    while (str.length) {
      bytes.push(parseInt(str.substring(0, 8), 2));
      str = str.substring(8);
    }
    return bytes;
  }
  function unpackIEEE754(bytes, ebits, fbits) {
    var bits = [],
        i,
        j,
        b,
        str,
        bias,
        s,
        e,
        f;
    for (i = bytes.length; i; i -= 1) {
      b = bytes[i - 1];
      for (j = 8; j; j -= 1) {
        bits.push(b % 2 ? 1 : 0);
        b = b >> 1;
      }
    }
    bits.reverse();
    str = bits.join('');
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);
    if (e === (1 << ebits) - 1) {
      return f !== 0 ? NaN : s * Infinity;
    } else if (e > 0) {
      return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
    } else if (f !== 0) {
      return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
    } else {
      return s < 0 ? -0 : 0;
    }
  }
  function unpackF32(b) {
    return unpackIEEE754(b, 8, 23);
  }
  function packF32(v) {
    return packIEEE754(v, 8, 23);
  }
  function fround(x) {
    if (x === 0 || !$isFinite(x) || $isNaN(x)) {
      return x;
    }
    return unpackF32(packF32(Number(x)));
  }
  return {get fround() {
      return fround;
    }};
});
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/Math.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/Math.js";
  var jsFround = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/fround.js").fround;
  var $__1 = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      registerPolyfill = $__1.registerPolyfill,
      toUint32 = $__1.toUint32;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__2 = Math,
      abs = $__2.abs,
      ceil = $__2.ceil,
      exp = $__2.exp,
      floor = $__2.floor,
      log = $__2.log,
      pow = $__2.pow,
      sqrt = $__2.sqrt;
  function clz32(x) {
    x = toUint32(+x);
    if (x == 0)
      return 32;
    var result = 0;
    if ((x & 0xFFFF0000) === 0) {
      x <<= 16;
      result += 16;
    }
    ;
    if ((x & 0xFF000000) === 0) {
      x <<= 8;
      result += 8;
    }
    ;
    if ((x & 0xF0000000) === 0) {
      x <<= 4;
      result += 4;
    }
    ;
    if ((x & 0xC0000000) === 0) {
      x <<= 2;
      result += 2;
    }
    ;
    if ((x & 0x80000000) === 0) {
      x <<= 1;
      result += 1;
    }
    ;
    return result;
  }
  function imul(x, y) {
    x = toUint32(+x);
    y = toUint32(+y);
    var xh = (x >>> 16) & 0xffff;
    var xl = x & 0xffff;
    var yh = (y >>> 16) & 0xffff;
    var yl = y & 0xffff;
    return xl * yl + (((xh * yl + xl * yh) << 16) >>> 0) | 0;
  }
  function sign(x) {
    x = +x;
    if (x > 0)
      return 1;
    if (x < 0)
      return -1;
    return x;
  }
  function log10(x) {
    return log(x) * 0.434294481903251828;
  }
  function log2(x) {
    return log(x) * 1.442695040888963407;
  }
  function log1p(x) {
    x = +x;
    if (x < -1 || $isNaN(x)) {
      return NaN;
    }
    if (x === 0 || x === Infinity) {
      return x;
    }
    if (x === -1) {
      return -Infinity;
    }
    var result = 0;
    var n = 50;
    if (x < 0 || x > 1) {
      return log(1 + x);
    }
    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        result -= pow(x, i) / i;
      } else {
        result += pow(x, i) / i;
      }
    }
    return result;
  }
  function expm1(x) {
    x = +x;
    if (x === -Infinity) {
      return -1;
    }
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return exp(x) - 1;
  }
  function cosh(x) {
    x = +x;
    if (x === 0) {
      return 1;
    }
    if ($isNaN(x)) {
      return NaN;
    }
    if (!$isFinite(x)) {
      return Infinity;
    }
    if (x < 0) {
      x = -x;
    }
    if (x > 21) {
      return exp(x) / 2;
    }
    return (exp(x) + exp(-x)) / 2;
  }
  function sinh(x) {
    x = +x;
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  }
  function tanh(x) {
    x = +x;
    if (x === 0)
      return x;
    if (!$isFinite(x))
      return sign(x);
    var exp1 = exp(x);
    var exp2 = exp(-x);
    return (exp1 - exp2) / (exp1 + exp2);
  }
  function acosh(x) {
    x = +x;
    if (x < 1)
      return NaN;
    if (!$isFinite(x))
      return x;
    return log(x + sqrt(x + 1) * sqrt(x - 1));
  }
  function asinh(x) {
    x = +x;
    if (x === 0 || !$isFinite(x))
      return x;
    if (x > 0)
      return log(x + sqrt(x * x + 1));
    return -log(-x + sqrt(x * x + 1));
  }
  function atanh(x) {
    x = +x;
    if (x === -1) {
      return -Infinity;
    }
    if (x === 1) {
      return Infinity;
    }
    if (x === 0) {
      return x;
    }
    if ($isNaN(x) || x < -1 || x > 1) {
      return NaN;
    }
    return 0.5 * log((1 + x) / (1 - x));
  }
  function hypot(x, y) {
    var length = arguments.length;
    var args = new Array(length);
    var max = 0;
    for (var i = 0; i < length; i++) {
      var n = arguments[i];
      n = +n;
      if (n === Infinity || n === -Infinity)
        return Infinity;
      n = abs(n);
      if (n > max)
        max = n;
      args[i] = n;
    }
    if (max === 0)
      max = 1;
    var sum = 0;
    var compensation = 0;
    for (var i = 0; i < length; i++) {
      var n = args[i] / max;
      var summand = n * n - compensation;
      var preliminary = sum + summand;
      compensation = (preliminary - sum) - summand;
      sum = preliminary;
    }
    return sqrt(sum) * max;
  }
  function trunc(x) {
    x = +x;
    if (x > 0)
      return floor(x);
    if (x < 0)
      return ceil(x);
    return x;
  }
  var fround,
      f32;
  if (typeof Float32Array === 'function') {
    f32 = new Float32Array(1);
    fround = function(x) {
      f32[0] = Number(x);
      return f32[0];
    };
  } else {
    fround = jsFround;
  }
  function cbrt(x) {
    x = +x;
    if (x === 0)
      return x;
    var negate = x < 0;
    if (negate)
      x = -x;
    var result = pow(x, 1 / 3);
    return negate ? -result : result;
  }
  function polyfillMath(global) {
    var Math = global.Math;
    maybeAddFunctions(Math, ['acosh', acosh, 'asinh', asinh, 'atanh', atanh, 'cbrt', cbrt, 'clz32', clz32, 'cosh', cosh, 'expm1', expm1, 'fround', fround, 'hypot', hypot, 'imul', imul, 'log10', log10, 'log1p', log1p, 'log2', log2, 'sign', sign, 'sinh', sinh, 'tanh', tanh, 'trunc', trunc]);
  }
  registerPolyfill(polyfillMath);
  return {
    get clz32() {
      return clz32;
    },
    get imul() {
      return imul;
    },
    get sign() {
      return sign;
    },
    get log10() {
      return log10;
    },
    get log2() {
      return log2;
    },
    get log1p() {
      return log1p;
    },
    get expm1() {
      return expm1;
    },
    get cosh() {
      return cosh;
    },
    get sinh() {
      return sinh;
    },
    get tanh() {
      return tanh;
    },
    get acosh() {
      return acosh;
    },
    get asinh() {
      return asinh;
    },
    get atanh() {
      return atanh;
    },
    get hypot() {
      return hypot;
    },
    get trunc() {
      return trunc;
    },
    get fround() {
      return fround;
    },
    get cbrt() {
      return cbrt;
    },
    get polyfillMath() {
      return polyfillMath;
    }
  };
});
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/Math.js" + '');
System.registerModule("traceur-runtime@0.0.89/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.89/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.89/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.89/src/runtime/polyfills/polyfills.js" + '');

System.registerModule("models/internal/debug-helpers.js", [], function() {
  "use strict";
  var __moduleName = "models/internal/debug-helpers.js";
  var debug = {
    log: false,
    warn: true,
    error: true
  };
  var isDevAndDebug = function() {
    if (typeof window !== 'undefined') {
      return window.mhDebug && (window.location.host === 'local.mediahound.com:2014');
    } else {
      return false;
    }
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
System.registerModule("models/sdk/MHSDK.js", [], function() {
  "use strict";
  var __moduleName = "models/sdk/MHSDK.js";
  var _MHAccessToken = null;
  var _MHClientId = null;
  var _MHClientSecret = null;
  var _houndOrigin = 'https://api-v10.mediahound.com/';
  var MHSDK = (function() {
    function MHSDK() {}
    return ($traceurRuntime.createClass)(MHSDK, {}, {
      configure: function(clientId, clientSecret, origin) {
        _MHClientId = clientId;
        _MHClientSecret = clientSecret;
        if (origin) {
          _houndOrigin = origin;
        }
        return this.refreshOAuthToken();
      },
      refreshOAuthToken: function() {
        var houndRequest = System.get('request/hound-request.js').houndRequest;
        return houndRequest({
          endpoint: 'cas/oauth2.0/accessToken',
          params: {
            client_id: _MHClientId,
            client_secret: _MHClientSecret,
            grant_type: 'client_credentials'
          }
        }).then(function(response) {
          _MHAccessToken = response.accessToken;
        });
      },
      get MHAccessToken() {
        return _MHAccessToken;
      },
      get origin() {
        return _houndOrigin;
      }
    });
  }());
  return {get MHSDK() {
      return MHSDK;
    }};
});
System.registerModule("request/promise-request.js", [], function() {
  "use strict";
  var __moduleName = "request/promise-request.js";
  var xhrc;
  if (typeof window !== 'undefined') {
    if (!window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest())) {
      throw new Error("No XMLHttpRequest 2 Object found, please update your browser.");
    } else {
      xhrc = window;
    }
  } else if (typeof window === 'undefined') {
    xhrc = require("xmlhttprequest-cookie");
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
            onprogress = args.onprogress || args.onProgress || null,
            xhr = new xhrc.XMLHttpRequest();
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
              } else if (Array.isArray(params[prop]) || params[prop] instanceof Array) {
                var $__3 = true;
                var $__4 = false;
                var $__5 = undefined;
                try {
                  for (var $__1 = void 0,
                      $__0 = (params[prop])[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
                    var p = $__1.value;
                    {
                      url += encodeURIComponent(prop) + '=' + extraEncode(p).replace('%20', '+');
                      url += '&';
                    }
                  }
                } catch ($__6) {
                  $__4 = true;
                  $__5 = $__6;
                } finally {
                  try {
                    if (!$__3 && $__0.return != null) {
                      $__0.return();
                    }
                  } finally {
                    if ($__4) {
                      throw $__5;
                    }
                  }
                }
                if (params[prop].length > 0) {
                  url = url.slice(0, -1);
                }
              } else {
                url += encodeURIComponent(prop) + '=' + extraEncode(JSON.stringify(params[prop])).replace('%20', '+');
              }
            }
          }
          prop = null;
        }
        if (data) {
          if (typeof data === 'string' || data instanceof String || data instanceof ArrayBuffer) {} else if (typeof FormData !== 'undefined' && data instanceof FormData) {} else if (typeof Blob !== 'undefined' && data instanceof Blob) {} else {
            data = JSON.stringify(data);
            if (headers == null) {
              headers = {'Content-Type': 'application/json'};
            } else if (!headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          }
        }
        xhr.open(method, url, true);
        xhr.withCredentials = true;
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
System.registerModule("request/hound-request.js", [], function() {
  "use strict";
  var __moduleName = "request/hound-request.js";
  var log = System.get("models/internal/debug-helpers.js").log;
  var promiseRequest = System.get("request/promise-request.js").promiseRequest;
  var MHSDK = System.get("models/sdk/MHSDK.js").MHSDK;
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
      args.url = MHSDK.origin + args.endpoint;
      delete args.endpoint;
    }
    if (MHSDK.MHAccessToken) {
      if (args.params) {
        args.params.access_token = MHSDK.MHAccessToken;
      } else {
        args.params = {access_token: MHSDK.MHAccessToken};
      }
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
System.registerModule("request/hound-paged-request.js", [], function() {
  "use strict";
  var __moduleName = "request/hound-paged-request.js";
  var houndRequest = System.get("request/hound-request.js").houndRequest;
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
        var MHRelationalPair = System.get('models/base/MHRelationalPair.js').MHRelationalPair;
        var self = this;
        self.pagingInfo = response.pagingInfo || null;
        if (response.content !== undefined) {
          if (response.content[0] !== undefined && response.content[0].object !== undefined) {
            this.pageid = response.content[0].object.metadata.mhid;
          }
          var content = Promise.all(MHRelationalPair.createFromArray(response.content));
          return content.catch(function(err) {
            console.warn(err);
          }).then(function(mhObjs) {
            Array.prototype.push.apply(self.content, mhObjs);
            response.content = mhObjs;
            return response;
          });
        } else {
          console.warn('content array is undefined or empty in setContentArray MHRelationalPair', self);
        }
      };
  var PagedRequest = (function() {
    function PagedRequest(args) {
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
      return this;
    }
    return ($traceurRuntime.createClass)(PagedRequest, {
      get currentPromise() {
        return this.pagePromises[this.page];
      },
      next: function() {
        var self = this;
        return this.currentPromise.then(function(response) {
          if (!self.lastPage) {
            self.page += 1;
            self._args.params.next = response.pagingInfo.next;
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
  }());
  var pagedRequest = function(a) {
    return new PagedRequest(a);
  };
  return {get pagedRequest() {
      return pagedRequest;
    }};
});
System.registerModule("models/internal/MHCache.js", [], function() {
  "use strict";
  var __moduleName = "models/internal/MHCache.js";
  var log = System.get("models/internal/debug-helpers.js").log;
  var keymapSym = Symbol('keymap');
  var MHCache = (function() {
    function MHCache(limit) {
      this.size = 0;
      this.limit = limit;
      this[keymapSym] = {};
    }
    return ($traceurRuntime.createClass)(MHCache, {
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
          return ;
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
          return ;
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
                return ;
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
        var MHObject = System.get('models/base/MHObject.js').MHObject;
        if (!localStorage || typeof localStorage[storageKey] === 'undefined') {
          log('nothing stored');
          return ;
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
  }());
  return {get MHCache() {
      return MHCache;
    }};
});
System.registerModule("models/image/MHImageData.js", [], function() {
  "use strict";
  var __moduleName = "models/image/MHImageData.js";
  var MHImageData = (function() {
    function MHImageData(args) {
      var url = (typeof args.url === 'string') ? args.url : null,
          width = args.width || null,
          height = args.height || null;
      Object.defineProperties(this, {
        'url': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: url
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
    }
    return ($traceurRuntime.createClass)(MHImageData, {}, {});
  }());
  return {get MHImageData() {
      return MHImageData;
    }};
});
System.registerModule("models/meta/MHMetaData.js", [], function() {
  "use strict";
  var __moduleName = "models/meta/MHMetaData.js";
  var MHImageData = System.get("models/image/MHImageData.js").MHImageData;
  var MHMetaData = (function() {
    function MHMetaData(args) {
      var mhid = args.mhid || null,
          altid = args.altid || null,
          name = args.name || null,
          description = args.description || null,
          message = args.message || null,
          mixlist = args.mixlist || null,
          username = args.username || null,
          email = args.email || null,
          isDefault = args.isDefault || null,
          averageColor = args.averageColor || null,
          createdDate = new Date(args.createdDate * 1000),
          releaseDate = new Date(args.releaseDate * 1000),
          original = (args.original != null) ? new MHImageData(args.original) : null,
          thumbnail = (args.thumbnail != null) ? new MHImageData(args.thumbnail) : null,
          small = (args.small != null) ? new MHImageData(args.small) : null,
          medium = (args.medium != null) ? new MHImageData(args.medium) : null,
          large = (args.large != null) ? new MHImageData(args.large) : null;
      if (name) {
        Object.defineProperty(this, 'name', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: name
        });
      }
      if (altid) {
        Object.defineProperty(this, 'altId', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: altid
        });
      }
      if (username) {
        Object.defineProperty(this, 'username', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: username
        });
      }
      if (email) {
        Object.defineProperty(this, 'email', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: email
        });
      }
      if (description) {
        Object.defineProperty(this, 'description', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        });
      }
      if (message) {
        Object.defineProperty(this, 'message', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: message
        });
      }
      if (mixlist) {
        Object.defineProperty(this, 'mixlist', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mixlist
        });
      }
      if (averageColor) {
        Object.defineProperty(this, 'averageColor', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: averageColor
        });
      }
      if (isDefault) {
        Object.defineProperty(this, 'isDefault', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: isDefault
        });
      }
      if (releaseDate) {
        if (isNaN(releaseDate)) {
          releaseDate = null;
        } else if (releaseDate === 'Invalid Date') {
          releaseDate = null;
        } else {
          releaseDate = new Date(releaseDate.valueOf() + releaseDate.getTimezoneOffset() * 60000);
        }
        Object.defineProperty(this, 'releaseDate', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: releaseDate
        });
      }
      if (args.createdDate) {
        if (isNaN(createdDate)) {
          createdDate = null;
        } else if (createdDate === 'Invalid Date') {
          createdDate = null;
        } else {
          createdDate = new Date(createdDate.valueOf() + createdDate.getTimezoneOffset());
        }
        Object.defineProperty(this, 'createdDate', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: createdDate
        });
      }
      Object.defineProperty(this, 'mhid', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mhid
      });
      if (original) {
        Object.defineProperty(this, 'original', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: original
        });
      }
      if (thumbnail) {
        Object.defineProperty(this, 'thumbnail', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: thumbnail
        });
      }
      if (small) {
        Object.defineProperty(this, 'small', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: small
        });
      }
      if (medium) {
        Object.defineProperty(this, 'medium', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: medium
        });
      }
      if (large) {
        Object.defineProperty(this, 'large', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: large
        });
      }
    }
    return ($traceurRuntime.createClass)(MHMetaData, {}, {});
  }());
  return {get MHMetaData() {
      return MHMetaData;
    }};
});
System.registerModule("models/social/MHSocial.js", [], function() {
  "use strict";
  var __moduleName = "models/social/MHSocial.js";
  var MHSocial = (function() {
    function MHSocial(args) {
      if (typeof args === 'string' || args instanceof String) {
        try {
          args = JSON.parse(args);
        } catch (e) {
          throw new TypeError('Args typeof string but not JSON in MHSocial', 'MHSocial.js', 28);
        }
      }
      var $__4 = true;
      var $__5 = false;
      var $__6 = undefined;
      try {
        for (var $__2 = void 0,
            $__1 = (MHSocial.members)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
          var prop = $__2.value;
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
      } catch ($__7) {
        $__5 = true;
        $__6 = $__7;
      } finally {
        try {
          if (!$__4 && $__1.return != null) {
            $__1.return();
          }
        } finally {
          if ($__5) {
            throw $__6;
          }
        }
      }
    }
    return ($traceurRuntime.createClass)(MHSocial, {
      isEqualToMHSocial: function(otherObj) {
        var $__4 = true;
        var $__5 = false;
        var $__6 = undefined;
        try {
          for (var $__2 = void 0,
              $__1 = (MHSocial.members)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
            var prop = $__2.value;
            {
              if (typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop]) {
                continue;
              } else if (!this[prop] && !otherObj[prop]) {
                continue;
              }
              return false;
            }
          }
        } catch ($__7) {
          $__5 = true;
          $__6 = $__7;
        } finally {
          try {
            if (!$__4 && $__1.return != null) {
              $__1.return();
            }
          } finally {
            if ($__5) {
              throw $__6;
            }
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
          case MHSocial.LIKE:
            toChange = 'likers';
            newValue = this.likers + 1;
            alsoFlip = 'userLikes';
            break;
          case MHSocial.UNLIKE:
            toChange = 'likers';
            newValue = this.likers - 1;
            alsoFlip = 'userLikes';
            break;
          case MHSocial.DISLIKE:
          case MHSocial.UNDISLIKE:
            alsoFlip = 'userDislikes';
            break;
          case MHSocial.FOLLOW:
            toChange = 'followers';
            newValue = this.followers + 1;
            alsoFlip = 'userFollows';
            break;
          case MHSocial.UNFOLLOW:
            toChange = 'followers';
            newValue = this.followers - 1;
            alsoFlip = 'userFollows';
            break;
          case MHSocial.COLLECT:
            toChange = 'collectors';
            newValue = this.collectors + 1;
            break;
          default:
            break;
        }
        var $__4 = true;
        var $__5 = false;
        var $__6 = undefined;
        try {
          for (var $__2 = void 0,
              $__1 = (MHSocial.members)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
            var prop = $__2.value;
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
        } catch ($__7) {
          $__5 = true;
          $__6 = $__7;
        } finally {
          try {
            if (!$__4 && $__1.return != null) {
              $__1.return();
            }
          } finally {
            if ($__5) {
              throw $__6;
            }
          }
        }
        return new MHSocial(newArgs);
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
        return [MHSocial.LIKE, MHSocial.UNLIKE, MHSocial.DISLIKE, MHSocial.UNDISLIKE, MHSocial.FOLLOW, MHSocial.UNFOLLOW];
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
  }());
  return {get MHSocial() {
      return MHSocial;
    }};
});
System.registerModule("models/base/MHObject.js", [], function() {
  "use strict";
  var __moduleName = "models/base/MHObject.js";
  var $__0 = System.get("models/internal/debug-helpers.js"),
      log = $__0.log,
      warn = $__0.warn,
      error = $__0.error;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHCache = System.get("models/internal/MHCache.js").MHCache;
  var MHMetaData = System.get("models/meta/MHMetaData.js").MHMetaData;
  var MHSocial = System.get("models/social/MHSocial.js").MHSocial;
  var childrenConstructors = {};
  var mhidLRU = new MHCache(1000);
  if (typeof window !== 'undefined') {
    if (window.location.host === 'local.mediahound.com:2014') {
      window.mhidLRU = mhidLRU;
    }
  }
  var lastSocialRequestIdSym = Symbol('lastSocialRequestId'),
      socialSym = Symbol('social');
  var MHObject = (function() {
    function MHObject(args) {
      args = MHObject.parseArgs(args);
      if (typeof args.metadata.mhid === 'undefined' || args.metadata.mhid === null) {
        throw new TypeError('mhid is null or undefined', 'MHObject.js', 89);
      }
      var metadata = new MHMetaData(args.metadata) || null,
          mhid = args.metadata.mhid || null,
          altid = args.metadata.altId || null,
          name = args.metadata.name || null,
          primaryImage = (args.primaryImage != null) ? MHObject.create(args.primaryImage) : null,
          primaryGroup = (args.primaryGroup != null && args.primaryGroup !== undefined) ? MHObject.create(args.primaryGroup.object) : null,
          secondaryImage = (args.secondaryImage != null) ? MHObject.create(args.secondaryImage) : null;
      if (args.social) {
        this.social = new MHSocial(args.social);
      }
      if (name) {
        Object.defineProperty(this, 'name', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: name
        });
      }
      if (altid) {
        Object.defineProperty(this, 'altId', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: altid
        });
      }
      if (primaryGroup) {
        Object.defineProperty(this, 'primaryGroup', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: primaryGroup
        });
      }
      if (primaryImage) {
        Object.defineProperty(this, 'primaryImage', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: primaryImage
        });
      }
      if (secondaryImage) {
        Object.defineProperty(this, 'secondaryImage', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: secondaryImage
        });
      }
      Object.defineProperties(this, {
        'mhid': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mhid
        },
        'metadata': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: metadata
        },
        'feed': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'images': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }
      });
    }
    return ($traceurRuntime.createClass)(MHObject, {
      get social() {
        return this[socialSym] || null;
      },
      set social(newSocial) {
        if (newSocial instanceof MHSocial) {
          this[socialSym] = newSocial;
        }
        return this.social;
      },
      get type() {
        return MHObject.isType(this);
      },
      get className() {
        return this.constructor.mhName;
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
        return this.className + " with mhid " + this.mhid + " and name " + this.mhName;
      },
      mergeWithData: function(parsedArgs) {
        if (!this.primaryImage && parsedArgs.primaryImage) {
          var primaryImage = MHObject.create(parsedArgs.primaryImage);
          if (primaryImage) {
            this.primaryImage = primaryImage;
          }
        }
        if (!this.secondaryImage && parsedArgs.secondaryImage) {
          var secondaryImage = MHObject.create(parsedArgs.secondaryImage);
          if (secondaryImage) {
            this.secondaryImage = secondaryImage;
          }
        }
        if (!this.primaryGroup && parsedArgs.primaryGroup) {
          var primaryGroup = MHObject.create(parsedArgs.primaryGroup);
          if (primaryGroup) {
            this.primaryGroup = primaryGroup;
          }
        }
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
        var $__6 = this;
        var path = this.subendpoint('social');
        if (!force && this.social instanceof MHSocial) {
          return Promise.resolve(this.social);
        }
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(((function(parsed) {
          return $__6.social = new MHSocial(parsed);
        })).bind(this)).catch(function(err) {
          console.warn('fetchSocial:', err);
        });
      },
      fetchFeed: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('feed');
        if (force || this.feed === null || this.feed.numberOfElements !== size) {
          this.feed = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.feed;
      },
      fetchFeedPage: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        return this.fetchFeed(view, size, force).currentPromise;
      },
      fetchImages: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('images');
        if (force || this.images === null) {
          this.images = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.images;
      },
      takeAction: function(action) {
        var $__6 = this;
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
          var newSocial = new MHSocial(socialRes.social);
          if ($__6[lastSocialRequestIdSym] === requestId) {
            self.social = newSocial;
          }
          return newSocial;
        })).catch((function(err) {
          if ($__6[lastSocialRequestIdSym] === requestId) {
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
        var saveToLRU = arguments[1] !== (void 0) ? arguments[1] : true;
        if (args instanceof Array) {
          log('trying to create MHObject that is new: ' + args);
          return args.map(function(value) {
            try {
              return MHObject.create(value);
            } catch (e) {
              error(e);
              return value;
            }
          });
        }
        try {
          if (args.mhid && args.metadata === undefined) {
            args.metadata = {
              "mhid": args.mhid,
              "altId": args.altId,
              "name": args.name
            };
          }
          args = MHObject.parseArgs(args);
          var mhid = args.metadata.mhid || args.mhid || undefined;
          var mhObj;
          if (mhid !== 'undefined' && mhid !== null && args instanceof Object && this.isEmpty(args) !== 0) {
            args.mhid = mhid;
            if (mhidLRU.has(args.metadata.mhid) || mhidLRU.has(args.mhid)) {
              log('getting from cache in create: ' + args.metadata.mhid);
              var foundObject = mhidLRU.get(args.metadata.mhid);
              if (foundObject) {
                foundObject.mergeWithData(args);
              }
              return foundObject;
            }
            var prefix = MHObject.getPrefixFromMhid(mhid);
            log(prefix, new childrenConstructors[prefix](args));
            mhObj = new childrenConstructors[prefix](args);
            if (saveToLRU) {
              mhidLRU.putMHObj(mhObj);
            }
            return mhObj;
          } else {
            mhObj = args;
            return mhObj;
          }
        } catch (err) {
          console.log(err);
          if (err instanceof TypeError) {
            if (err.message === 'undefined is not a function') {
              warn('Unknown mhid prefix, see args object: ', args);
            }
            if (err.message === 'Args was object without mhid!') {}
          }
          return null;
        }
        return null;
      },
      createFromArray: function(arr) {
        if (Array.isArray(arr)) {
          return arr.map((function(v) {
            try {
              return MHObject.create(v);
            } catch (e) {
              return v;
            }
          }));
        } else if (arr && arr.length > 0) {
          var i = 0,
              len = arr.length,
              newArry = [];
          for (; i < len; i++) {
            newArry.push(MHObject.create(arr[i]));
          }
          return newArry;
        }
        return arr;
      },
      registerConstructor: function(mhClass, mhName) {
        mhClass.mhName = mhName;
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
      isEmpty: function(obj) {
        return Object.keys(obj).length;
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
        var pfx = MHObject.getPrefixFromMhid(mhid);
        if (childrenConstructors[pfx]) {
          return childrenConstructors[pfx].mhName;
        }
        return null;
      },
      get mhidPrefix() {
        return null;
      },
      isMedia: function(toCheck) {
        return toCheck instanceof System.get('models/media/MHMedia.js').MHMedia;
      },
      isContributor: function(toCheck) {
        return toCheck instanceof System.get('models/contributor/MHContributor.js').MHContributor;
      },
      isAction: function(toCheck) {
        return toCheck instanceof System.get('models/action/MHAction.js').MHAction;
      },
      isUser: function(toCheck) {
        return toCheck instanceof System.get('models/user/MHUser.js').MHUser;
      },
      isCollection: function(toCheck) {
        return toCheck instanceof System.get('models/collection/MHCollection.js').MHCollection;
      },
      isImage: function(toCheck) {
        return toCheck instanceof System.get('models/image/MHImage.js').MHImage;
      },
      isTrait: function(toCheck) {
        return toCheck instanceof System.get('models/trait/MHTrait.js').MHTrait;
      },
      isSource: function(toCheck) {
        return toCheck instanceof System.get('models/source/MHSource.js').MHSource;
      },
      isType: function(obj) {
        var type = '';
        if (MHObject.isAction(obj)) {
          type = 'MHAction';
        } else if (MHObject.isMedia(obj)) {
          type = 'MHMedia';
        } else if (MHObject.isImage(obj)) {
          type = 'MHImage';
        } else if (MHObject.isCollection(obj)) {
          type = 'MHCollection';
        } else if (MHObject.isUser(obj)) {
          type = 'MHUser';
        } else if (MHObject.isContributor(obj)) {
          type = 'MHContributor';
        } else if (MHObject.isSource(obj)) {
          type = 'MHSource';
        } else if (MHObject.isTrait(obj)) {
          type = 'MHTrait';
        } else {
          type = null;
        }
        return type;
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
        log('in fetchByMhid, looking for: ', mhid, 'with view = ', view);
        if (!force && mhidLRU.has(mhid)) {
          return Promise.resolve(mhidLRU.get(mhid));
        }
        if (!force && mhidLRU.hasAltId(mhid)) {
          return Promise.resolve(mhidLRU.getByAltId(mhid));
        }
        var prefix = MHObject.getPrefixFromMhid(mhid),
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
          newObj = MHObject.create(response);
          return newObj;
        });
      },
      fetchByMhids: function(mhids) {
        var view = arguments[1] !== (void 0) ? arguments[1] : "basic";
        if (mhids.map) {
          return mhids.map(MHObject.fetchByMhid);
        } else if (mhids.length > 0) {
          var i,
              mhObjs = [];
          for (i = 0; i < mhids.length; i++) {
            mhObjs.push(MHObject.fetchByMhid(mhids[i], view));
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
        var prefix = MHObject.getPrefixFromMhid(mhid),
            mhClass = childrenConstructors[prefix];
        if (prefix === null || typeof mhClass === 'undefined') {
          warn('Error in MHObject.rootEndpointForMhid', mhid, prefix, mhClass);
          throw new Error('Could not find correct class, unknown mhid: ' + mhid);
        }
        return mhClass.rootEndpoint;
      }
    });
  }());
  return {
    get mhidLRU() {
      return mhidLRU;
    },
    get MHObject() {
      return MHObject;
    }
  };
});
System.registerModule("models/action/MHAction.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHAction.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = (function($__super) {
    function MHAction(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAction).call(this, args);
      var message = args.metadata.message || null,
          primaryOwner = (args.primaryOwner != null) ? MHObject.create(args.primaryOwner) : null,
          primaryMention = (args.primaryMention != null) ? MHObject.create(args.primaryMention) : null;
      if (message) {
        Object.defineProperty(this, 'message', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: message
        });
      }
      Object.defineProperties(this, {
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
    }
    return ($traceurRuntime.createClass)(MHAction, {toString: function() {
        return $traceurRuntime.superGet(this, MHAction.prototype, "toString").call(this);
      }}, {get rootEndpoint() {
        return 'graph/action';
      }}, $__super);
  }(MHObject));
  return {get MHAction() {
      return MHAction;
    }};
});
System.registerModule("models/action/MHAdd.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHAdd.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHAdd = (function($__super) {
    function MHAdd(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAdd).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHAdd, {toString: function() {
        return $traceurRuntime.superGet(this, MHAdd.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhadd';
      }}, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHAdd, 'MHAdd');
  })();
  return {get MHAdd() {
      return MHAdd;
    }};
});
System.registerModule("models/action/MHComment.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHComment.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHComment = (function($__super) {
    function MHComment(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHComment).call(this, args);
      Object.defineProperties(this, {'parentPromise': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }});
    }
    return ($traceurRuntime.createClass)(MHComment, {
      toString: function() {
        return $traceurRuntime.superGet(this, MHComment.prototype, "toString").call(this);
      },
      fetchParentAction: function() {
        var force = arguments[0] !== (void 0) ? arguments[0] : false;
        var $__3 = this;
        var path = this.subendpoint('parent');
        if (force || this.parentPromise === null) {
          this.parentPromise = houndRequest({
            method: 'GET',
            endpoint: path
          }).catch(((function(err) {
            $__3.parentPromise = null;
            throw err;
          })).bind(this));
        }
        return this.parentPromise;
      }
    }, {get mhidPrefix() {
        return 'mhcmt';
      }}, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHComment, 'MHComment');
  })();
  return {get MHComment() {
      return MHComment;
    }};
});
System.registerModule("models/action/MHCreate.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHCreate.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHCreate = (function($__super) {
    function MHCreate(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHCreate).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHCreate, {toString: function() {
        return $traceurRuntime.superGet(this, MHCreate.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhcrt';
      }}, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHCreate, 'MHCreate');
  })();
  return {get MHCreate() {
      return MHCreate;
    }};
});
System.registerModule("models/action/MHFollow.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHFollow.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHFollow = (function($__super) {
    function MHFollow(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHFollow).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHFollow, {toString: function() {
        return $traceurRuntime.superGet(this, MHFollow.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhflw';
      }}, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHFollow, 'MHFollow');
  })();
  return {get MHFollow() {
      return MHFollow;
    }};
});
System.registerModule("models/action/MHHashtag.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHHashtag.js";
  var $__0 = System.get("models/base/MHObject.js"),
      MHObject = $__0.MHObject,
      mhidLRU = $__0.mhidLRU;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHHashtag = (function($__super) {
    function MHHashtag(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHHashtag).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHHashtag, {toString: function() {
        return $traceurRuntime.superGet(this, MHHashtag.prototype, "toString").call(this);
      }}, {
      get rootEndpoint() {
        return 'graph/hashtag';
      },
      get mhidPrefix() {
        return 'mhhtg';
      },
      fetchByTag: function(tag) {
        var view = arguments[1] !== (void 0) ? arguments[1] : 'basic';
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        if (!tag || (typeof tag !== 'string' && !(tag instanceof String))) {
          throw new TypeError('Hashtag not of type String in fetchByTag');
        }
        if (MHObject.getPrefixFromMhid(tag) != null) {
          throw new TypeError('Passed mhid to fetchByTag, please use MHObject.fetchByMhid for this request.');
        }
        if (view === null || view === undefined) {
          view = 'basic';
        }
        console.log('in fetchByTag, looking for: ' + tag);
        if (!force && mhidLRU.hasAltId(tag)) {
          return Promise.resolve(mhidLRU.getByAltId(tag));
        }
        var path = MHHashtag.rootEndpoint + '/lookup/' + tag,
            newObj;
        return houndRequest({
          method: 'GET',
          endpoint: path,
          withCredentials: true
        }).then(function(response) {
          newObj = MHObject.create(response);
          mhidLRU.putMHObj(newObj);
          return newObj;
        });
      }
    }, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHHashtag, 'MHHashtag');
  })();
  return {get MHHashtag() {
      return MHHashtag;
    }};
});
System.registerModule("models/action/MHLike.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHLike.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHLike = (function($__super) {
    function MHLike(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHLike).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHLike, {toString: function() {
        return $traceurRuntime.superGet(this, MHLike.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhlke';
      }}, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHLike, 'MHLike');
  })();
  return {get MHLike() {
      return MHLike;
    }};
});
System.registerModule("models/action/MHPost.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHPost.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHPost = (function($__super) {
    function MHPost(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHPost).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHPost, {toString: function() {
        return $traceurRuntime.superGet(this, MHPost.prototype, "toString").call(this);
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
        var path = MHPost.rootEndpoint + '/new',
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
    }, $__super);
  }(MHAction));
  (function() {
    MHObject.registerConstructor(MHPost, 'MHPost');
  })();
  return {get MHPost() {
      return MHPost;
    }};
});
System.registerModule("models/meta/MHContext.js", [], function() {
  "use strict";
  var __moduleName = "models/meta/MHContext.js";
  var MHContext = (function() {
    function MHContext(args) {
      if (args === undefined) {
        return ;
      }
      var connected = args.connected || null,
          preference = args.preference || null,
          mediums = args.mediums || null,
          position = null,
          target = args.target || null,
          relationships = args.relationships || null;
      if (args.sorting) {
        position = args.sorting.position || args.sorting.importance || null;
      }
      if (position != null) {
        Object.defineProperty(this, 'position', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: position
        });
      }
      if (connected) {
        Object.defineProperty(this, 'connected', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: connected
        });
      }
      if (preference) {
        Object.defineProperty(this, 'preference', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: preference
        });
      }
      if (mediums) {
        Object.defineProperty(this, 'mediums', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mediums
        });
      }
      if (relationships) {
        Object.defineProperty(this, 'relationships', {
          configurable: false,
          enumerable: true,
          writable: false,
          value: relationships
        });
      }
      Object.defineProperty(this, 'target', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: target
      });
    }
    return ($traceurRuntime.createClass)(MHContext, {}, {});
  }());
  return {get MHContext() {
      return MHContext;
    }};
});
System.registerModule("models/base/MHRelationalPair.js", [], function() {
  "use strict";
  var __moduleName = "models/base/MHRelationalPair.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContext = System.get("models/meta/MHContext.js").MHContext;
  var MHRelationalPair = (function() {
    function MHRelationalPair(args) {
      var context,
          object;
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
      if (args.context) {
        args.context.target = args.object.metadata.mhid;
        context = new MHContext(args.context);
      } else {
        args.context = {};
        args.context.target = args.object.metadata.mhid;
        context = new MHContext(args.context);
      }
      object = MHObject.create(args.object) || null;
      if (context == null || object == null) {
        console.warn('Either context or object was not defined in MHRelationalPair', 'MHRelationalPair.js', 23);
      }
      Object.defineProperties(this, {
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
    }
    return ($traceurRuntime.createClass)(MHRelationalPair, {toString: function() {
        return this.object.name + ' at position ' + this.position;
      }}, {createFromArray: function(arr) {
        if (Array.isArray(arr)) {
          return arr.map((function(v) {
            try {
              return new MHRelationalPair(v);
            } catch (e) {
              console.log(e);
              return v;
            }
          }));
        } else if (arr && arr.length > 0) {
          var i = 0,
              len = arr.length,
              newArry = [];
          for (; i < len; i++) {
            newArry.push(new MHRelationalPair(arr[i]));
          }
          return newArry;
        }
        return arr;
      }});
  }());
  return {get MHRelationalPair() {
      return MHRelationalPair;
    }};
});
System.registerModule("models/user/MHUser.js", [], function() {
  "use strict";
  var __moduleName = "models/user/MHUser.js";
  var log = System.get("models/internal/debug-helpers.js").log;
  var $__1 = System.get("models/base/MHObject.js"),
      MHObject = $__1.MHObject,
      mhidLRU = $__1.mhidLRU;
  var MHRelationalPair = System.get("models/base/MHRelationalPair.js").MHRelationalPair;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHUser = (function($__super) {
    function MHUser(args) {
      args = MHObject.parseArgs(args);
      if (typeof args.metadata.username === 'undefined' || args.metadata.username === null) {
        throw new TypeError('Username is null or undefined', 'MHUser.js', 39);
      }
      $traceurRuntime.superConstructor(MHUser).call(this, args);
      var username = args.metadata.username,
          email = args.metadata.email || null,
          firstname = args.metadata.firstname || args.metadata.firstName || null,
          lastname = args.metadata.lastname || args.metadata.lastName || null;
      if (firstname == null || lastname == null) {
        var regex = new RegExp('((?:[a-z][a-z]+))(\\s+)((?:[a-z][a-z]+))', ["i"]);
        var test = regex.exec(args.metadata.name);
        if (test != null) {
          firstname = test[1];
          lastname = test[3];
        }
      }
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
        'interestFeed': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'ownedCollections': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'followed': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'suggested': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }
      });
    }
    return ($traceurRuntime.createClass)(MHUser, {
      get isCurrentUser() {
        var currentUser = System.get('models/user/MHLoginSession.js').MHLoginSession.currentUser;
        return this.isEqualToMHObject(currentUser);
      },
      setPassword: function(password, newPassword) {
        if (!password || (typeof password !== 'string' && !(password instanceof String))) {
          throw new TypeError('password must be type string in MHUser.newPassword');
        }
        if (!newPassword || (typeof newPassword !== 'string' && !(newPassword instanceof String))) {
          throw new TypeError('newPassword must be type string in MHUser.newPassword');
        }
        var path = this.subendpoint('updatePassword');
        return houndRequest({
          method: 'POST',
          endpoint: path,
          withCredentials: true,
          data: {
            oldPassword: password,
            newPassword: newPassword
          }
        }).then(function(response) {
          console.log('valid password: ', response);
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
        var path = this.subendpoint('uploadImage'),
            form = new FormData();
        form.append('data', image);
        log('path: ', path, 'image: ', image, 'form: ', form);
        return houndRequest({
          method: 'POST',
          endpoint: path,
          withCredentials: true,
          data: form
        }).then(function(primaryImage) {
          return primaryImage;
        });
      },
      fetchInterestFeed: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('interestFeed');
        if (force || this.interestFeed === null) {
          this.interestFeed = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.interestFeed;
      },
      fetchOwnedCollections: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('ownedCollections');
        if (force || this.ownedCollections === null) {
          this.ownedCollections = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.ownedCollections;
      },
      fetchSuggested: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('suggested');
        if (force || this.suggested === null) {
          this.suggested = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.suggested;
      },
      fetchFollowed: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('following');
        if (force || this.following === null) {
          this.following = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        console.log(this.following);
        return this.following;
      },
      fetchServiceSettings: function(serv) {
        var service = serv || null;
        var path = this.subendpoint('settings');
        if (service === null) {
          console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
          return false;
        }
        return houndRequest({
          method: 'GET',
          endpoint: path + '/' + service,
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).catch(function(response) {
          console.error(response);
        }).then(function(response) {
          if (response === undefined) {
            return 500;
          } else {
            return response;
          }
        });
      },
      fetchTwitterFollowers: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('settings') + '/twitter/friends';
        if (force || this.twitterFollowers === null) {
          this.twitterFollowers = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.twitterFollowers;
      },
      fetchFacebookFriends: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('settings') + '/facebook/friends';
        if (force || this.facebookFriends === null) {
          this.facebookFriends = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.facebookFriends;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHUser.prototype, "toString").call(this) + ' and username ' + this.username;
      }
    }, {
      get mhidPrefix() {
        return 'mhusr';
      },
      get rootEndpoint() {
        return 'graph/user';
      },
      registerNewUser: function(username, password, email, firstName, lastName, optional) {
        var path = MHUser.rootEndpoint + '/new',
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
          return parsed.metadata;
        });
      },
      fetchSettings: function(mhid) {
        if (!mhid || (typeof mhid !== 'string' && !(mhid instanceof String))) {
          throw new TypeError('mhid must be type string in MHUser.fetchSettings');
        }
        var path = MHUser.rootEndpoint + '/' + mhid + '/settings/internal';
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
      fetchSourceSettings: function(mhid) {
        if (!mhid || (typeof mhid !== 'string' && !(mhid instanceof String))) {
          throw new TypeError('mhid must be type string in MHUser.fetchSourceSettings');
        }
        var path = MHUser.rootEndpoint + '/' + mhid + '/settings/sources';
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function(response) {
          response = MHRelationalPair.createFromArray(response.content);
          console.log('valid settings response: ', response);
          return response;
        }).catch(function(error) {
          console.log('error in fetchSourceSettings: ', error.error.message);
          console.error(error.error.stack);
          return false;
        });
      },
      updateSettings: function(mhid, updates) {
        if (updates == null || typeof updates === 'string' || Array.isArray(updates)) {
          throw new TypeError('Update data parameter must be of type object');
        }
        if (updates.operation == null || updates.property == null || updates.value == null) {
          throw new TypeError('Updates must include operation, property, and value as parameters.');
        }
        var path = MHUser.rootEndpoint + '/' + mhid + '/settings/internal/update';
        console.log(path, updates);
        return houndRequest({
          method: 'PUT',
          endpoint: path,
          withCredentials: true,
          data: updates
        }).catch(function(err) {
          console.log('error on profile update: ', err);
          throw err;
        });
      },
      validateUsername: function(username) {
        if (!username || (typeof username !== 'string' && !(username instanceof String))) {
          throw new TypeError('Username must be type string in MHUser.validateUsername');
        }
        var path = MHUser.rootEndpoint + '/validate/username/' + encodeURIComponent(username);
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function(response) {
          return response;
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
        var path = MHUser.rootEndpoint + '/validate/email/' + encodeURIComponent(email);
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function(response) {
          return response;
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
        var path = MHUser.rootEndpoint + '/forgotusername',
            data = {};
        data.email = email;
        return houndRequest({
          method: 'POST',
          endpoint: path,
          withCredentials: false,
          data: data
        }).then(function(response) {
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
        var path = MHUser.rootEndpoint + '/forgotpassword',
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
        var path = MHUser.rootEndpoint + '/forgotpassword',
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
        var path = MHUser.rootEndpoint + '/forgotpassword/finish',
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
        var path = MHUser.rootEndpoint + '/lookup/' + username,
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
        var path = MHUser.rootEndpoint + '/featured';
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function(response) {
          return Promise.all(MHObject.fetchByMhids(response));
        });
      },
      linkService: function(serv, succ, fail) {
        var service = serv || null,
            success = succ || 'https://www.mediahound.com/',
            failure = fail || 'https://www.mediahound.com/';
        if (service === null) {
          console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
          return false;
        }
        return houndRequest({
          method: 'GET',
          endpoint: MHUser.rootEndpoint + '/account/' + service + '/link?successRedirectUrl=' + success + '&failureRedirectUrl=' + failure,
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          console.log(response);
          return response;
        });
      },
      unlinkService: function(serv) {
        var service = serv || null;
        if (service === null) {
          console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
          return false;
        }
        return houndRequest({
          method: 'GET',
          endpoint: MHUser.rootEndpoint + '/account/' + service + '/unlink',
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          console.log(response);
          return response;
        });
      }
    }, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHUser, 'MHUser');
  })();
  return {get MHUser() {
      return MHUser;
    }};
});
System.registerModule("models/user/MHLoginSession.js", [], function() {
  "use strict";
  var __moduleName = "models/user/MHLoginSession.js";
  var $__0 = System.get("models/internal/debug-helpers.js"),
      log = $__0.log,
      warn = $__0.warn,
      error = $__0.error;
  var $__1 = System.get("models/base/MHObject.js"),
      MHObject = $__1.MHObject,
      mhidLRU = $__1.mhidLRU;
  var MHUser = System.get("models/user/MHUser.js").MHUser;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
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
  var MHUserLoginEvent = (function() {
    function MHUserLoginEvent() {}
    return ($traceurRuntime.createClass)(MHUserLoginEvent, {}, {create: function(mhUserObj) {
        return makeEvent('mhUserLogin', {
          bubbles: false,
          cancelable: false,
          detail: {mhUser: mhUserObj}
        });
      }});
  }());
  var MHUserLogoutEvent = (function() {
    function MHUserLogoutEvent() {}
    return ($traceurRuntime.createClass)(MHUserLogoutEvent, {}, {create: function(mhUserObj) {
        return makeEvent('mhUserLogout', {
          bubbles: false,
          cancelable: false,
          detail: {mhUser: mhUserObj}
        });
      }});
  }());
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
  var MHLoginSession = (function() {
    function MHLoginSession() {}
    return ($traceurRuntime.createClass)(MHLoginSession, {}, {
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
          if (!loginMap.Error) {
            return MHObject.fetchByMhid(loginMap.mhid).then(function(mhUser) {
              return [loginMap, mhUser];
            });
          } else {
            throw new Error(loginMap.Error);
          }
        })).then((function(mhUserMap) {
          if (mhUserMap[0].access === false) {
            mhUserMap[1].settings = {
              onboarded: mhUserMap[0].onboarded,
              access: mhUserMap[0].access
            };
            return mhUserMap[1];
          } else {
            return MHUser.fetchSettings(mhUserMap[1].mhid).then(function(settings) {
              mhUserMap[1].settings = settings;
              return mhUserMap[1];
            });
          }
        })).then((function(user) {
          access = user.access = user.settings.access;
          onboarded = user.onboarded = user.settings.onboarded;
          loggedInUser = user;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.currentUser = JSON.stringify(loggedInUser);
          }
          log('logging in:', loggedInUser);
          return loggedInUser;
        })).catch(function(error) {
          throw new Error(error);
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
        if (typeof window !== undefined) {
          window.dispatchEvent(MHUserLogoutEvent.create(loggedInUser));
        }
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
          if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined' && restoreFromSessionStorage()) {
            var cachedUser = JSON.parse(window.sessionStorage.currentUser);
            if (cachedUser.mhid === loginMap.users[0].metadata.mhid || cachedUser.mhid === loginMap.users[0].mhid) {
              access = cachedUser.settings.access;
              onboarded = cachedUser.settings.onboarded;
              return MHObject.create(loginMap.users[0]);
            }
          } else {
            return MHObject.create(loginMap.users[0]);
          }
        })).then(function(user) {
          loggedInUser = user;
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
  }());
  return {get MHLoginSession() {
      return MHLoginSession;
    }};
});
System.registerModule("models/collection/MHCollection.js", [], function() {
  "use strict";
  var __moduleName = "models/collection/MHCollection.js";
  var log = System.get("models/internal/debug-helpers.js").log;
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHLoginSession = System.get("models/user/MHLoginSession.js").MHLoginSession;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHCollection = (function($__super) {
    function MHCollection(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHCollection).call(this, args);
      var mixlist = (typeof args.metadata.mixlist === 'string') ? args.metadata.mixlist.toLowerCase() : null,
          firstContentImage = (args.firstContentImage != null) ? MHObject.create(args.firstContentImage) : null,
          primaryOwner = (args.primaryOwner != null) ? MHObject.create(args.primaryOwner) : null,
          description = args.metadata.description || null;
      switch (mixlist) {
        case 'none':
          mixlist = MHCollection.MIXLIST_TYPE_NONE;
          break;
        case 'partial':
          mixlist = MHCollection.MIXLIST_TYPE_PARTIAL;
          break;
        case 'full':
          mixlist = MHCollection.MIXLIST_TYPE_FULL;
          break;
        default:
          mixlist = MHCollection.MIXLIST_TYPE_NONE;
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
          writable: true,
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
          writable: true,
          value: primaryOwner
        },
        'ownersPromise': {
          configurable: false,
          enumerable: true,
          writable: true,
          value: null
        },
        'content': {
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
    }
    return ($traceurRuntime.createClass)(MHCollection, {
      get mixlistTypeString() {
        switch (this.mixlist) {
          case MHCollection.MIXLIST_TYPE_NONE:
            return 'none';
          case MHCollection.MIXLIST_TYPE_PARTIAL:
            return 'partial';
          case MHCollection.MIXLIST_TYPE_FULL:
            return 'full';
          default:
            return 'none';
        }
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHCollection.prototype, "toString").call(this) + ' and description ' + this.description;
      },
      mergeWithData: function(parsedArgs) {
        $traceurRuntime.superGet(this, MHCollection.prototype, "mergeWithData").call(this, parsedArgs);
        if (!this.firstContentImage && parsedArgs.firstContentImage) {
          var firstContentImage = MHObject.create(parsedArgs.firstContentImage);
          if (firstContentImage) {
            this.firstContentImage = firstContentImage;
          }
        }
        if (!this.primaryOwner && parsedArgs.primaryOwner) {
          var primaryOwner = MHObject.create(parsedArgs.primaryOwner);
          if (primaryOwner) {
            this.primaryOwner = primaryOwner;
          }
        }
      },
      editMetaData: function(name, description) {
        var path = this.subendpoint('update'),
            data = {};
        if (description) {
          data = {
            "name": name,
            "description": description
          };
        } else if (name) {
          data = {"name": name};
        }
        return houndRequest({
          method: 'PUT',
          endpoint: path,
          data: data
        }).then(function(response) {
          return MHObject.fetchByMhid(response.metadata.mhid);
        }).then(function(newCollection) {
          if (MHLoginSession.openSession) {
            MHLoginSession.currentUser.fetchOwnedCollections("full", 12, true);
          }
          return newCollection;
        });
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
        var $__6 = this;
        if (!Array.isArray(contents)) {
          throw new TypeError('Contents must be an array in changeContents');
        }
        if (typeof sub !== 'string' || (sub !== 'add' && sub !== 'remove')) {
          throw new TypeError('Subendpoint must be add or remove');
        }
        var path = this.subendpoint(sub),
            mhids = contents.map((function(v) {
              if (v instanceof MHObject) {
                if (!(v instanceof MHAction)) {
                  return v.mhid;
                } else {
                  console.error('MHActions including like, favorite, create, and post cannot be collected. Please resubmit with actual content.');
                }
              } else if (typeof v === 'string' && MHObject.prefixes.indexOf(MHObject.getPrefixFromMhid(v)) > -1) {
                return v;
              }
              return null;
            })).filter((function(v) {
              return v !== null;
            }));
        this.mixlistPromise = null;
        if (mhids.length > -1) {
          log('content array to be submitted: ', mhids);
          return (this.content = houndRequest({
            method: 'PUT',
            endpoint: path,
            data: {'content': mhids}
          }).catch(((function(err) {
            $__6.content = null;
            throw err;
          })).bind(this)).then(function(response) {
            contents.forEach((function(v) {
              return typeof v.fetchSocial === 'function' && v.fetchSocial(true);
            }));
            return response;
          }));
        } else {
          console.error('To add or remove content from a Collection the content array must include at least one MHObject');
        }
      },
      fetchOwners: function() {
        var force = arguments[0] !== (void 0) ? arguments[0] : false;
        var $__6 = this;
        var path = this.subendpoint('owners');
        if (force || this.ownersPromise === null) {
          this.ownersPromise = houndRequest({
            method: 'GET',
            endpoint: path
          }).catch(((function(err) {
            $__6.ownersPromise = null;
            throw err;
          })).bind(this));
        }
        return this.ownersPromise;
      },
      fetchContent: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('content');
        if (force || this.content === null) {
          this.content = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.content;
      },
      fetchMixlist: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('mixlist');
        if (force || this.mixlistPromise === null) {
          this.mixlistPromise = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
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
      createWithName: function(name, description) {
        var path = MHCollection.rootEndpoint + '/new',
            data = {};
        if (description) {
          data = {
            "name": name,
            "description": description
          };
        } else if (name) {
          data = {"name": name};
        }
        return houndRequest({
          method: 'POST',
          endpoint: path,
          data: data
        }).then(function(response) {
          return MHObject.fetchByMhid(response.metadata.mhid);
        }).then(function(newCollection) {
          if (MHLoginSession.openSession) {
            MHLoginSession.currentUser.fetchOwnedCollections("full", 12, true);
          }
          return newCollection;
        });
      },
      fetchFeaturedCollections: function() {
        var path = MHCollection.rootEndpoint + '/featured';
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then((function(res) {
          return Promise.all(MHObject.fetchByMhids(res));
        }));
      }
    }, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHCollection, 'MHCollection');
  })();
  return {get MHCollection() {
      return MHCollection;
    }};
});
System.registerModule("models/contributor/MHContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHContributor = (function($__super) {
    function MHContributor(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHContributor).call(this, args);
      Object.defineProperties(this, {
        'media': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'collections': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }
      });
    }
    return ($traceurRuntime.createClass)(MHContributor, {
      get isGroup() {
        return !this.isIndividual;
      },
      get isFictional() {
        return !this.isReal;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHContributor.prototype, "toString").call(this);
      },
      fetchMedia: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('media');
        if (force || this.media === null) {
          this.media = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.media;
      },
      fetchCollections: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('collections');
        if (force || this.collections === null) {
          this.collections = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.collections;
      }
    }, {get rootEndpoint() {
        if (this.prototype.isFictional && this.prototype.isReal != null) {
          return 'graph/character';
        }
        return 'graph/contributor';
      }}, $__super);
  }(MHObject));
  return {get MHContributor() {
      return MHContributor;
    }};
});
System.registerModule("models/contributor/MHFictionalGroupContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHFictionalGroupContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHFictionalGroupContributor = (function($__super) {
    function MHFictionalGroupContributor(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHFictionalGroupContributor).call(this, args);
      Object.defineProperties(this, {'contributorsPromise': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }});
    }
    return ($traceurRuntime.createClass)(MHFictionalGroupContributor, {
      get isIndividual() {
        return false;
      },
      get isReal() {
        return false;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHFictionalGroupContributor.prototype, "toString").call(this);
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
        var force = arguments[1] !== (void 0) ? arguments[1] : false;
        var $__3 = this;
        var path = this.subendpoint('contributors');
        if (force || this.contributorsPromise === null) {
          this.contributorsPromise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: {'view': view}
          }).catch(((function(err) {
            $__3.contributorsPromise = null;
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
      }}, $__super);
  }(MHContributor));
  (function() {
    MHObject.registerConstructor(MHFictionalGroupContributor, 'MHFictionalGroupContributor');
  }());
  return {get MHFictionalGroupContributor() {
      return MHFictionalGroupContributor;
    }};
});
System.registerModule("models/contributor/MHFictionalIndividualContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHFictionalIndividualContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHFictionalIndividualContributor = (function($__super) {
    function MHFictionalIndividualContributor(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHFictionalIndividualContributor).call(this, args);
      Object.defineProperties(this, {'contributorsPromise': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }});
    }
    return ($traceurRuntime.createClass)(MHFictionalIndividualContributor, {
      get isIndividual() {
        return true;
      },
      get isReal() {
        return false;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHFictionalIndividualContributor.prototype, "toString").call(this);
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
        var force = arguments[1] !== (void 0) ? arguments[1] : false;
        var $__3 = this;
        var path = this.subendpoint('contributors');
        if (force || this.contributorsPromise === null) {
          this.contributorsPromise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: {'view': view}
          }).catch(((function(err) {
            $__3.contributorsPromise = null;
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
      }}, $__super);
  }(MHContributor));
  (function() {
    MHObject.registerConstructor(MHFictionalIndividualContributor, 'MHFictionalIndividualContributor');
  }());
  return {get MHFictionalIndividualContributor() {
      return MHFictionalIndividualContributor;
    }};
});
System.registerModule("models/contributor/MHRealGroupContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHRealGroupContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHRealGroupContributor = (function($__super) {
    function MHRealGroupContributor(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHRealGroupContributor).call(this, args);
      Object.defineProperties(this, {'charactersPromise': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }});
    }
    return ($traceurRuntime.createClass)(MHRealGroupContributor, {
      get isIndividual() {
        return false;
      },
      get isReal() {
        return true;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHRealGroupContributor.prototype, "toString").call(this);
      },
      fetchCharacters: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'ids';
        var force = arguments[1] !== (void 0) ? arguments[1] : false;
        var $__3 = this;
        var path = this.subendpoint('characters');
        if (force || this.charactersPromise === null) {
          this.charactersPromise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: {'view': view}
          }).catch(((function(err) {
            $__3.charactersPromise = null;
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
      }}, $__super);
  }(MHContributor));
  (function() {
    MHObject.registerConstructor(MHRealGroupContributor, 'MHRealGroupContributor');
  }());
  return {get MHRealGroupContributor() {
      return MHRealGroupContributor;
    }};
});
System.registerModule("models/contributor/MHRealIndividualContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHRealIndividualContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHRealIndividualContributor = (function($__super) {
    function MHRealIndividualContributor(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHRealIndividualContributor).call(this, args);
      Object.defineProperties(this, {'characters': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }});
    }
    return ($traceurRuntime.createClass)(MHRealIndividualContributor, {
      get isIndividual() {
        return true;
      },
      get isReal() {
        return true;
      },
      toString: function() {
        return $traceurRuntime.superGet(this, MHRealIndividualContributor.prototype, "toString").call(this);
      },
      fetchCharacters: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('characters');
        if (force || this.characters === null) {
          this.characters = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.characters;
      }
    }, {get mhidPrefix() {
        return 'mhric';
      }}, $__super);
  }(MHContributor));
  (function() {
    MHObject.registerConstructor(MHRealIndividualContributor, 'MHRealIndividualContributor');
  }());
  return {get MHRealIndividualContributor() {
      return MHRealIndividualContributor;
    }};
});
System.registerModule("models/image/MHImage.js", [], function() {
  "use strict";
  var __moduleName = "models/image/MHImage.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHImage = (function($__super) {
    function MHImage(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHImage).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHImage, {}, {
      get mhidPrefix() {
        return 'mhimg';
      },
      get rootEndpoint() {
        return 'graph/image';
      }
    }, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHImage, 'MHImage');
  }());
  return {get MHImage() {
      return MHImage;
    }};
});
System.registerModule("models/source/MHSourceFormat.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceFormat.js";
  var MHSourceFormat = (function() {
    function MHSourceFormat(args) {
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
          timePeriod = args.timePeriod || null,
          contentCount = args.contentCount || null;
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
        'timePeriod': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: timePeriod
        },
        'contentCount': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: contentCount
        },
        'method': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: method
        }
      });
    }
    return ($traceurRuntime.createClass)(MHSourceFormat, {get displayPrice() {
        return '$' + this.price;
      }}, {});
  }());
  return {get MHSourceFormat() {
      return MHSourceFormat;
    }};
});
System.registerModule("models/source/MHSourceMethod.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMethod.js";
  var MHSourceFormat = System.get("models/source/MHSourceFormat.js").MHSourceFormat;
  var MHSourceMethod = (function() {
    function MHSourceMethod(args) {
      var medium = arguments[1] !== (void 0) ? arguments[1] : null;
      var $__1 = this;
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
        return new MHSourceFormat(v, $__1);
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
    }
    return ($traceurRuntime.createClass)(MHSourceMethod, {}, {get TYPES() {
        return ['purchase', 'rental', 'subscription', 'adSupported'];
      }});
  }());
  return {get MHSourceMethod() {
      return MHSourceMethod;
    }};
});
System.registerModule("models/source/MHSourceMedium.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMedium.js";
  var MHSourceMethod = System.get("models/source/MHSourceMethod.js").MHSourceMethod;
  var MHSourceMedium = (function() {
    function MHSourceMedium(args) {
      var source = arguments[1] !== (void 0) ? arguments[1] : null;
      var $__1 = this;
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
        return new MHSourceMethod(v, $__1);
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
    }
    return ($traceurRuntime.createClass)(MHSourceMedium, {}, {get TYPES() {
        return ['stream', 'download', 'deliver', 'pickup', 'attend'];
      }});
  }());
  return {get MHSourceMedium() {
      return MHSourceMedium;
    }};
});
System.registerModule("models/source/MHSourceModel.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceModel.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHSourceMedium = System.get("models/source/MHSourceMedium.js").MHSourceMedium;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var sources;
  var sourcesPromise = null;
  var MHSourceModel = (function() {
    function MHSourceModel(args) {
      var content = arguments[1] !== (void 0) ? arguments[1] : null;
      var $__3 = this;
      if (typeof args === 'string' || args instanceof String) {
        try {
          args = JSON.parse(args);
        } catch (e) {
          throw new TypeError('Args typeof string but not JSON in MHSourceModel', 'MHSourceModel.js', 28);
        }
      }
      var name = args.object.metadata.name || null,
          mediums = args.context.mediums || null;
      if (name === null) {
        console.warn('errored args: ', args);
        throw new TypeError('Name, consumable, or mediums null in args in MHSourceModel');
      }
      if (mediums != null) {
        mediums = mediums.map((function(v) {
          return new MHSourceMedium(v, $__3);
        }));
      }
      Object.defineProperties(this, {
        'name': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: name
        },
        'mediums': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mediums
        },
        'content': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: content
        }
      });
    }
    return ($traceurRuntime.createClass)(MHSourceModel, {getAllFormats: function() {
        var allFormats = [];
        this.mediums.forEach(function(medium) {
          medium.methods.forEach(function(method) {
            allFormats = allFormats.concat(method.formats);
            console.log(allFormats);
          });
        });
        return allFormats;
      }}, {
      fetchAllSources: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : "full";
        var force = arguments[1] !== (void 0) ? arguments[1] : false;
        var path = 'graph/source/all';
        if (force || sourcesPromise === null) {
          sourcesPromise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: {view: view}
          }).then(function(parsed) {
            var content = parsed.content;
            return content.map((function(v) {
              return MHObject.create(v.object);
            }));
          }).then(function(arr) {
            var obj = {};
            arr.forEach(function(source) {
              var name = source.metadata.name;
              obj[name] = source;
            });
            sources = obj;
            return obj;
          });
        }
        return sourcesPromise;
      },
      get sources() {
        return sources;
      }
    });
  }());
  return {get MHSourceModel() {
      return MHSourceModel;
    }};
});
System.registerModule("models/media/MHMedia.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMedia.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHSourceModel = System.get("models/source/MHSourceModel.js").MHSourceModel;
  var MHRelationalPair = System.get("models/base/MHRelationalPair.js").MHRelationalPair;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var MHMedia = (function($__super) {
    function MHMedia(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMedia).call(this, args);
      var keyContributors = (!!args.keyContributors) ? MHRelationalPair.createFromArray(args.keyContributors) : null;
      Object.defineProperties(this, {
        'keyContributors': {
          configurable: false,
          enumerable: true,
          writable: true,
          value: keyContributors
        },
        'collections': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'content': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'sources': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'contributors': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'characters': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'traits': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        },
        'related': {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        }
      });
    }
    return ($traceurRuntime.createClass)(MHMedia, {
      toString: function() {
        return $traceurRuntime.superGet(this, MHMedia.prototype, "toString").call(this) + ' and releaseDate ' + this.releaseDate;
      },
      mergeWithData: function(parsedArgs) {
        $traceurRuntime.superGet(this, MHMedia.prototype, "mergeWithData").call(this, parsedArgs);
        if (!this.keyContributors && parsedArgs.keyContributors) {
          var keyContributors = MHRelationalPair.createFromArray(parsedArgs.keyContributors);
          if (keyContributors) {
            this.keyContributors = keyContributors;
          }
        }
      },
      fetchCollections: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('collections');
        if (force || this.collections === null) {
          this.collections = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.collections;
      },
      fetchContent: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('content');
        if (force || this.content === null) {
          this.content = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.content;
      },
      fetchSources: function() {
        var force = arguments[0] !== (void 0) ? arguments[0] : false;
        var self = this,
            path = this.subendpoint('sources');
        if (MHSourceModel.sources === null || MHSourceModel.sources === undefined) {
          MHSourceModel.fetchAllSources("full", true);
        }
        if (force || this.sources === null) {
          this.sources = houndRequest({
            method: 'GET',
            endpoint: path
          }).catch((function(err) {
            self.sources = null;
            throw err;
          })).then(function(parsed) {
            var content = parsed.content;
            return content.map((function(v) {
              return new MHSourceModel(v, self);
            }));
          });
        }
        return this.sources;
      },
      fetchAvailableSources: function() {
        return this.fetchSources();
      },
      fetchDesiredSource: function() {
        return this.fetchAvailableSources();
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('contributors');
        if (force || this.contributors === null) {
          this.contributors = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.contributors;
      },
      fetchCharacters: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('characters');
        if (force || this.characters === null) {
          this.characters = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.characters;
      },
      fetchTraits: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('traits');
        if (force || this.traits === null) {
          this.traits = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.traits;
      },
      fetchRelated: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('related');
        if (force || this.related === null) {
          this.related = pagedRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        return this.related;
      },
      fetchShortestDistance: function(otherMhid) {
        var path = this.subendpoint('shortestPath/' + otherMhid);
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function(response) {
          return response.paths[0].path.length - 1;
        }).catch(function(err) {
          if (err.xhr.status === 404) {
            return null;
          } else {
            throw err;
          }
        });
      }
    }, {
      get rootEndpoint() {
        return 'graph/media';
      },
      fetchRelatedTo: function(medias) {
        var view = arguments[1] !== (void 0) ? arguments[1] : 'full';
        var size = arguments[2] !== (void 0) ? arguments[2] : 12;
        var mhids = medias.map((function(m) {
          return m.metadata.mhid;
        }));
        var path = this.rootEndpoint + '/related';
        return pagedRequest({
          method: 'GET',
          endpoint: path,
          pageSize: size,
          params: {
            view: view,
            ids: mhids
          }
        });
      }
    }, $__super);
  }(MHObject));
  return {get MHMedia() {
      return MHMedia;
    }};
});
System.registerModule("models/media/MHAlbum.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAlbum.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHAlbum = (function($__super) {
    function MHAlbum(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAlbum).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHAlbum, {toString: function() {
        return $traceurRuntime.superGet(this, MHAlbum.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhalb';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHAlbum, 'MHAlbum');
  })();
  return {get MHAlbum() {
      return MHAlbum;
    }};
});
System.registerModule("models/media/MHAlbumSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAlbumSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHAlbumSeries = (function($__super) {
    function MHAlbumSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAlbumSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHAlbumSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHAlbumSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhals';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHAlbumSeries, 'MHAlbumSeries');
  })();
  return {get MHAlbumSeries() {
      return MHAlbumSeries;
    }};
});
System.registerModule("models/media/MHAnthology.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAnthology.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHAnthology = (function($__super) {
    function MHAnthology(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAnthology).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHAnthology, {toString: function() {
        return $traceurRuntime.superGet(this, MHAnthology.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhath';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHAnthology, 'MHAnthology');
  })();
  return {get MHAnthology() {
      return MHAnthology;
    }};
});
System.registerModule("models/media/MHBook.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHBook.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHBook = (function($__super) {
    function MHBook(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHBook).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHBook, {toString: function() {
        return $traceurRuntime.superGet(this, MHBook.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhbok';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHBook, 'MHBook');
  })();
  return {get MHBook() {
      return MHBook;
    }};
});
System.registerModule("models/media/MHBookSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHBookSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHBookSeries = (function($__super) {
    function MHBookSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHBookSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHBookSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHBookSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhbks';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHBookSeries, 'MHBookSeries');
  })();
  return {get MHBookSeries() {
      return MHBookSeries;
    }};
});
System.registerModule("models/media/MHComicBook.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHComicBook.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHComicBook = (function($__super) {
    function MHComicBook(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHComicBook).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHComicBook, {toString: function() {
        return $traceurRuntime.superGet(this, MHComicBook.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhcbk';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHComicBook, 'MHComicBook');
  })();
  return {get MHComicBook() {
      return MHComicBook;
    }};
});
System.registerModule("models/media/MHComicBookSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHComicBookSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHComicBookSeries = (function($__super) {
    function MHComicBookSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHComicBookSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHComicBookSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHComicBookSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhcbs';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHComicBookSeries, 'MHComicBookSeries');
  })();
  return {get MHComicBookSeries() {
      return MHComicBookSeries;
    }};
});
System.registerModule("models/media/MHGame.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGame.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHGame = (function($__super) {
    function MHGame(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGame).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHGame, {toString: function() {
        return $traceurRuntime.superGet(this, MHGame.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgam';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHGame, 'MHGame');
  })();
  return {get MHGame() {
      return MHGame;
    }};
});
System.registerModule("models/media/MHGameSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGameSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHGameSeries = (function($__super) {
    function MHGameSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGameSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHGameSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHGameSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgms';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHGameSeries, 'MHGameSeries');
  })();
  return {get MHGameSeries() {
      return MHGameSeries;
    }};
});
System.registerModule("models/media/MHGraphicNovel.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGraphicNovel.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHGraphicNovel = (function($__super) {
    function MHGraphicNovel(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGraphicNovel).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHGraphicNovel, {toString: function() {
        return $traceurRuntime.superGet(this, MHGraphicNovel.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgnl';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHGraphicNovel, 'MHGraphicNovel');
  })();
  return {get MHGraphicNovel() {
      return MHGraphicNovel;
    }};
});
System.registerModule("models/media/MHGraphicNovelSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHGraphicNovelSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHGraphicNovelSeries = (function($__super) {
    function MHGraphicNovelSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGraphicNovelSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHGraphicNovelSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHGraphicNovelSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgns';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHGraphicNovelSeries, 'MHGraphicNovelSeries');
  })();
  return {get MHGraphicNovelSeries() {
      return MHGraphicNovelSeries;
    }};
});
System.registerModule("models/media/MHMovie.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMovie.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHMovie = (function($__super) {
    function MHMovie(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMovie).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHMovie, {toString: function() {
        return $traceurRuntime.superGet(this, MHMovie.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhmov';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHMovie, 'MHMovie');
  })();
  return {get MHMovie() {
      return MHMovie;
    }};
});
System.registerModule("models/media/MHMovieSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMovieSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHMovieSeries = (function($__super) {
    function MHMovieSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMovieSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHMovieSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHMovieSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhmvs';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHMovieSeries, 'MHMovieSeries');
  })();
  return {get MHMovieSeries() {
      return MHMovieSeries;
    }};
});
System.registerModule("models/media/MHMusicVideo.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMusicVideo.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHMusicVideo = (function($__super) {
    function MHMusicVideo(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMusicVideo).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHMusicVideo, {toString: function() {
        return $traceurRuntime.superGet(this, MHMusicVideo.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhmsv';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHMusicVideo, 'MHMusicVideo');
  })();
  return {get MHMusicVideo() {
      return MHMusicVideo;
    }};
});
System.registerModule("models/media/MHNovella.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHNovella.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHNovella = (function($__super) {
    function MHNovella(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHNovella).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHNovella, {toString: function() {
        return $traceurRuntime.superGet(this, MHNovella.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhnov';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHNovella, 'MHNovella');
  })();
  return {get MHNovella() {
      return MHNovella;
    }};
});
System.registerModule("models/media/MHPeriodical.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHPeriodical.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHPeriodical = (function($__super) {
    function MHPeriodical(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHPeriodical).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHPeriodical, {toString: function() {
        return $traceurRuntime.superGet(this, MHPeriodical.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhpdc';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHPeriodical, 'MHPeriodical');
  })();
  return {get MHPeriodical() {
      return MHPeriodical;
    }};
});
System.registerModule("models/media/MHPeriodicalSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHPeriodicalSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHPeriodicalSeries = (function($__super) {
    function MHPeriodicalSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHPeriodicalSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHPeriodicalSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHPeriodicalSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhpds';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHPeriodicalSeries, 'MHPeriodicalSeries');
  })();
  return {get MHPeriodicalSeries() {
      return MHPeriodicalSeries;
    }};
});
System.registerModule("models/media/MHShowEpisode.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowEpisode.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHShowEpisode = (function($__super) {
    function MHShowEpisode(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHShowEpisode).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHShowEpisode, {toString: function() {
        return $traceurRuntime.superGet(this, MHShowEpisode.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsep';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHShowEpisode, 'MHShowEpisode');
  })();
  return {get MHShowEpisode() {
      return MHShowEpisode;
    }};
});
System.registerModule("models/media/MHShowSeason.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowSeason.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHShowSeason = (function($__super) {
    function MHShowSeason(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHShowSeason).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHShowSeason, {toString: function() {
        return $traceurRuntime.superGet(this, MHShowSeason.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhssn';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHShowSeason, 'MHShowSeason');
  })();
  return {get MHShowSeason() {
      return MHShowSeason;
    }};
});
System.registerModule("models/media/MHShowSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHShowSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHShowSeries = (function($__super) {
    function MHShowSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHShowSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHShowSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHShowSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsss';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHShowSeries, 'MHShowSeries');
  })();
  return {get MHShowSeries() {
      return MHShowSeries;
    }};
});
System.registerModule("models/media/MHSong.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSong.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHSong = (function($__super) {
    function MHSong(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSong).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHSong, {toString: function() {
        return $traceurRuntime.superGet(this, MHSong.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsng';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHSong, 'MHSong');
  })();
  return {get MHSong() {
      return MHSong;
    }};
});
System.registerModule("models/media/MHSpecial.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSpecial.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHSpecial = (function($__super) {
    function MHSpecial(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSpecial).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHSpecial, {toString: function() {
        return $traceurRuntime.superGet(this, MHSpecial.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhspc';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHSpecial, 'MHSpecial');
  })();
  return {get MHSpecial() {
      return MHSpecial;
    }};
});
System.registerModule("models/media/MHSpecialSeries.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSpecialSeries.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHSpecialSeries = (function($__super) {
    function MHSpecialSeries(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSpecialSeries).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHSpecialSeries, {toString: function() {
        return $traceurRuntime.superGet(this, MHSpecialSeries.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsps';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHSpecialSeries, 'MHSpecialSeries');
  })();
  return {get MHSpecialSeries() {
      return MHSpecialSeries;
    }};
});
System.registerModule("models/media/MHTrailer.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHTrailer.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHTrailer = (function($__super) {
    function MHTrailer(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHTrailer).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHTrailer, {toString: function() {
        return $traceurRuntime.superGet(this, MHTrailer.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhtrl';
      }}, $__super);
  }(MHMedia));
  (function() {
    MHObject.registerConstructor(MHTrailer, 'MHTrailer');
  })();
  return {get MHTrailer() {
      return MHTrailer;
    }};
});
System.registerModule("models/source/MHSource.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSource.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHSource = (function($__super) {
    function MHSource(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSource).call(this, args);
      var mediums = (args.allMediums) ? args.allMediums : null,
          subscriptions = (args.subscriptions) ? args.subscriptions : null;
      if (subscriptions !== null) {
        subscriptions = subscriptions.map((function(v) {
          return MHObject.create(v);
        }));
      }
      Object.defineProperties(this, {
        'mediums': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mediums
        },
        'subscriptions': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: subscriptions
        }
      });
    }
    return ($traceurRuntime.createClass)(MHSource, {toString: function() {
        return $traceurRuntime.superGet(this, MHSource.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsrc';
      }}, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHSource, 'MHSource');
  })();
  return {get MHSource() {
      return MHSource;
    }};
});
System.registerModule("models/source/MHSubscription.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSubscription.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHSubscription = (function($__super) {
    function MHSubscription(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSubscription).call(this, args);
      var mediums = (args.metadata.mediums) ? args.metadata.mediums : null;
      Object.defineProperties(this, {'mediums': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: mediums
        }});
    }
    return ($traceurRuntime.createClass)(MHSubscription, {toString: function() {
        return $traceurRuntime.superGet(this, MHSubscription.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsubtemp';
      }}, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHSubscription, 'MHSubscription');
  })();
  return {get MHSubscription() {
      return MHSubscription;
    }};
});
System.registerModule("models/trait/MHTrait.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTrait.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = (function($__super) {
    function MHTrait(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHTrait).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHTrait, {toString: function() {
        return $traceurRuntime.superGet(this, MHTrait.prototype, "toString").call(this);
      }}, {}, $__super);
  }(MHObject));
  return {get MHTrait() {
      return MHTrait;
    }};
});
System.registerModule("models/trait/MHAchievements.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAchievements.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHAchievements = (function($__super) {
    function MHAchievements(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAchievements).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHAchievements, {toString: function() {
        return $traceurRuntime.superGet(this, MHAchievements.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhach';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHAchievements, 'MHAchievements');
  })();
  return {get MHAchievements() {
      return MHAchievements;
    }};
});
System.registerModule("models/trait/MHAudience.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAudience.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHAudience = (function($__super) {
    function MHAudience(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHAudience).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHAudience, {toString: function() {
        return $traceurRuntime.superGet(this, MHAudience.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhaud';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHAudience, 'MHAudience');
  })();
  return {get MHAudience() {
      return MHAudience;
    }};
});
System.registerModule("models/trait/MHEra.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHEra.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHEra = (function($__super) {
    function MHEra(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHEra).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHEra, {toString: function() {
        return $traceurRuntime.superGet(this, MHEra.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhera';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHEra, 'MHEra');
  })();
  return {get MHEra() {
      return MHEra;
    }};
});
System.registerModule("models/trait/MHFlag.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHFlag.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHFlag = (function($__super) {
    function MHFlag(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHFlag).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHFlag, {toString: function() {
        return $traceurRuntime.superGet(this, MHFlag.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhflg';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHFlag, 'MHFlag');
  })();
  return {get MHFlag() {
      return MHFlag;
    }};
});
System.registerModule("models/trait/MHGenre.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHGenre.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHGenre = (function($__super) {
    function MHGenre(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGenre).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHGenre, {toString: function() {
        return $traceurRuntime.superGet(this, MHGenre.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgnr';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHGenre, 'MHGenre');
  })();
  return {get MHGenre() {
      return MHGenre;
    }};
});
System.registerModule("models/trait/MHGraphGenre.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHGraphGenre.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHGraphGenre = (function($__super) {
    function MHGraphGenre(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHGraphGenre).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHGraphGenre, {toString: function() {
        return $traceurRuntime.superGet(this, MHGraphGenre.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhgrg';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHGraphGenre, 'MHGraphGenre');
  })();
  return {get MHGraphGenre() {
      return MHGraphGenre;
    }};
});
System.registerModule("models/trait/MHMaterialSource.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHMaterialSource.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHMaterialSource = (function($__super) {
    function MHMaterialSource(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMaterialSource).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHMaterialSource, {toString: function() {
        return $traceurRuntime.superGet(this, MHMaterialSource.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhmts';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHMaterialSource, 'MHMaterialSource');
  })();
  return {get MHMaterialSource() {
      return MHMaterialSource;
    }};
});
System.registerModule("models/trait/MHMood.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHMood.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHMood = (function($__super) {
    function MHMood(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHMood).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHMood, {toString: function() {
        return $traceurRuntime.superGet(this, MHMood.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhmod';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHMood, 'MHMood');
  })();
  return {get MHMood() {
      return MHMood;
    }};
});
System.registerModule("models/trait/MHQuality.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHQuality.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHQuality = (function($__super) {
    function MHQuality(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHQuality).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHQuality, {toString: function() {
        return $traceurRuntime.superGet(this, MHQuality.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhqlt';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHQuality, 'MHQuality');
  })();
  return {get MHQuality() {
      return MHQuality;
    }};
});
System.registerModule("models/trait/MHStoryElement.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHStoryElement.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHStoryElement = (function($__super) {
    function MHStoryElement(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHStoryElement).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHStoryElement, {toString: function() {
        return $traceurRuntime.superGet(this, MHStoryElement.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhstr';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHStoryElement, 'MHStoryElement');
  })();
  return {get MHStoryElement() {
      return MHStoryElement;
    }};
});
System.registerModule("models/trait/MHStyleElement.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHStyleElement.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHStyleElement = (function($__super) {
    function MHStyleElement(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHStyleElement).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHStyleElement, {toString: function() {
        return $traceurRuntime.superGet(this, MHStyleElement.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsty';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHStyleElement, 'MHStyleElement');
  })();
  return {get MHStyleElement() {
      return MHStyleElement;
    }};
});
System.registerModule("models/trait/MHSubGenre.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHSubGenre.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHSubGenre = (function($__super) {
    function MHSubGenre(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHSubGenre).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHSubGenre, {toString: function() {
        return $traceurRuntime.superGet(this, MHSubGenre.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhsgn';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHSubGenre, 'MHSubGenre');
  })();
  return {get MHSubGenre() {
      return MHSubGenre;
    }};
});
System.registerModule("models/trait/MHTheme.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTheme.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHTheme = (function($__super) {
    function MHTheme(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHTheme).call(this, args);
      var description = args.description || null;
      Object.defineProperties(this, {'description': {
          configurable: false,
          enumerable: true,
          writable: false,
          value: description
        }});
    }
    return ($traceurRuntime.createClass)(MHTheme, {toString: function() {
        return $traceurRuntime.superGet(this, MHTheme.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhthm';
      }}, $__super);
  }(MHTrait));
  (function() {
    MHObject.registerConstructor(MHTheme, 'MHTheme');
  })();
  return {get MHTheme() {
      return MHTheme;
    }};
});
System.registerModule("models/trait/MHTraitGroup.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHTraitGroup.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTraitGroup = (function($__super) {
    function MHTraitGroup(args) {
      args = MHObject.parseArgs(args);
      $traceurRuntime.superConstructor(MHTraitGroup).call(this, args);
    }
    return ($traceurRuntime.createClass)(MHTraitGroup, {toString: function() {
        return $traceurRuntime.superGet(this, MHTraitGroup.prototype, "toString").call(this);
      }}, {get mhidPrefix() {
        return 'mhtrg';
      }}, $__super);
  }(MHObject));
  (function() {
    MHObject.registerConstructor(MHTraitGroup, 'MHTraitGroup');
  })();
  return {get MHTraitGroup() {
      return MHTraitGroup;
    }};
});
System.registerModule("models/all-models.js", [], function() {
  "use strict";
  var __moduleName = "models/all-models.js";
  var MHSDK = System.get("models/sdk/MHSDK.js").MHSDK;
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHRelationalPair = System.get("models/base/MHRelationalPair.js").MHRelationalPair;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHAdd = System.get("models/action/MHAdd.js").MHAdd;
  var MHComment = System.get("models/action/MHComment.js").MHComment;
  var MHCreate = System.get("models/action/MHCreate.js").MHCreate;
  var MHLike = System.get("models/action/MHLike.js").MHLike;
  var MHFollow = System.get("models/action/MHFollow.js").MHFollow;
  var MHPost = System.get("models/action/MHPost.js").MHPost;
  var MHHashtag = System.get("models/action/MHHashtag.js").MHHashtag;
  var MHUser = System.get("models/user/MHUser.js").MHUser;
  var MHLoginSession = System.get("models/user/MHLoginSession.js").MHLoginSession;
  var MHSocial = System.get("models/social/MHSocial.js").MHSocial;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHAlbum = System.get("models/media/MHAlbum.js").MHAlbum;
  var MHAlbumSeries = System.get("models/media/MHAlbumSeries.js").MHAlbumSeries;
  var MHAnthology = System.get("models/media/MHAnthology.js").MHAnthology;
  var MHBook = System.get("models/media/MHBook.js").MHBook;
  var MHBookSeries = System.get("models/media/MHBookSeries.js").MHBookSeries;
  var MHComicBook = System.get("models/media/MHComicBook.js").MHComicBook;
  var MHComicBookSeries = System.get("models/media/MHComicBookSeries.js").MHComicBookSeries;
  var MHGame = System.get("models/media/MHGame.js").MHGame;
  var MHGameSeries = System.get("models/media/MHGameSeries.js").MHGameSeries;
  var MHGraphicNovel = System.get("models/media/MHGraphicNovel.js").MHGraphicNovel;
  var MHGraphicNovelSeries = System.get("models/media/MHGraphicNovelSeries.js").MHGraphicNovelSeries;
  var MHMovie = System.get("models/media/MHMovie.js").MHMovie;
  var MHMovieSeries = System.get("models/media/MHMovieSeries.js").MHMovieSeries;
  var MHMusicVideo = System.get("models/media/MHMusicVideo.js").MHMusicVideo;
  var MHNovella = System.get("models/media/MHNovella.js").MHNovella;
  var MHPeriodical = System.get("models/media/MHPeriodical.js").MHPeriodical;
  var MHPeriodicalSeries = System.get("models/media/MHPeriodicalSeries.js").MHPeriodicalSeries;
  var MHShowEpisode = System.get("models/media/MHShowEpisode.js").MHShowEpisode;
  var MHShowSeason = System.get("models/media/MHShowSeason.js").MHShowSeason;
  var MHShowSeries = System.get("models/media/MHShowSeries.js").MHShowSeries;
  var MHSong = System.get("models/media/MHSong.js").MHSong;
  var MHSpecial = System.get("models/media/MHSpecial.js").MHSpecial;
  var MHSpecialSeries = System.get("models/media/MHSpecialSeries.js").MHSpecialSeries;
  var MHTrailer = System.get("models/media/MHTrailer.js").MHTrailer;
  var MHCollection = System.get("models/collection/MHCollection.js").MHCollection;
  var MHContext = System.get("models/meta/MHContext.js").MHContext;
  var MHMetaData = System.get("models/meta/MHMetaData.js").MHMetaData;
  var MHImage = System.get("models/image/MHImage.js").MHImage;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHTraitGroup = System.get("models/trait/MHTraitGroup.js").MHTraitGroup;
  var MHGenre = System.get("models/trait/MHGenre.js").MHGenre;
  var MHSubGenre = System.get("models/trait/MHSubGenre.js").MHSubGenre;
  var MHMood = System.get("models/trait/MHMood.js").MHMood;
  var MHQuality = System.get("models/trait/MHQuality.js").MHQuality;
  var MHStyleElement = System.get("models/trait/MHStyleElement.js").MHStyleElement;
  var MHStoryElement = System.get("models/trait/MHStoryElement.js").MHStoryElement;
  var MHMaterialSource = System.get("models/trait/MHMaterialSource.js").MHMaterialSource;
  var MHTheme = System.get("models/trait/MHTheme.js").MHTheme;
  var MHAchievements = System.get("models/trait/MHAchievements.js").MHAchievements;
  var MHEra = System.get("models/trait/MHEra.js").MHEra;
  var MHAudience = System.get("models/trait/MHAudience.js").MHAudience;
  var MHFlag = System.get("models/trait/MHFlag.js").MHFlag;
  var MHGraphGenre = System.get("models/trait/MHGraphGenre.js").MHGraphGenre;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var MHRealIndividualContributor = System.get("models/contributor/MHRealIndividualContributor.js").MHRealIndividualContributor;
  var MHRealGroupContributor = System.get("models/contributor/MHRealGroupContributor.js").MHRealGroupContributor;
  var MHFictionalIndividualContributor = System.get("models/contributor/MHFictionalIndividualContributor.js").MHFictionalIndividualContributor;
  var MHFictionalGroupContributor = System.get("models/contributor/MHFictionalGroupContributor.js").MHFictionalGroupContributor;
  var MHSource = System.get("models/source/MHSource.js").MHSource;
  var MHSubscription = System.get("models/source/MHSubscription.js").MHSubscription;
  var MHSourceFormat = System.get("models/source/MHSourceFormat.js").MHSourceFormat;
  var MHSourceMethod = System.get("models/source/MHSourceMethod.js").MHSourceMethod;
  var MHSourceMedium = System.get("models/source/MHSourceMedium.js").MHSourceMedium;
  var MHSourceModel = System.get("models/source/MHSourceModel.js").MHSourceModel;
  delete MHObject.registerConstructor;
  var models = {
    get MHSDK() {
      return MHSDK;
    },
    get MHObject() {
      return MHObject;
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
    get MHHashtag() {
      return MHHashtag;
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
    get MHContext() {
      return MHContext;
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
    get MHSource() {
      return MHSource;
    },
    get MHSubscription() {
      return MHSubscription;
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
System.registerModule("search/MHSearch.js", [], function() {
  "use strict";
  var __moduleName = "search/MHSearch.js";
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHRelationalPair = System.get("models/base/MHRelationalPair.js").MHRelationalPair;
  var MHSearch = (function() {
    function MHSearch() {}
    return ($traceurRuntime.createClass)(MHSearch, {}, {
      fetchResultsForSearchTerm: function(searchTerm, scopes) {
        var size = arguments[2] !== (void 0) ? arguments[2] : 12;
        var makeEndpoint = function(query) {
          return 'search/all/' + houndRequest.extraEncode(query);
        },
            makeParams = function(scopes, size) {
              var params = {
                pageSize: (typeof size === 'number') ? size : 8,
                v: '2'
              };
              if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
                params.types = scopes;
              }
              return params;
            },
            makeSearchRequest = function(searchTerm, scopes, size) {
              return houndRequest({
                method: 'GET',
                endpoint: makeEndpoint(searchTerm),
                params: makeParams(scopes, size)
              });
            };
        return makeSearchRequest(searchTerm, scopes, size).then((function(response) {
          return Promise.all(MHRelationalPair.createFromArray(response.content));
        }));
      },
      get SCOPE_ALL() {
        return 'all';
      },
      get SCOPE_MOVIE() {
        return 'movie';
      },
      get SCOPE_SONG() {
        return 'song';
      },
      get SCOPE_ALBUM() {
        return 'album';
      },
      get SCOPE_SHOWSERIES() {
        return 'showseries';
      },
      get SCOPE_SHOWSEASON() {
        return 'showseason';
      },
      get SCOPE_SHOWEPISODE() {
        return 'showepisode';
      },
      get SCOPE_BOOK() {
        return 'book';
      },
      get SCOPE_GAME() {
        return 'game';
      },
      get SCOPE_COLLECTION() {
        return 'collection';
      },
      get SCOPE_USER() {
        return 'user';
      },
      get SCOPE_CONTRIBUTOR() {
        return 'contributor';
      }
    });
  }());
  return {get MHSearch() {
      return MHSearch;
    }};
});
System.registerModule("hound-api.js", [], function() {
  "use strict";
  var __moduleName = "hound-api.js";
  var request = System.get("request/hound-request.js").houndRequest;
  var pagedRequest = System.get("request/hound-paged-request.js").pagedRequest;
  var models = System.get("models/all-models.js").models;
  var MHSearch = System.get("search/MHSearch.js").MHSearch;
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
    get MHSearch() {
      return MHSearch;
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
    get MHSearch() {
      return MHSearch;
    },
    get default() {
      return $__default;
    }
  };
});
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') { module.exports = System.get("hound-api.js" + '').default; }
