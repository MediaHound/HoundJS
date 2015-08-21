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
          if (name === '__esModule' || name === 'default' || isSymbolString(name))
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
    var hasNativeSymbol;
    function polyfillSymbol(global, Symbol) {
      if (!global.Symbol) {
        global.Symbol = Symbol;
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
        hasNativeSymbol = false;
      } else {
        hasNativeSymbol = true;
      }
      if (!global.Symbol.iterator) {
        global.Symbol.iterator = Symbol('Symbol.iterator');
      }
      if (!global.Symbol.observer) {
        global.Symbol.observer = Symbol('Symbol.observer');
      }
    }
    function hasNativeSymbolFunc() {
      return hasNativeSymbol;
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
      hasNativeSymbol: hasNativeSymbolFunc,
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
  var $__3 = $traceurRuntime,
      canonicalizeUrl = $__3.canonicalizeUrl,
      resolveUrl = $__3.resolveUrl,
      isAbsolute = $__3.isAbsolute;
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
    causeStack.split('\n').some(function(frame) {
      if (/UncoatedModuleInstantiator/.test(frame))
        return true;
      stack.push(frame);
    });
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
    var $__2 = this;
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
        ex.stack.split('\n').some(function(frame, index) {
          if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
            return true;
          var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
          if (m) {
            var line = parseInt(m[2], 10);
            evaled = evaled.concat(beforeLines(lines, line));
            if (index === 1) {
              evaled.push(columnSpacing(m[3]) + '^ ' + $__2.url);
            } else {
              evaled.push(columnSpacing(m[3]) + '^');
            }
            evaled = evaled.concat(afterLines(lines, line));
            evaled.push('= = = = = = = = =');
          } else {
            evaled.push(frame);
          }
        });
        ex.stack = evaled.join('\n');
      }
      throw new ModuleEvaluationError(this.url, ex);
    }
  };
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
    Object.getOwnPropertyNames(uncoatedModule).forEach(function(name) {
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
    });
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
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, function() {
        return module;
      });
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
            var $__2 = arguments;
            var depMap = {};
            deps.forEach(function(dep, index) {
              return depMap[dep] = $__2[index];
            });
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/async.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/async.js";
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
  var AsyncGeneratorContext = function() {
    function AsyncGeneratorContext(observer) {
      var $__2 = this;
      this.decoratedObserver = $traceurRuntime.createDecoratedGenerator(observer, function() {
        $__2.done = true;
      });
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
          return;
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
            return;
          }
          var result;
          try {
            result = ctx.decoratedObserver.next(value);
          } catch (e) {
            ctx.done = true;
            throw e;
          }
          if (result === undefined) {
            return;
          }
          if (result.done) {
            ctx.done = true;
          }
          return result;
        });
      }
    }, {});
  }();
  AsyncGeneratorFunctionPrototype.prototype[Symbol.observer] = function(observer) {
    var observe = this[observeName];
    var ctx = new AsyncGeneratorContext(observer);
    $traceurRuntime.schedule(function() {
      return observe(ctx);
    }).then(function(value) {
      if (!ctx.done) {
        ctx.decoratedObserver.return(value);
      }
    }).catch(function(error) {
      if (!ctx.done) {
        ctx.decoratedObserver.throw(error);
      }
    });
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
        $__10 = 2; $__10 < arguments.length; $__10++)
      args[$__10 - 2] = arguments[$__10];
    var object = $create(functionObject.prototype);
    object[thisName] = this;
    object[argsName] = args;
    object[observeName] = observe;
    return object;
  }
  function observeForEach(observe, next) {
    return new Promise(function(resolve, reject) {
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
    });
  }
  function schedule(asyncF) {
    return Promise.resolve().then(asyncF);
  }
  var generator = Symbol();
  var onDone = Symbol();
  var DecoratedGenerator = function() {
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
  }();
  function createDecoratedGenerator(generator, onDone) {
    return new DecoratedGenerator(generator, onDone);
  }
  Array.prototype[$traceurRuntime.toProperty(Symbol.observer)] = function(observer) {
    var done = false;
    var decoratedObserver = createDecoratedGenerator(observer, function() {
      return done = true;
    });
    var $__6 = true;
    var $__7 = false;
    var $__8 = undefined;
    try {
      for (var $__4 = void 0,
          $__3 = (this)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
        var value = $__4.value;
        {
          decoratedObserver.next(value);
          if (done) {
            return;
          }
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
    decoratedObserver.return();
    return decoratedObserver;
  };
  $defineProperty(Array.prototype, $traceurRuntime.toProperty(Symbol.observer), {enumerable: false});
  $traceurRuntime.initAsyncGeneratorFunction = initAsyncGeneratorFunction;
  $traceurRuntime.createAsyncGeneratorInstance = createAsyncGeneratorInstance;
  $traceurRuntime.observeForEach = observeForEach;
  $traceurRuntime.schedule = schedule;
  $traceurRuntime.createDecoratedGenerator = createDecoratedGenerator;
  return {};
});
System.registerModule("traceur-runtime@0.0.91/src/runtime/classes.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/classes.js";
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__1 = Object,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      getOwnPropertySymbols = $__1.getOwnPropertySymbols;
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
      var value = descriptor.value;
      if (value)
        return value;
      if (!descriptor.get)
        return value;
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
    forEachPropertyKey(object, function(key) {
      descriptors[key] = $getOwnPropertyDescriptor(object, key);
      descriptors[key].enumerable = false;
    });
    return descriptors;
  }
  var nonEnum = {enumerable: false};
  function makePropertiesNonEnumerable(object) {
    forEachPropertyKey(object, function(key) {
      $defineProperty(object, key, nonEnum);
    });
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/destructuring.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/destructuring.js";
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/generators.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/generators.js";
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
      return;
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/relativeRequire.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/relativeRequire.js";
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
      return;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
  return {};
});
System.registerModule("traceur-runtime@0.0.91/src/runtime/spread.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/spread.js";
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/template.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/template.js";
  var $__1 = Object,
      defineProperty = $__1.defineProperty,
      freeze = $__1.freeze;
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/type-assertions.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/type-assertions.js";
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = function() {
    function GenericType(type, argumentTypes) {
      this.type = type;
      this.argumentTypes = argumentTypes;
    }
    return ($traceurRuntime.createClass)(GenericType, {}, {});
  }();
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      argumentTypes[$__2 - 1] = arguments[$__2];
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/runtime-modules.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/runtime-modules.js";
  System.get("traceur-runtime@0.0.91/src/runtime/relativeRequire.js");
  System.get("traceur-runtime@0.0.91/src/runtime/spread.js");
  System.get("traceur-runtime@0.0.91/src/runtime/destructuring.js");
  System.get("traceur-runtime@0.0.91/src/runtime/classes.js");
  System.get("traceur-runtime@0.0.91/src/runtime/async.js");
  System.get("traceur-runtime@0.0.91/src/runtime/generators.js");
  System.get("traceur-runtime@0.0.91/src/runtime/template.js");
  System.get("traceur-runtime@0.0.91/src/runtime/type-assertions.js");
  return {};
});
System.get("traceur-runtime@0.0.91/src/runtime/runtime-modules.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/utils.js";
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
    polyfills.forEach(function(f) {
      return f(global);
    });
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      registerPolyfill = $__0.registerPolyfill;
  var $__10 = $traceurRuntime,
      getOwnHashObject = $__10.getOwnHashObject,
      hasNativeSymbol = $__10.hasNativeSymbol;
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
  var Map = function() {
    function Map() {
      var $__12,
          $__13;
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Map called on incompatible type');
      if ($hasOwnProperty.call(this, 'entries_')) {
        throw new TypeError('Map can not be reentrantly initialised');
      }
      initMap(this);
      if (iterable !== null && iterable !== undefined) {
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var $__11 = $__4.value,
                key = ($__12 = $__11[$traceurRuntime.toProperty(Symbol.iterator)](), ($__13 = $__12.next()).done ? void 0 : $__13.value),
                value = ($__13 = $__12.next()).done ? void 0 : $__13.value;
            {
              this.set(key, value);
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
      entries: $traceurRuntime.initGeneratorFunction(function $__14() {
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
        }, $__14, this);
      }),
      keys: $traceurRuntime.initGeneratorFunction(function $__15() {
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
        }, $__15, this);
      }),
      values: $traceurRuntime.initGeneratorFunction(function $__16() {
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
        }, $__16, this);
      })
    }, {});
  }();
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function needsPolyfill(global) {
    var $__11 = global,
        Map = $__11.Map,
        Symbol = $__11.Symbol;
    if (!Map || !$traceurRuntime.hasNativeSymbol() || !Map.prototype[Symbol.iterator] || !Map.prototype.entries) {
      return true;
    }
    try {
      return new Map([[]]).size !== 1;
    } catch (e) {
      return false;
    }
  }
  function polyfillMap(global) {
    if (needsPolyfill(global)) {
      global.Map = Map;
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function() {
    function Set() {
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Set called on incompatible type');
      if ($hasOwnProperty.call(this, 'map_')) {
        throw new TypeError('Set can not be reentrantly initialised');
      }
      initSet(this);
      if (iterable !== null && iterable !== undefined) {
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var item = $__6.value;
            {
              this.add(item);
            }
          }
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
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
        var $__4 = this;
        return this.map_.forEach(function(value, key) {
          callbackFn.call(thisArg, key, key, $__4);
        });
      },
      values: $traceurRuntime.initGeneratorFunction(function $__13() {
        var $__14,
            $__15;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__14 = $ctx.wrapYieldStar(this.map_.keys()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__15 = $__14[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__15.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__15.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__15.value;
              default:
                return $ctx.end();
            }
        }, $__13, this);
      }),
      entries: $traceurRuntime.initGeneratorFunction(function $__16() {
        var $__17,
            $__18;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__17 = $ctx.wrapYieldStar(this.map_.entries()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__18 = $__17[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__18.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__18.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__18.value;
              default:
                return $ctx.end();
            }
        }, $__16, this);
      })
    }, {});
  }();
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
  function needsPolyfill(global) {
    var $__12 = global,
        Set = $__12.Set,
        Symbol = $__12.Symbol;
    if (!Set || !$traceurRuntime.hasNativeSymbol() || !Set.prototype[Symbol.iterator] || !Set.prototype.values) {
      return true;
    }
    try {
      return new Set([1]).size !== 1;
    } catch (e) {
      return false;
    }
  }
  function polyfillSet(global) {
    if (needsPolyfill(global)) {
      global.Set = Set;
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.91/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/node_modules/rsvp/lib/rsvp/asap.js";
  var len = 0;
  var toString = {}.toString;
  var vertxNext;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserWindow = (typeof window !== 'undefined') ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    var nextTick = process.nextTick;
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
      nextTick = setImmediate;
    }
    return function() {
      nextTick(flush);
    };
  }
  function useVertxTimer() {
    return function() {
      vertxNext(flush);
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
  function attemptVertex() {
    try {
      var r = require;
      var vertx = r('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }
  var scheduleFlush;
  if (isNode) {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertex();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.91/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js").registerPolyfill;
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
        resolve: function(x) {
          promiseResolve(promise, x);
        },
        reject: function(r) {
          promiseReject(promise, r);
        }
      };
    } else {
      var result = {};
      result.promise = new C(function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      });
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
  var Promise = function() {
    function Promise(resolver) {
      if (resolver === promiseRaw)
        return;
      if (typeof resolver !== 'function')
        throw new TypeError;
      var promise = promiseInit(this);
      try {
        resolver(function(x) {
          promiseResolve(promise, x);
        }, function(r) {
          promiseReject(promise, r);
        });
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
          return new this(function(resolve, reject) {
            reject(r);
          });
        }
      },
      all: function(values) {
        var deferred = getDeferred(this);
        var resolutions = [];
        try {
          var makeCountdownFunction = function(i) {
            return function(x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            };
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
                this.resolve(value).then(countdownFunction, function(r) {
                  deferred.reject(r);
                });
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
            this.resolve(values[i]).then(function(x) {
              deferred.resolve(x);
            }, function(r) {
              deferred.reject(r);
            });
          }
        } catch (e) {
          deferred.reject(e);
        }
        return deferred.promise;
      }
    });
  }();
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
    async(function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    });
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function() {
    var $__3;
    function StringIterator() {}
    return ($traceurRuntime.createClass)(StringIterator, ($__3 = {}, Object.defineProperty($__3, "next", {
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
    }), Object.defineProperty($__3, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3), {});
  }();
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function() {
    var $__3;
    function ArrayIterator() {}
    return ($traceurRuntime.createClass)(ArrayIterator, ($__3 = {}, Object.defineProperty($__3, "next", {
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
    }), Object.defineProperty($__3, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3), {});
  }();
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      jsValues = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
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
      var $__6 = true;
      var $__7 = false;
      var $__8 = undefined;
      try {
        for (var $__4 = void 0,
            $__3 = (items)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
          var item = $__4.value;
          {
            if (mapping) {
              arr[k] = mapFn.call(thisArg, item, k);
            } else {
              arr[k] = item;
            }
            k++;
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
        $__10 = 0; $__10 < arguments.length; $__10++)
      items[$__10] = arguments[$__10];
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
    var $__11 = global,
        Array = $__11.Array,
        Object = $__11.Object,
        Symbol = $__11.Symbol;
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__2 = $traceurRuntime,
      defineProperty = $__2.defineProperty,
      getOwnPropertyDescriptor = $__2.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__2.getOwnPropertyNames,
      isPrivateName = $__2.isPrivateName,
      keys = $__2.keys;
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/fround.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/fround.js";
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__1 = Math,
      LN2 = $__1.LN2,
      abs = $__1.abs,
      floor = $__1.floor,
      log = $__1.log,
      min = $__1.min,
      pow = $__1.pow;
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
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/Math.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/Math.js";
  var jsFround = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/fround.js").fround;
  var $__1 = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      registerPolyfill = $__1.registerPolyfill,
      toUint32 = $__1.toUint32;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__3 = Math,
      abs = $__3.abs,
      ceil = $__3.ceil,
      exp = $__3.exp,
      floor = $__3.floor,
      log = $__3.log,
      pow = $__3.pow,
      sqrt = $__3.sqrt;
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
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/Math.js" + '');
System.registerModule("traceur-runtime@0.0.91/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.91/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.91/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.91/src/runtime/polyfills/polyfills.js" + '');

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
        $__1 = 1; $__1 < arguments.length; $__1++)
      args[$__1 - 1] = arguments[$__1];
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
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
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
        $__3 = 1; $__3 < arguments.length; $__3++)
      args[$__3 - 1] = arguments[$__3];
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
  var MHSDK = function() {
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
  }();
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
            method = args.method || 'GET',
            url = args.url || null,
            params = args.params || null,
            data = args.data || null,
            headers = args.headers || null,
            withCreds = (args.withCredentials !== undefined) ? args.withCredentials : true,
            onprogress = args.onprogress || null,
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
                var $__4 = true;
                var $__5 = false;
                var $__6 = undefined;
                try {
                  for (var $__2 = void 0,
                      $__1 = (params[prop])[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
                    var p = $__2.value;
                    {
                      url += encodeURIComponent(prop) + '=' + extraEncode(p).replace('%20', '+');
                      url += '&';
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
        xhr.withCredentials = withCreds;
        if (headers !== null) {
          for (prop in headers) {
            if (headers.hasOwnProperty(prop)) {
              xhr.setRequestHeader(prop, headers[prop]);
            }
          }
        }
        return new Promise(function(resolve, reject) {
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
      requestMap[args.url] = promiseRequest(args).then(function(res) {
        delete requestMap[args.url];
        return res;
      }, function(err) {
        delete requestMap[args.url];
        throw err;
      }).then(responseThen);
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
System.registerModule("models/internal/MHCache.js", [], function() {
  "use strict";
  var __moduleName = "models/internal/MHCache.js";
  var log = System.get("models/internal/debug-helpers.js").log;
  var keymapSym = Symbol('keymap');
  var MHCache = function() {
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
        if (mhObj && mhObj.metadata.mhid && mhObj.metadata.username) {
          return this.put(mhObj.metadata.mhid, mhObj, mhObj.metadata.username);
        }
        if (mhObj && mhObj.metadata.mhid) {
          return this.put(mhObj.metadata.mhid, mhObj, mhObj.metadata.altId);
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
        var MHObject = System.get('../models/base/MHObject.js').MHObject;
        if (!localStorage || typeof localStorage[storageKey] === 'undefined') {
          log('nothing stored');
          return;
        }
        var i = 0,
            curr,
            stored = JSON.parse(localStorage[storageKey]);
        for (; i < stored.length; i++) {
          curr = MHObject.create(stored[i]);
          if (curr && !this.has(curr.metadata.mhid)) {
            log('adding to cache: ', curr);
            this.putMHObj(curr);
          }
        }
      }
    }, {});
  }();
  return {get MHCache() {
      return MHCache;
    }};
});
System.registerModule("models/internal/jsonParse.js", [], function() {
  "use strict";
  var __moduleName = "models/internal/jsonParse.js";
  var mapValueToType = function(rawValue, type) {
    var initialValue = null;
    if (typeof type === 'object') {
      if (type) {
        if (type instanceof Array) {
          var innerType = type[0];
          if (rawValue !== null && rawValue !== undefined) {
            initialValue = rawValue.map(function(v) {
              try {
                return mapValueToType(v, innerType);
              } catch (e) {
                console.log(e);
                return v;
              }
            });
          }
        } else {
          if (type.mapper && typeof type.mapper === 'function') {
            initialValue = (rawValue !== null && rawValue !== undefined) ? type.mapper(rawValue) : null;
          }
        }
      }
    } else if (type === String) {
      initialValue = (rawValue !== null && rawValue !== undefined) ? String(rawValue) : null;
    } else if (type === Number) {
      initialValue = (rawValue !== null && rawValue !== undefined) ? Number(rawValue) : null;
      if (Number.isNaN(initialValue)) {
        initialValue = null;
      }
    } else if (type === Boolean) {
      initialValue = (rawValue !== null && rawValue !== undefined) ? Boolean(rawValue) : null;
    } else if (type === Object) {
      initialValue = rawValue || null;
    } else if (type === Date) {
      initialValue = new Date(rawValue * 1000);
      if (isNaN(initialValue)) {
        initialValue = null;
      } else if (initialValue === 'Invalid Date') {
        initialValue = null;
      } else {
        initialValue = new Date(initialValue.valueOf() + initialValue.getTimezoneOffset() * 60000);
      }
    } else if (typeof type === 'function') {
      initialValue = (rawValue !== null && rawValue !== undefined) ? new type(rawValue) : null;
    }
    return initialValue;
  };
  var setPropertyFromArgs = function(args, obj, name, type, optional, merge) {
    if (!obj[name]) {
      var rawValue = args[name];
      var convertedValue = mapValueToType(rawValue, type);
      if (!optional && !convertedValue) {
        throw TypeError('non-optional field `' + name + '` found null value. Args:', args);
      }
      if (convertedValue) {
        if (merge) {
          obj[name] = convertedValue;
        } else {
          Object.defineProperty(obj, name, {
            configurable: false,
            enumerable: true,
            writable: true,
            value: convertedValue
          });
        }
      }
    }
  };
  var jsonParseArgs = function(args, obj, merge) {
    var properties = obj.jsonProperties;
    for (var name in properties) {
      if (properties.hasOwnProperty(name)) {
        var value = properties[name];
        var optional = true;
        var type = void 0;
        if (typeof value === 'object') {
          if (value.type !== undefined) {
            type = value.type;
          } else if (value.mapper !== undefined) {
            type = value;
          } else if (value instanceof Array) {
            type = value;
          }
          if (value.optional !== undefined) {
            optional = value.optional;
          }
        } else {
          type = value;
        }
        setPropertyFromArgs(args, obj, name, type, optional, merge);
      }
    }
  };
  var jsonCreateWithArgs = function(args, obj) {
    jsonParseArgs(args, obj, false);
  };
  var jsonMergeWithArgs = function(args, obj) {
    jsonParseArgs(args, obj, true);
  };
  var jsonCreateFromArrayData = function(arr, type) {
    return mapValueToType(arr, type);
  };
  return {
    get jsonCreateWithArgs() {
      return jsonCreateWithArgs;
    },
    get jsonMergeWithArgs() {
      return jsonMergeWithArgs;
    },
    get jsonCreateFromArrayData() {
      return jsonCreateFromArrayData;
    }
  };
});
System.registerModule("models/image/MHImageData.js", [], function() {
  "use strict";
  var __moduleName = "models/image/MHImageData.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHImageData = function() {
    function MHImageData(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHImageData, {get jsonProperties() {
        return {
          url: String,
          width: Number,
          height: Number
        };
      }}, {});
  }();
  return {get MHImageData() {
      return MHImageData;
    }};
});
System.registerModule("models/meta/MHMetadata.js", [], function() {
  "use strict";
  var __moduleName = "models/meta/MHMetadata.js";
  var MHImageData = System.get("models/image/MHImageData.js").MHImageData;
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHMetadata = function() {
    function MHMetadata(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHMetadata, {get jsonProperties() {
        return {
          mhid: {
            type: String,
            optional: false
          },
          altId: String,
          name: String,
          description: String,
          createdDate: Date
        };
      }}, {});
  }();
  var MHMediaMetadata = function($__super) {
    function MHMediaMetadata() {
      $traceurRuntime.superConstructor(MHMediaMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMediaMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHMediaMetadata.prototype, "jsonProperties"), {releaseDate: Date});
      }}, {}, $__super);
  }(MHMetadata);
  var MHUserMetadata = function($__super) {
    function MHUserMetadata() {
      $traceurRuntime.superConstructor(MHUserMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHUserMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHUserMetadata.prototype, "jsonProperties"), {
          username: {
            type: String,
            optional: false
          },
          email: String
        });
      }}, {}, $__super);
  }(MHMetadata);
  var MHCollectionMetadata = function($__super) {
    function MHCollectionMetadata() {
      $traceurRuntime.superConstructor(MHCollectionMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHCollectionMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHCollectionMetadata.prototype, "jsonProperties"), {mixlist: String});
      }}, {}, $__super);
  }(MHMetadata);
  var MHActionMetadata = function($__super) {
    function MHActionMetadata() {
      $traceurRuntime.superConstructor(MHActionMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHActionMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHActionMetadata.prototype, "jsonProperties"), {message: String});
      }}, {}, $__super);
  }(MHMetadata);
  var MHImageMetadata = function($__super) {
    function MHImageMetadata() {
      $traceurRuntime.superConstructor(MHImageMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHImageMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHImageMetadata.prototype, "jsonProperties"), {
          isDefault: Boolean,
          averageColor: String,
          thumbnail: MHImageData,
          small: MHImageData,
          medium: MHImageData,
          large: MHImageData,
          original: MHImageData
        });
      }}, {}, $__super);
  }(MHMetadata);
  var MHSubscriptionMetadata = function($__super) {
    function MHSubscriptionMetadata() {
      $traceurRuntime.superConstructor(MHSubscriptionMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSubscriptionMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHSubscriptionMetadata.prototype, "jsonProperties"), {
          timePeriod: String,
          price: String,
          currency: String,
          mediums: String
        });
      }}, {}, $__super);
  }(MHMetadata);
  var MHSourceMetadata = function($__super) {
    function MHSourceMetadata() {
      $traceurRuntime.superConstructor(MHSourceMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSourceMetadata, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHSourceMetadata.prototype, "jsonProperties"), {connectable: Boolean});
      }}, {}, $__super);
  }(MHMetadata);
  var MHContributorMetadata = function($__super) {
    function MHContributorMetadata() {
      $traceurRuntime.superConstructor(MHContributorMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHContributorMetadata, {}, {}, $__super);
  }(MHMetadata);
  var MHHashtagMetadata = function($__super) {
    function MHHashtagMetadata() {
      $traceurRuntime.superConstructor(MHHashtagMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHHashtagMetadata, {}, {}, $__super);
  }(MHMetadata);
  var MHTraitMetadata = function($__super) {
    function MHTraitMetadata() {
      $traceurRuntime.superConstructor(MHTraitMetadata).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHTraitMetadata, {}, {}, $__super);
  }(MHMetadata);
  return {
    get MHMetadata() {
      return MHMetadata;
    },
    get MHMediaMetadata() {
      return MHMediaMetadata;
    },
    get MHUserMetadata() {
      return MHUserMetadata;
    },
    get MHCollectionMetadata() {
      return MHCollectionMetadata;
    },
    get MHActionMetadata() {
      return MHActionMetadata;
    },
    get MHImageMetadata() {
      return MHImageMetadata;
    },
    get MHSubscriptionMetadata() {
      return MHSubscriptionMetadata;
    },
    get MHSourceMetadata() {
      return MHSourceMetadata;
    },
    get MHContributorMetadata() {
      return MHContributorMetadata;
    },
    get MHHashtagMetadata() {
      return MHHashtagMetadata;
    },
    get MHTraitMetadata() {
      return MHTraitMetadata;
    }
  };
});
System.registerModule("models/social/MHSocial.js", [], function() {
  "use strict";
  var __moduleName = "models/social/MHSocial.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHSocial = function() {
    function MHSocial(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHSocial, {
      isEqualToMHSocial: function(otherObj) {
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (Object.keys(this.jsonProperties))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var prop = $__4.value;
            {
              if (typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop]) {
                continue;
              } else if (!this[prop] && !otherObj[prop]) {
                continue;
              }
              return false;
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
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (Object.keys(this.jsonProperties))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var prop = $__4.value;
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
        return new MHSocial(newArgs);
      },
      get jsonProperties() {
        return {
          'likers': Number,
          'followers': Number,
          'collectors': Number,
          'mentioners': Number,
          'following': Number,
          'ownedCollections': Number,
          'items': Number,
          'userLikes': Boolean,
          'userDislikes': Boolean,
          'userFollows': Boolean,
          'isFeatured': Boolean,
          'userConnected': Boolean,
          'userPreference': Boolean
        };
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
      }
    });
  }();
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
  var $__1 = System.get("models/internal/jsonParse.js"),
      jsonCreateWithArgs = $__1.jsonCreateWithArgs,
      jsonMergeWithArgs = $__1.jsonMergeWithArgs;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHCache = System.get("models/internal/MHCache.js").MHCache;
  var MHMetadata = System.get("models/meta/MHMetadata.js").MHMetadata;
  var MHSocial = System.get("models/social/MHSocial.js").MHSocial;
  var MHPagedResponse = System.get('../container/MHPagedResponse.js');
  var childrenConstructors = {};
  var __cachedRootResponses = {};
  var mhidLRU = new MHCache(1000);
  if (typeof window !== 'undefined') {
    if (window.location.host === 'local.mediahound.com:2014') {
      window.mhidLRU = mhidLRU;
    }
  }
  var lastSocialRequestIdSym = Symbol('lastSocialRequestId'),
      socialSym = Symbol('social');
  var MHObject = function() {
    function MHObject(args) {
      jsonCreateWithArgs(args, this);
      this.cachedResponses = {};
    }
    return ($traceurRuntime.createClass)(MHObject, {
      get jsonProperties() {
        return {
          metadata: MHMetadata,
          primaryImage: {mapper: MHObject.create},
          secondaryImage: {mapper: MHObject.create},
          social: MHSocial
        };
      },
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
        if (otherObj && otherObj.metadata.mhid) {
          return this.metadata.mhid === otherObj.metadata.mhid;
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
        return this.className + " with mhid " + this.metadata.mhid + " and name " + this.mhName;
      },
      mergeWithData: function(args) {
        jsonMergeWithArgs(args, this);
      },
      get endpoint() {
        return this.constructor.rootEndpoint + '/' + this.metadata.mhid;
      },
      subendpoint: function(sub) {
        if (typeof sub !== 'string' && !(sub instanceof String)) {
          throw new TypeError('Sub not of type string or undefined in (MHObject).subendpoint.');
        }
        return this.endpoint + '/' + sub;
      },
      fetchSocial: function() {
        var force = arguments[0] !== (void 0) ? arguments[0] : false;
        var $__8 = this;
        var path = this.subendpoint('social');
        if (!force && this.social instanceof MHSocial) {
          return Promise.resolve(this.social);
        }
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then((function(parsed) {
          return $__8.social = new MHSocial(parsed);
        }).bind(this)).catch(function(err) {
          console.warn('fetchSocial:', err);
        });
      },
      fetchFeed: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('feed');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchImages: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('images');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchCollections: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('collections');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      takeAction: function(action) {
        var $__8 = this;
        if (typeof action !== 'string' && !(action instanceof String)) {
          throw new TypeError('Action not of type String or undefined');
        }
        if (!MHSocial.SOCIAL_ACTIONS.some(function(a) {
          return action === a;
        })) {
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
        }).then(function(socialRes) {
          var newSocial = new MHSocial(socialRes.social);
          if ($__8[lastSocialRequestIdSym] === requestId) {
            self.social = newSocial;
          }
          return newSocial;
        }).catch(function(err) {
          if ($__8[lastSocialRequestIdSym] === requestId) {
            self.social = original;
          }
          throw err;
        });
      },
      responseCacheKeyForPath: function(path) {
        return "__cached_" + path;
      },
      cachedResponseForPath: function(path) {
        var cacheKey = this.responseCacheKeyForPath(path);
        return this.cachedResponses[cacheKey];
      },
      setCachedResponse: function(response, path) {
        var cacheKey = this.responseCacheKeyForPath(path);
        this.cachedResponses[cacheKey] = response;
      },
      fetchPagedEndpoint: function(path, view, size, force) {
        var next = arguments[4] !== (void 0) ? arguments[4] : null;
        if (!force && !next) {
          var cached = this.cachedResponseForPath(path);
          if (cached) {
            return cached;
          }
        }
        var promise;
        if (next) {
          promise = houndRequest({
            method: 'GET',
            url: next
          });
        } else {
          promise = houndRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: {view: view}
          });
        }
        promise.then(function(response) {
          var $__8 = this;
          var pagedResponse = new MHPagedResponse(response);
          pagedResponse.fetchNextOperation = (function(newNext) {
            return $__8.fetchPagedEndpoint(path, view, size, force, newNext);
          });
          return pagedResponse;
        });
        if (!next) {
          this.setCachedResponse(promise, path);
        }
        return promise;
      }
    }, {
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
          var mhid = args.metadata.mhid || args.mhid || undefined;
          var mhObj;
          if (mhid !== 'undefined' && mhid !== null && args instanceof Object) {
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
          console.log(err.stack);
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
        return toCheck instanceof System.get('../models/media/MHMedia.js').MHMedia;
      },
      isContributor: function(toCheck) {
        return toCheck instanceof System.get('../models/contributor/MHContributor.js').MHContributor;
      },
      isAction: function(toCheck) {
        return toCheck instanceof System.get('../models/action/MHAction.js').MHAction;
      },
      isUser: function(toCheck) {
        return toCheck instanceof System.get('../models/user/MHUser.js').MHUser;
      },
      isCollection: function(toCheck) {
        return toCheck instanceof System.get('../models/collection/MHCollection.js').MHCollection;
      },
      isImage: function(toCheck) {
        return toCheck instanceof System.get('../models/image/MHImage.js').MHImage;
      },
      isTrait: function(toCheck) {
        return toCheck instanceof System.get('../models/trait/MHTrait.js').MHTrait;
      },
      isSource: function(toCheck) {
        return toCheck instanceof System.get('../models/source/MHSource.js').MHSource;
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
      },
      rootSubendpoint: function(sub) {
        if (typeof sub !== 'string' && !(sub instanceof String)) {
          throw new TypeError('Sub not of type string or undefined in (MHObject).rootSubendpoint.');
        }
        return this.rootEndpoint + '/' + sub;
      },
      rootResponseCacheKeyForPath: function(path) {
        return "___root_cached_" + path;
      },
      cachedRootResponseForPath: function(path) {
        var cacheKey = this.rootResponseCacheKeyForPath(path);
        return __cachedRootResponses[cacheKey];
      },
      setCachedRootResponse: function(response, path) {
        var cacheKey = this.rootResponseCacheKeyForPath(path);
        __cachedRootResponses[cacheKey] = response;
      },
      fetchRootPagedEndpoint: function(path, params, view, size, force) {
        var next = arguments[5] !== (void 0) ? arguments[5] : null;
        if (!force && !next) {
          var cached = this.cachedRootResponseForPath(path);
          if (cached) {
            return cached;
          }
        }
        var promise;
        if (next) {
          promise = houndRequest({
            method: 'GET',
            url: next
          });
        } else {
          params.view = view;
          promise = houndRequest({
            method: 'GET',
            endpoint: path,
            pageSize: size,
            params: params
          });
        }
        promise.then(function(response) {
          var $__8 = this;
          var pagedResponse = new MHPagedResponse(response);
          pagedResponse.fetchNextOperation = (function(newNext) {
            return $__8.fetchRootPagedEndpoint(path, params, view, size, force, newNext);
          });
          return pagedResponse;
        });
        if (!next) {
          this.setCachedRootResponse(promise, path);
        }
        return promise;
      }
    });
  }();
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
  var MHActionMetadata = System.get("models/meta/MHMetadata.js").MHActionMetadata;
  var MHAction = function($__super) {
    function MHAction() {
      $traceurRuntime.superConstructor(MHAction).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAction, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHAction.prototype, "jsonProperties"), {
          metadata: MHActionMetadata,
          primaryOwner: {mapper: MHObject.create},
          primaryMention: {mapper: MHObject.create}
        });
      }}, {get rootEndpoint() {
        return 'graph/action';
      }}, $__super);
  }(MHObject);
  return {get MHAction() {
      return MHAction;
    }};
});
System.registerModule("models/action/MHAdd.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHAdd.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHAdd = function($__super) {
    function MHAdd() {
      $traceurRuntime.superConstructor(MHAdd).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAdd, {}, {get mhidPrefix() {
        return 'mhadd';
      }}, $__super);
  }(MHAction);
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
  var MHComment = function($__super) {
    function MHComment() {
      $traceurRuntime.superConstructor(MHComment).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHComment, {}, {get mhidPrefix() {
        return 'mhcmt';
      }}, $__super);
  }(MHAction);
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
  var MHCreate = function($__super) {
    function MHCreate() {
      $traceurRuntime.superConstructor(MHCreate).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHCreate, {}, {get mhidPrefix() {
        return 'mhcrt';
      }}, $__super);
  }(MHAction);
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
  var MHFollow = function($__super) {
    function MHFollow() {
      $traceurRuntime.superConstructor(MHFollow).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHFollow, {}, {get mhidPrefix() {
        return 'mhflw';
      }}, $__super);
  }(MHAction);
  (function() {
    MHObject.registerConstructor(MHFollow, 'MHFollow');
  })();
  return {get MHFollow() {
      return MHFollow;
    }};
});
System.registerModule("models/action/MHLike.js", [], function() {
  "use strict";
  var __moduleName = "models/action/MHLike.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHLike = function($__super) {
    function MHLike() {
      $traceurRuntime.superConstructor(MHLike).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHLike, {}, {get mhidPrefix() {
        return 'mhlke';
      }}, $__super);
  }(MHAction);
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
  var MHPost = function($__super) {
    function MHPost() {
      $traceurRuntime.superConstructor(MHPost).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHPost, {}, {
      get mhidPrefix() {
        return 'mhpst';
      },
      createWithMessage: function(message, mentions, primaryMention) {
        if (!message || !mentions || !primaryMention || typeof message !== 'string' || !Array.isArray(mentions) || !mentions.every(function(x) {
          return x instanceof MHObject;
        }) || !(primaryMention instanceof MHObject)) {
          throw new TypeError("Can't create post without message string, mentions array, and primary mention object.");
        }
        var path = this.rootSubendpoint('new'),
            mentionedMhids = mentions.map(function(m) {
              return m.metadata.mhid;
            });
        return houndRequest({
          method: 'POST',
          endpoint: path,
          data: {
            'message': message,
            'mentions': mentionedMhids,
            'primaryMention': primaryMention.metadata.mhid
          }
        }).then(function(res) {
          mentions.forEach(function(m) {
            return m.fetchSocial(true);
          });
          return res;
        });
      }
    }, $__super);
  }(MHAction);
  (function() {
    MHObject.registerConstructor(MHPost, 'MHPost');
  })();
  return {get MHPost() {
      return MHPost;
    }};
});
System.registerModule("models/source/MHSourceFormat.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceFormat.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHSourceFormat = function() {
    function MHSourceFormat(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHSourceFormat, {
      get jsonProperties() {
        return {
          type: String,
          price: String,
          currency: String,
          timePeriod: String,
          launchInfo: Object,
          contentCount: Number
        };
      },
      get displayPrice() {
        return '$' + this.price;
      }
    }, {});
  }();
  return {get MHSourceFormat() {
      return MHSourceFormat;
    }};
});
System.registerModule("models/source/MHSourceMethod.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMethod.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHSourceFormat = System.get("models/source/MHSourceFormat.js").MHSourceFormat;
  var MHSourceMethod = function() {
    function MHSourceMethod(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHSourceMethod, {
      get jsonProperties() {
        return {
          type: String,
          formats: [MHSourceFormat]
        };
      },
      formatForType: function(type) {
        return this.formats.filter(function(format) {
          return format.type === type;
        })[0];
      }
    }, {
      get TYPE_PURCHASE() {
        return 'purchase';
      },
      get TYPE_RENTAL() {
        return 'rental';
      },
      get TYPE_SUBSCRIPTION() {
        return 'subscription';
      },
      get TYPE_ADSUPPORTED() {
        return 'adSupported';
      }
    });
  }();
  return {get MHSourceMethod() {
      return MHSourceMethod;
    }};
});
System.registerModule("models/source/MHSourceMedium.js", [], function() {
  "use strict";
  var __moduleName = "models/source/MHSourceMedium.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHSourceMethod = System.get("models/source/MHSourceMethod.js").MHSourceMethod;
  var MHSourceMedium = function() {
    function MHSourceMedium(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHSourceMedium, {
      get jsonProperties() {
        return {
          type: String,
          methods: [MHSourceMethod]
        };
      },
      methodForType: function(type) {
        return this.methods.filter(function(method) {
          return method.type === type;
        })[0];
      }
    }, {
      get TYPE_STREAM() {
        return 'stream';
      },
      get TYPE_DOWNLOAD() {
        return 'download';
      },
      get TYPE_DELIVER() {
        return 'deliver';
      },
      get TYPE_PICKUP() {
        return 'pickup';
      },
      get TYPE_ATTEND() {
        return 'attend';
      }
    });
  }();
  return {get MHSourceMedium() {
      return MHSourceMedium;
    }};
});
System.registerModule("models/container/MHRelationship.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHRelationship.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHRelationship = function() {
    function MHRelationship(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHRelationship, {get jsonProperties() {
        return {
          contribution: String,
          role: String,
          object: {mapper: MHObject.create}
        };
      }}, {});
  }();
  return {get MHRelationship() {
      return MHRelationship;
    }};
});
System.registerModule("models/container/MHSorting.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHSorting.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHSorting = function() {
    function MHSorting(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHSorting, {get jsonProperties() {
        return {
          importance: Number,
          position: Number
        };
      }}, {});
  }();
  return {get MHSorting() {
      return MHSorting;
    }};
});
System.registerModule("models/container/MHContext.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHContext.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHRelationship = System.get("models/container/MHRelationship.js").MHRelationship;
  var MHSorting = System.get("models/container/MHSorting.js").MHSorting;
  var MHSourceMedium = System.get("models/source/MHSourceMedium.js").MHSourceMedium;
  var MHContext = function() {
    function MHContext(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHContext, {get jsonProperties() {
        return {
          consumable: Boolean,
          sorting: MHSorting,
          relationships: [MHRelationship],
          mediums: [MHSourceMedium]
        };
      }}, {});
  }();
  return {get MHContext() {
      return MHContext;
    }};
});
System.registerModule("models/container/MHRelationalPair.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHRelationalPair.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContext = System.get("models/container/MHContext.js").MHContext;
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHRelationalPair = function() {
    function MHRelationalPair(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHRelationalPair, {get jsonProperties() {
        return {
          context: MHContext,
          object: {mapper: MHObject.create}
        };
      }}, {});
  }();
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
  var MHRelationalPair = System.get("models/container/MHRelationalPair.js").MHRelationalPair;
  var MHUserMetadata = System.get("models/meta/MHMetadata.js").MHUserMetadata;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHUser = function($__super) {
    function MHUser() {
      $traceurRuntime.superConstructor(MHUser).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHUser, {
      get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHUser.prototype, "jsonProperties"), {metadata: MHUserMetadata});
      },
      get isCurrentUser() {
        var currentUser = System.get('../models/user/MHLoginSession.js').MHLoginSession.currentUser;
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
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchOwnedCollections: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('ownedCollections');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchSuggested: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('suggested');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchFollowing: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('following');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchFollowers: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('followers');
        return this.fetchPagedEndpoint(path, view, size, force);
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
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchFacebookFriends: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('settings') + '/facebook/friends';
        return this.fetchPagedEndpoint(path, view, size, force);
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
        var path = this.rootSubendpoint('featured');
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
  }(MHObject);
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
  var MHUserLoginEvent = function() {
    function MHUserLoginEvent() {}
    return ($traceurRuntime.createClass)(MHUserLoginEvent, {}, {create: function(mhUserObj) {
        return makeEvent('mhUserLogin', {
          bubbles: false,
          cancelable: false,
          detail: {mhUser: mhUserObj}
        });
      }});
  }();
  var MHUserLogoutEvent = function() {
    function MHUserLogoutEvent() {}
    return ($traceurRuntime.createClass)(MHUserLogoutEvent, {}, {create: function(mhUserObj) {
        return makeEvent('mhUserLogout', {
          bubbles: false,
          cancelable: false,
          detail: {mhUser: mhUserObj}
        });
      }});
  }();
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
  var MHLoginSession = function() {
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
        }).then(function(res) {
          count = res.count;
          return res;
        }).catch(function(err) {
          warn('Error fetching user count');
          error(err.error.stack);
          return count;
        });
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
        }).then(function(loginMap) {
          if (!loginMap.Error) {
            return MHObject.fetchByMhid(loginMap.mhid).then(function(mhUser) {
              return [loginMap, mhUser];
            });
          } else {
            throw new Error(loginMap.Error);
          }
        }).then(function(mhUserMap) {
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
        }).then(function(user) {
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
        }).catch(function(error) {
          throw new Error(error);
        });
      },
      logout: function() {
        var currentCookies = document.cookie.split('; ').map(function(c) {
          var keyVal = c.split('=');
          return {
            'key': keyVal[0],
            'value': keyVal[1]
          };
        });
        window.sessionStorage.currentUser = null;
        currentCookies.forEach(function(cookie) {
          if (cookie.key === 'JSESSIONID') {
            var expires = (new Date(0)).toGMTString();
            document.cookie = (cookie.key + "=" + cookie.value + "; expires=" + expires + "; domain=.mediahound.com");
          }
        });
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
        }).then(function(loginMap) {
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
        }).then(function(user) {
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
  }();
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
  var MHCollectionMetadata = System.get("models/meta/MHMetadata.js").MHCollectionMetadata;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHCollection = function($__super) {
    function MHCollection() {
      $traceurRuntime.superConstructor(MHCollection).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHCollection, {
      get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHCollection.prototype, "jsonProperties"), {
          metadata: MHCollectionMetadata,
          firstContentImage: {mapper: MHObject.create},
          primaryOwner: {mapper: MHObject.create}
        });
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
        var $__9 = this;
        if (!Array.isArray(contents)) {
          throw new TypeError('Contents must be an array in changeContents');
        }
        if (typeof sub !== 'string' || (sub !== 'add' && sub !== 'remove')) {
          throw new TypeError('Subendpoint must be add or remove');
        }
        var path = this.subendpoint(sub),
            mhids = contents.map(function(v) {
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
            }).filter(function(v) {
              return v !== null;
            });
        this.mixlistPromise = null;
        if (mhids.length > -1) {
          log('content array to be submitted: ', mhids);
          return (this.content = houndRequest({
            method: 'PUT',
            endpoint: path,
            data: {'content': mhids}
          }).catch((function(err) {
            $__9.content = null;
            throw err;
          }).bind(this)).then(function(response) {
            contents.forEach(function(v) {
              return typeof v.fetchSocial === 'function' && v.fetchSocial(true);
            });
            return response;
          }));
        } else {
          console.error('To add or remove content from a Collection the content array must include at least one MHObject');
        }
      },
      fetchOwners: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('owners');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchContent: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('content');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchMixlist: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('mixlist');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      get MIXLIST_TYPE_NONE() {
        return 'none';
      },
      get MIXLIST_TYPE_PARTIAL() {
        return 'partial';
      },
      get MIXLIST_TYPE_FULL() {
        return 'full';
      },
      get mhidPrefix() {
        return 'mhcol';
      },
      get rootEndpoint() {
        return 'graph/collection';
      },
      createWithName: function(name, description) {
        var path = this.rootSubendpoint('new');
        var data = {};
        if (name) {
          data.name = name;
        }
        if (description) {
          data.description = description;
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
      }
    }, $__super);
  }(MHObject);
  (function() {
    MHObject.registerConstructor(MHCollection, 'MHCollection');
  })();
  return {get MHCollection() {
      return MHCollection;
    }};
});
System.registerModule("models/container/MHPagingInfo.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHPagingInfo.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHPagingInfo = function() {
    function MHPagingInfo(args) {
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHPagingInfo, {get jsonProperties() {
        return {next: String};
      }}, {});
  }();
  return {get MHPagingInfo() {
      return MHPagingInfo;
    }};
});
System.registerModule("models/container/MHPagedResponse.js", [], function() {
  "use strict";
  var __moduleName = "models/container/MHPagedResponse.js";
  var jsonCreateWithArgs = System.get("models/internal/jsonParse.js").jsonCreateWithArgs;
  var MHPagingInfo = System.get("models/container/MHPagingInfo.js").MHPagingInfo;
  var MHRelationalPair = System.get("models/container/MHRelationalPair.js").MHRelationalPair;
  var MHPagedResponse = function() {
    function MHPagedResponse(args) {
      this.cachedNextResponse = null;
      this.fetchNextOperation = null;
      jsonCreateWithArgs(args, this);
    }
    return ($traceurRuntime.createClass)(MHPagedResponse, {
      get jsonProperties() {
        return {
          content: [MHRelationalPair],
          pagingInfo: MHPagingInfo
        };
      },
      get hasMorePages() {
        return (this.pagingInfo.next !== undefined && this.pagingInfo.next !== null);
      },
      fetchNext: function() {
        var cachedResponse = this.cachedNextResponse;
        if (cachedResponse) {
          return new Promise(function(resolve) {
            resolve(cachedResponse);
          });
        }
        return this.fetchNextOperation(this.pagingInfo.next).then(function(response) {
          this.cachedNextResponse = response;
          return response;
        });
      }
    }, {});
  }();
  return {get MHPagedResponse() {
      return MHPagedResponse;
    }};
});
System.registerModule("models/contributor/MHContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributorMetadata = System.get("models/meta/MHMetadata.js").MHContributorMetadata;
  var MHContributor = function($__super) {
    function MHContributor() {
      $traceurRuntime.superConstructor(MHContributor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHContributor, {
      get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHContributor.prototype, "jsonProperties"), {metadata: MHContributorMetadata});
      },
      get isGroup() {
        return !this.isIndividual;
      },
      get isFictional() {
        return !this.isReal;
      },
      fetchMedia: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('media');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {get rootEndpoint() {
        return 'graph/contributor';
      }}, $__super);
  }(MHObject);
  return {get MHContributor() {
      return MHContributor;
    }};
});
System.registerModule("models/contributor/MHFictionalGroupContributor.js", [], function() {
  "use strict";
  var __moduleName = "models/contributor/MHFictionalGroupContributor.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHContributor = System.get("models/contributor/MHContributor.js").MHContributor;
  var MHFictionalGroupContributor = function($__super) {
    function MHFictionalGroupContributor() {
      $traceurRuntime.superConstructor(MHFictionalGroupContributor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHFictionalGroupContributor, {
      get isIndividual() {
        return false;
      },
      get isReal() {
        return false;
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('contributors');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {get mhidPrefix() {
        return 'mhfgc';
      }}, $__super);
  }(MHContributor);
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
  var MHFictionalIndividualContributor = function($__super) {
    function MHFictionalIndividualContributor() {
      $traceurRuntime.superConstructor(MHFictionalIndividualContributor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHFictionalIndividualContributor, {
      get isIndividual() {
        return true;
      },
      get isReal() {
        return false;
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('contributors');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {get mhidPrefix() {
        return 'mhfic';
      }}, $__super);
  }(MHContributor);
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
  var MHRealGroupContributor = function($__super) {
    function MHRealGroupContributor() {
      $traceurRuntime.superConstructor(MHRealGroupContributor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHRealGroupContributor, {
      get isIndividual() {
        return false;
      },
      get isReal() {
        return true;
      },
      fetchCharacters: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('characters');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {get mhidPrefix() {
        return 'mhrgc';
      }}, $__super);
  }(MHContributor);
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
  var MHRealIndividualContributor = function($__super) {
    function MHRealIndividualContributor() {
      $traceurRuntime.superConstructor(MHRealIndividualContributor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHRealIndividualContributor, {
      get isIndividual() {
        return true;
      },
      get isReal() {
        return true;
      },
      fetchCharacters: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : true;
        var path = this.subendpoint('characters');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {get mhidPrefix() {
        return 'mhric';
      }}, $__super);
  }(MHContributor);
  (function() {
    MHObject.registerConstructor(MHRealIndividualContributor, 'MHRealIndividualContributor');
  }());
  return {get MHRealIndividualContributor() {
      return MHRealIndividualContributor;
    }};
});
System.registerModule("models/hashtag/MHHashtag.js", [], function() {
  "use strict";
  var __moduleName = "models/hashtag/MHHashtag.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHHashtagMetadata = System.get("models/meta/MHMetadata.js").MHHashtagMetadata;
  var MHHashtag = function($__super) {
    function MHHashtag() {
      $traceurRuntime.superConstructor(MHHashtag).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHHashtag, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHHashtag.prototype, "jsonProperties"), {metadata: MHHashtagMetadata});
      }}, {
      get mhidPrefix() {
        return 'mhhtg';
      },
      get rootEndpoint() {
        return 'graph/hashtag';
      },
      fetchByName: function(name) {
        var view = arguments[1] !== (void 0) ? arguments[1] : 'full';
        if (!name || (typeof name !== 'string' && !(name instanceof String))) {
          throw new TypeError('Hashtag not of type String in fetchByTag');
        }
        var path = this.rootSubendpoint('/lookup/' + name);
        return houndRequest({
          method: 'GET',
          endpoint: path,
          params: {view: view}
        }).then(function(response) {
          var newObj = MHObject.create(response);
          return newObj;
        });
      }
    }, $__super);
  }(MHObject);
  (function() {
    MHObject.registerConstructor(MHHashtag, 'MHHashtag');
  })();
  return {get MHHashtag() {
      return MHHashtag;
    }};
});
System.registerModule("models/image/MHImage.js", [], function() {
  "use strict";
  var __moduleName = "models/image/MHImage.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHImageMetadata = System.get("models/meta/MHMetadata.js").MHImageMetadata;
  var MHImage = function($__super) {
    function MHImage() {
      $traceurRuntime.superConstructor(MHImage).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHImage, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHImage.prototype, "jsonProperties"), {metadata: MHImageMetadata});
      }}, {
      get mhidPrefix() {
        return 'mhimg';
      },
      get rootEndpoint() {
        return 'graph/image';
      }
    }, $__super);
  }(MHObject);
  (function() {
    MHObject.registerConstructor(MHImage, 'MHImage');
  }());
  return {get MHImage() {
      return MHImage;
    }};
});
System.registerModule("models/media/MHMedia.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHMedia.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHRelationalPair = System.get("models/container/MHRelationalPair.js").MHRelationalPair;
  var MHMediaMetadata = System.get("models/meta/MHMetadata.js").MHMediaMetadata;
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHMedia = function($__super) {
    function MHMedia() {
      $traceurRuntime.superConstructor(MHMedia).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMedia, {
      get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHMedia.prototype, "jsonProperties"), {
          metadata: MHMediaMetadata,
          keyContributors: [MHRelationalPair],
          primaryGroup: MHRelationalPair
        });
      },
      fetchContent: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('content');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchSources: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 20;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('sources');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchContributors: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('contributors');
        return this.fetchPagedEndpoint(path, view, size, force);
      },
      fetchRelated: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : 'full';
        var size = arguments[1] !== (void 0) ? arguments[1] : 12;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.subendpoint('related');
        return this.fetchPagedEndpoint(path, view, size, force);
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
        var force = arguments[3] !== (void 0) ? arguments[3] : false;
        var mhids = medias.map(function(m) {
          return m.metadata.mhid;
        });
        var path = this.rootSubendpoint('related');
        var params = {ids: mhids};
        return this.fetchRootPagedEndpoint(path, params, view, size, force);
      }
    }, $__super);
  }(MHObject);
  return {get MHMedia() {
      return MHMedia;
    }};
});
System.registerModule("models/media/MHAlbum.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHAlbum.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHAlbum = function($__super) {
    function MHAlbum() {
      $traceurRuntime.superConstructor(MHAlbum).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAlbum, {}, {get mhidPrefix() {
        return 'mhalb';
      }}, $__super);
  }(MHMedia);
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
  var MHAlbumSeries = function($__super) {
    function MHAlbumSeries() {
      $traceurRuntime.superConstructor(MHAlbumSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAlbumSeries, {}, {get mhidPrefix() {
        return 'mhals';
      }}, $__super);
  }(MHMedia);
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
  var MHAnthology = function($__super) {
    function MHAnthology() {
      $traceurRuntime.superConstructor(MHAnthology).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAnthology, {}, {get mhidPrefix() {
        return 'mhath';
      }}, $__super);
  }(MHMedia);
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
  var MHBook = function($__super) {
    function MHBook() {
      $traceurRuntime.superConstructor(MHBook).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHBook, {}, {get mhidPrefix() {
        return 'mhbok';
      }}, $__super);
  }(MHMedia);
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
  var MHBookSeries = function($__super) {
    function MHBookSeries() {
      $traceurRuntime.superConstructor(MHBookSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHBookSeries, {}, {get mhidPrefix() {
        return 'mhbks';
      }}, $__super);
  }(MHMedia);
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
  var MHComicBook = function($__super) {
    function MHComicBook() {
      $traceurRuntime.superConstructor(MHComicBook).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHComicBook, {}, {get mhidPrefix() {
        return 'mhcbk';
      }}, $__super);
  }(MHMedia);
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
  var MHComicBookSeries = function($__super) {
    function MHComicBookSeries() {
      $traceurRuntime.superConstructor(MHComicBookSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHComicBookSeries, {}, {get mhidPrefix() {
        return 'mhcbs';
      }}, $__super);
  }(MHMedia);
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
  var MHGame = function($__super) {
    function MHGame() {
      $traceurRuntime.superConstructor(MHGame).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGame, {}, {get mhidPrefix() {
        return 'mhgam';
      }}, $__super);
  }(MHMedia);
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
  var MHGameSeries = function($__super) {
    function MHGameSeries() {
      $traceurRuntime.superConstructor(MHGameSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGameSeries, {}, {get mhidPrefix() {
        return 'mhgms';
      }}, $__super);
  }(MHMedia);
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
  var MHGraphicNovel = function($__super) {
    function MHGraphicNovel() {
      $traceurRuntime.superConstructor(MHGraphicNovel).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGraphicNovel, {}, {get mhidPrefix() {
        return 'mhgnl';
      }}, $__super);
  }(MHMedia);
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
  var MHGraphicNovelSeries = function($__super) {
    function MHGraphicNovelSeries() {
      $traceurRuntime.superConstructor(MHGraphicNovelSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGraphicNovelSeries, {}, {get mhidPrefix() {
        return 'mhgns';
      }}, $__super);
  }(MHMedia);
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
  var MHMovie = function($__super) {
    function MHMovie() {
      $traceurRuntime.superConstructor(MHMovie).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMovie, {}, {get mhidPrefix() {
        return 'mhmov';
      }}, $__super);
  }(MHMedia);
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
  var MHMovieSeries = function($__super) {
    function MHMovieSeries() {
      $traceurRuntime.superConstructor(MHMovieSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMovieSeries, {}, {get mhidPrefix() {
        return 'mhmvs';
      }}, $__super);
  }(MHMedia);
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
  var MHMusicVideo = function($__super) {
    function MHMusicVideo() {
      $traceurRuntime.superConstructor(MHMusicVideo).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMusicVideo, {}, {get mhidPrefix() {
        return 'mhmsv';
      }}, $__super);
  }(MHMedia);
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
  var MHNovella = function($__super) {
    function MHNovella() {
      $traceurRuntime.superConstructor(MHNovella).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHNovella, {}, {get mhidPrefix() {
        return 'mhnov';
      }}, $__super);
  }(MHMedia);
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
  var MHPeriodical = function($__super) {
    function MHPeriodical() {
      $traceurRuntime.superConstructor(MHPeriodical).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHPeriodical, {}, {get mhidPrefix() {
        return 'mhpdc';
      }}, $__super);
  }(MHMedia);
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
  var MHPeriodicalSeries = function($__super) {
    function MHPeriodicalSeries() {
      $traceurRuntime.superConstructor(MHPeriodicalSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHPeriodicalSeries, {}, {get mhidPrefix() {
        return 'mhpds';
      }}, $__super);
  }(MHMedia);
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
  var MHShowEpisode = function($__super) {
    function MHShowEpisode() {
      $traceurRuntime.superConstructor(MHShowEpisode).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHShowEpisode, {}, {get mhidPrefix() {
        return 'mhsep';
      }}, $__super);
  }(MHMedia);
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
  var MHShowSeason = function($__super) {
    function MHShowSeason() {
      $traceurRuntime.superConstructor(MHShowSeason).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHShowSeason, {}, {get mhidPrefix() {
        return 'mhssn';
      }}, $__super);
  }(MHMedia);
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
  var MHShowSeries = function($__super) {
    function MHShowSeries() {
      $traceurRuntime.superConstructor(MHShowSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHShowSeries, {}, {get mhidPrefix() {
        return 'mhsss';
      }}, $__super);
  }(MHMedia);
  (function() {
    MHObject.registerConstructor(MHShowSeries, 'MHShowSeries');
  })();
  return {get MHShowSeries() {
      return MHShowSeries;
    }};
});
System.registerModule("models/media/MHSpecial.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHSpecial.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHSpecial = function($__super) {
    function MHSpecial() {
      $traceurRuntime.superConstructor(MHSpecial).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSpecial, {}, {get mhidPrefix() {
        return 'mhspc';
      }}, $__super);
  }(MHMedia);
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
  var MHSpecialSeries = function($__super) {
    function MHSpecialSeries() {
      $traceurRuntime.superConstructor(MHSpecialSeries).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSpecialSeries, {}, {get mhidPrefix() {
        return 'mhsps';
      }}, $__super);
  }(MHMedia);
  (function() {
    MHObject.registerConstructor(MHSpecialSeries, 'MHSpecialSeries');
  })();
  return {get MHSpecialSeries() {
      return MHSpecialSeries;
    }};
});
System.registerModule("models/media/MHTrack.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHTrack.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHTrack = function($__super) {
    function MHTrack() {
      $traceurRuntime.superConstructor(MHTrack).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHTrack, {}, {get mhidPrefix() {
        return 'mhsng';
      }}, $__super);
  }(MHMedia);
  (function() {
    MHObject.registerConstructor(MHTrack, 'MHTrack');
  })();
  return {get MHTrack() {
      return MHTrack;
    }};
});
System.registerModule("models/media/MHTrailer.js", [], function() {
  "use strict";
  var __moduleName = "models/media/MHTrailer.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHMedia = System.get("models/media/MHMedia.js").MHMedia;
  var MHTrailer = function($__super) {
    function MHTrailer() {
      $traceurRuntime.superConstructor(MHTrailer).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHTrailer, {}, {get mhidPrefix() {
        return 'mhtrl';
      }}, $__super);
  }(MHMedia);
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
  var MHSourceMetadata = System.get("models/meta/MHMetadata.js").MHSourceMetadata;
  var MHSource = function($__super) {
    function MHSource() {
      $traceurRuntime.superConstructor(MHSource).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSource, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHSource.prototype, "jsonProperties"), {
          metadata: MHSourceMetadata,
          subscriptions: [{mapper: MHObject.create}]
        });
      }}, {
      get rootEndpoint() {
        return 'graph/source';
      },
      get mhidPrefix() {
        return 'mhsrc';
      },
      fetchAllSources: function() {
        var view = arguments[0] !== (void 0) ? arguments[0] : "full";
        var size = arguments[1] !== (void 0) ? arguments[1] : 100;
        var force = arguments[2] !== (void 0) ? arguments[2] : false;
        var path = this.rootSubendpoint('all');
        return this.fetchRootPagedEndpoint(path, {}, view, size, force);
      }
    }, $__super);
  }(MHObject);
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
  var MHSubscriptionMetadata = System.get("models/meta/MHMetadata.js").MHSubscriptionMetadata;
  var MHSubscription = function($__super) {
    function MHSubscription() {
      $traceurRuntime.superConstructor(MHSubscription).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSubscription, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHSubscription.prototype, "jsonProperties"), {metadata: MHSubscriptionMetadata});
      }}, {
      get mhidPrefix() {
        return 'mhsub';
      },
      get rootEndpoint() {
        return 'graph/subscription';
      }
    }, $__super);
  }(MHObject);
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
  var MHTraitMetadata = System.get("models/meta/MHMetadata.js").MHTraitMetadata;
  var MHTrait = function($__super) {
    function MHTrait() {
      $traceurRuntime.superConstructor(MHTrait).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHTrait, {get jsonProperties() {
        return Object.assign({}, $traceurRuntime.superGet(this, MHTrait.prototype, "jsonProperties"), {metadata: MHTraitMetadata});
      }}, {get rootEndpoint() {
        return 'graph/trait';
      }}, $__super);
  }(MHObject);
  return {get MHTrait() {
      return MHTrait;
    }};
});
System.registerModule("models/trait/MHAchievement.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAchievement.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHAchievement = function($__super) {
    function MHAchievement() {
      $traceurRuntime.superConstructor(MHAchievement).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAchievement, {}, {get mhidPrefix() {
        return 'mhach';
      }}, $__super);
  }(MHTrait);
  (function() {
    MHObject.registerConstructor(MHAchievement, 'MHAchievement');
  })();
  return {get MHAchievement() {
      return MHAchievement;
    }};
});
System.registerModule("models/trait/MHAudience.js", [], function() {
  "use strict";
  var __moduleName = "models/trait/MHAudience.js";
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHAudience = function($__super) {
    function MHAudience() {
      $traceurRuntime.superConstructor(MHAudience).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHAudience, {}, {get mhidPrefix() {
        return 'mhaud';
      }}, $__super);
  }(MHTrait);
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
  var MHEra = function($__super) {
    function MHEra() {
      $traceurRuntime.superConstructor(MHEra).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHEra, {}, {get mhidPrefix() {
        return 'mhera';
      }}, $__super);
  }(MHTrait);
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
  var MHFlag = function($__super) {
    function MHFlag() {
      $traceurRuntime.superConstructor(MHFlag).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHFlag, {}, {get mhidPrefix() {
        return 'mhflg';
      }}, $__super);
  }(MHTrait);
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
  var MHGenre = function($__super) {
    function MHGenre() {
      $traceurRuntime.superConstructor(MHGenre).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGenre, {}, {get mhidPrefix() {
        return 'mhgnr';
      }}, $__super);
  }(MHTrait);
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
  var MHGraphGenre = function($__super) {
    function MHGraphGenre() {
      $traceurRuntime.superConstructor(MHGraphGenre).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHGraphGenre, {}, {get mhidPrefix() {
        return 'mhgrg';
      }}, $__super);
  }(MHTrait);
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
  var MHMaterialSource = function($__super) {
    function MHMaterialSource() {
      $traceurRuntime.superConstructor(MHMaterialSource).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMaterialSource, {}, {get mhidPrefix() {
        return 'mhmts';
      }}, $__super);
  }(MHTrait);
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
  var MHMood = function($__super) {
    function MHMood() {
      $traceurRuntime.superConstructor(MHMood).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHMood, {}, {get mhidPrefix() {
        return 'mhmod';
      }}, $__super);
  }(MHTrait);
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
  var MHQuality = function($__super) {
    function MHQuality() {
      $traceurRuntime.superConstructor(MHQuality).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHQuality, {}, {get mhidPrefix() {
        return 'mhqlt';
      }}, $__super);
  }(MHTrait);
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
  var MHStoryElement = function($__super) {
    function MHStoryElement() {
      $traceurRuntime.superConstructor(MHStoryElement).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHStoryElement, {}, {get mhidPrefix() {
        return 'mhstr';
      }}, $__super);
  }(MHTrait);
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
  var MHStyleElement = function($__super) {
    function MHStyleElement() {
      $traceurRuntime.superConstructor(MHStyleElement).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHStyleElement, {}, {get mhidPrefix() {
        return 'mhsty';
      }}, $__super);
  }(MHTrait);
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
  var MHSubGenre = function($__super) {
    function MHSubGenre() {
      $traceurRuntime.superConstructor(MHSubGenre).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHSubGenre, {}, {get mhidPrefix() {
        return 'mhsgn';
      }}, $__super);
  }(MHTrait);
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
  var MHTheme = function($__super) {
    function MHTheme() {
      $traceurRuntime.superConstructor(MHTheme).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(MHTheme, {}, {get mhidPrefix() {
        return 'mhthm';
      }}, $__super);
  }(MHTrait);
  (function() {
    MHObject.registerConstructor(MHTheme, 'MHTheme');
  })();
  return {get MHTheme() {
      return MHTheme;
    }};
});
System.registerModule("search/MHSearch.js", [], function() {
  "use strict";
  var __moduleName = "search/MHSearch.js";
  var houndRequest = System.get("request/hound-request.js").houndRequest;
  var MHPagedResponse = System.get("models/container/MHPagedResponse.js").MHPagedResponse;
  var MHSearch = function() {
    function MHSearch() {}
    return ($traceurRuntime.createClass)(MHSearch, {}, {
      fetchResultsForSearchTerm: function(searchTerm, scopes) {
        var size = arguments[2] !== (void 0) ? arguments[2] : 12;
        var next = arguments[3] !== (void 0) ? arguments[3] : null;
        var path = 'search/all/' + houndRequest.extraEncode(searchTerm);
        var promise;
        if (next) {
          promise = houndRequest({
            method: 'GET',
            url: next
          });
        } else {
          var params = {pageSize: size};
          if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
            params.types = scopes;
          }
          promise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: params
          });
        }
        promise.then(function(response) {
          var $__4 = this;
          var pagedResponse = new MHPagedResponse(response);
          pagedResponse.fetchNextOperation = (function(newNext) {
            return $__4.fetchResultsForSearchTerm(searchTerm, scopes, size, newNext);
          });
          return pagedResponse;
        });
      },
      get SCOPE_ALL() {
        return 'all';
      },
      get SCOPE_MOVIE() {
        return 'movie';
      },
      get SCOPE_TRACK() {
        return 'track';
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
  }();
  return {get MHSearch() {
      return MHSearch;
    }};
});
System.registerModule("hound-api.js", [], function() {
  "use strict";
  var __moduleName = "hound-api.js";
  var MHSDK = System.get("models/sdk/MHSDK.js").MHSDK;
  var MHObject = System.get("models/base/MHObject.js").MHObject;
  var MHAction = System.get("models/action/MHAction.js").MHAction;
  var MHAdd = System.get("models/action/MHAdd.js").MHAdd;
  var MHComment = System.get("models/action/MHComment.js").MHComment;
  var MHCreate = System.get("models/action/MHCreate.js").MHCreate;
  var MHLike = System.get("models/action/MHLike.js").MHLike;
  var MHFollow = System.get("models/action/MHFollow.js").MHFollow;
  var MHPost = System.get("models/action/MHPost.js").MHPost;
  var MHHashtag = System.get("models/hashtag/MHHashtag.js").MHHashtag;
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
  var MHTrack = System.get("models/media/MHTrack.js").MHTrack;
  var MHSpecial = System.get("models/media/MHSpecial.js").MHSpecial;
  var MHSpecialSeries = System.get("models/media/MHSpecialSeries.js").MHSpecialSeries;
  var MHTrailer = System.get("models/media/MHTrailer.js").MHTrailer;
  var MHCollection = System.get("models/collection/MHCollection.js").MHCollection;
  var MHMetadata = System.get("models/meta/MHMetadata.js").MHMetadata;
  var MHImage = System.get("models/image/MHImage.js").MHImage;
  var MHContext = System.get("models/container/MHContext.js").MHContext;
  var MHPagedResponse = System.get("models/container/MHPagedResponse.js").MHPagedResponse;
  var MHRelationalPair = System.get("models/container/MHRelationalPair.js").MHRelationalPair;
  var MHTrait = System.get("models/trait/MHTrait.js").MHTrait;
  var MHGenre = System.get("models/trait/MHGenre.js").MHGenre;
  var MHSubGenre = System.get("models/trait/MHSubGenre.js").MHSubGenre;
  var MHMood = System.get("models/trait/MHMood.js").MHMood;
  var MHQuality = System.get("models/trait/MHQuality.js").MHQuality;
  var MHStyleElement = System.get("models/trait/MHStyleElement.js").MHStyleElement;
  var MHStoryElement = System.get("models/trait/MHStoryElement.js").MHStoryElement;
  var MHMaterialSource = System.get("models/trait/MHMaterialSource.js").MHMaterialSource;
  var MHTheme = System.get("models/trait/MHTheme.js").MHTheme;
  var MHAchievement = System.get("models/trait/MHAchievement.js").MHAchievement;
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
  var MHSearch = System.get("search/MHSearch.js").MHSearch;
  delete MHObject.registerConstructor;
  var $__default = {
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
    get MHTrack() {
      return MHTrack;
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
    get MHMetadata() {
      return MHMetadata;
    },
    get MHTrait() {
      return MHTrait;
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
    get MHAchievement() {
      return MHAchievement;
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
    get MHSearch() {
      return MHSearch;
    }
  };
  return {get default() {
      return $__default;
    }};
});
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') { module.exports = System.get("hound-api.js" + '').default; }
