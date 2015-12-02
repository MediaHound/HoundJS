(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('../models/container/MHPagedResponse.js')) :
  typeof define === 'function' && define.amd ? define('HoundJS', ['../models/container/MHPagedResponse.js'], factory) :
  global.HoundJS = factory(global.___models_container_MHPagedResponse_js);
}(this, function (___models_container_MHPagedResponse_js) { 'use strict';

  var babelHelpers = {};

  babelHelpers.typeof = function (obj) {
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  babelHelpers.get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  babelHelpers;
  // Logging Helper
  var debug = {
    log: false,
    warn: true, //( (/(local\.mediahound\.com:2014)|(stag-www\.mediahound\.com)/).test(window.location.host) ),
    error: true //( (/(local\.mediahound\.com:2014)|(stag-www\.mediahound\.com)/).test(window.location.host) )
  };

  var isDevAndDebug = function isDevAndDebug() {

    if (typeof window !== 'undefined') {
      return window.mhDebug && window.location.host === 'local.mediahound.com:2014';
    } else {
      return false;
    }
  };

  // TODO change so that log takes override and returns console function so that console shows correct line number
  var log = function log(override) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.log && (override || debug.log || isDevAndDebug())) {
      console.log.apply(console, arguments);
    }
  };

  /*
  export var log = function(...args){
    if( typeof args[0] !== 'boolean' ){
      return log(false);
    }
    if( console && console.log && ( args[0] || debug.log || isDevAndDebug() ) ){
      return console.log.bind(console);
    }
  };
   */

  var warn = function warn(override) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.warn && (override || debug.warn || isDevAndDebug())) {
      console.warn.apply(console, args);
    }
  };

  var error = function error(override) {
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    if (typeof override !== 'boolean') {
      args.unshift(override);
      override = false;
    }
    if (console && console.error && (override || debug.error || isDevAndDebug())) {
      console.error.apply(console, args);
    }
  };

  /**
   * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
   * recently used items while discarding least recently used items when its limit
   * is reached.
   *
   * Implementation inspired by:
   *    Rasmus Andersson <http://hunch.se/>
   *    https://github.com/rsms/js-lru
   *
   * Licensed under MIT. Copyright (c) 2014 MediaHound Inc. <http://mediahound.com/>
   *
   * Items are added to the end of the list, that means that the tail is the newest item
   * and the head is the oldest item.
   *
   * head(oldest) --.newer--> entry --.newer--> tail(newest)
   *    and
   * head(oldest) <--older.-- entry <--older.-- tail(newest)
   *
   */

  var keymapSym = Symbol('keymap');

  var MHCache = (function () {
    function MHCache(limit) {
      babelHelpers.classCallCheck(this, MHCache);

      // Current size of the cache.
      this.size = 0;

      // Maximum number of items this cache can hold.
      this.limit = limit;
      this[keymapSym] = {};
    }

    /**
     * Put <value> into the cache associated with <key>. Returns the entry which was
     * removed to make room for the new entry. Otherwise undefined is returned
     * (i.e. if there was enough room already).
     *
     * TODO: Bug if put same value can get multiple instances of entry in list
     */

    babelHelpers.createClass(MHCache, [{
      key: 'put',
      value: function put(key, value, altId) {
        var entry = { key: key, value: value, altId: altId };
        log('putting: ', entry);
        // Note: No protection against replacing, and thus orphan entries. By design.
        this[keymapSym][key] = entry;

        if (this.tail) {
          // link previous tail to the new tail (entry)
          this.tail.newer = entry;
          entry.older = this.tail;
        } else {
          // we're first in -- yay
          this.head = entry;
        }
        // add new entry to the end of the linked list -- it's now the freshest entry.
        this.tail = entry;
        if (this.size === this.limit) {
          // we hit the limit -- remove the head
          return this.shift();
        } else {
          // increase the size counter
          this.size++;
        }
      }

      // convenience for putting an MHObject

    }, {
      key: 'putMHObj',
      value: function putMHObj(mhObj) {
        if (mhObj && mhObj.metadata.mhid && mhObj.metadata.username) {
          return this.put(mhObj.metadata.mhid, mhObj, mhObj.metadata.username);
        }
        if (mhObj && mhObj.metadata.mhid) {
          return this.put(mhObj.metadata.mhid, mhObj, mhObj.metadata.altId);
        }
      }

      /**
       * Purge the least recently used (oldest) entry from the cache. Returns the
       * removed entry or undefined if the cache was empty.
       *
       * If you need to perform any form of finalization of purged items, this is a
       * good place to do it. Simply override/replace this function:
       *
       *   var c = new MHCache(123);
       *   c.shift = function() {
       *     var entry = MHCache.prototype.shift.call(this);
       *     doSomethingWith(entry);
       *     return entry;
       *   }
       */

    }, {
      key: 'shift',
      value: function shift() {
        // todo: handle special case when limit == 1
        var entry = this.head;
        if (entry) {
          if (this.head.newer) {
            this.head = this.head.newer;
            this.head.older = undefined;
          } else {
            this.head = undefined;
          }
          // Remove last strong reference to <entry> and remove links from the purged
          // entry being returned:
          entry.newer = entry.older = undefined;
          // delete is slow, but we need to do this to avoid uncontrollable growth:
          delete this[keymapSym][entry.key];
        }
        return entry;
      }

      /**
       * Get and register recent use of <key>. Returns the value associated with <key>
       * or undefined if not in cache.
       */

    }, {
      key: 'get',
      value: function get(key) {
        // First, find our cache entry
        var entry = this[keymapSym][key];
        if (entry === undefined) {
          return;
        } // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        if (entry === this.tail) {
          // Already the most recently used entry, so no need to update the list
          log('getting from cache (is tail): ', entry);
          return entry.value;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry.newer) {
          if (entry === this.head) {
            this.head = entry.newer;
          }
          entry.newer.older = entry.older; // C <-- E.
        }
        if (entry.older) {
          entry.older.newer = entry.newer; // C. --> E
        }
        entry.newer = undefined; // D --x
        entry.older = this.tail; // D. --> E
        if (this.tail) {
          this.tail.newer = entry; // E. <-- D
        }
        this.tail = entry;
        log('getting from cache: ', entry);
        return entry.value;
      }

      /**
       *
       * @param altId
       * @returns {MHObject|undefined}
       */

    }, {
      key: 'getByAltId',
      value: function getByAltId(altId) {
        var entry = this.tail;
        while (entry) {
          if (entry.altId === altId) {
            log('found altId ' + altId + ', getting from cache');
            return this.get(entry.key);
          }
          entry = entry.older;
        }
      }

      /**
       * Check if <key> is in the cache without registering recent use. Feasible if
       * you do not want to change the state of the cache, but only "peek" at it.
       * Returns the entry associated with <key> if found, or undefined if not found.
       */

    }, {
      key: 'find',
      value: function find(key) {
        return this[keymapSym][key];
      }

      /**
       * Check if <key> is in the cache without registering recent use.
       * Returns true if key exists.
       */

    }, {
      key: 'has',
      value: function has(key) {
        return this[keymapSym][key] !== undefined;
      }

      /**
       *
       * @param altId
       * @returns {boolean}
       */

    }, {
      key: 'hasAltId',
      value: function hasAltId(altId) {
        var entry = this.tail;
        while (entry) {
          if (entry.altId === altId) {
            return true;
          }
          entry = entry.older;
        }
        return false;
      }

      /**
       * Remove entry <key> from cache and return its value. Returns undefined if not
       * found.
       */

    }, {
      key: 'remove',
      value: function remove(key) {
        var entry = this[keymapSym][key];
        if (!entry) {
          return;
        }
        delete this[keymapSym][entry.key];
        if (entry.newer && entry.older) {
          // link the older entry with the newer entry
          entry.older.newer = entry.newer;
          entry.newer.older = entry.older;
        } else if (entry.newer) {
          // remove the link to us
          entry.newer.older = undefined;
          // link the newer entry to head
          this.head = entry.newer;
        } else if (entry.older) {
          // remove the link to us
          entry.older.newer = undefined;
          // link the newer entry to head
          this.tail = entry.older;
        } else {
          this.head = this.tail = undefined;
        }

        this.size--;
        return entry.value;
      }

      /** Removes all entries */

    }, {
      key: 'removeAll',
      value: function removeAll() {
        // This should be safe, as we never expose strong references to the outside
        this.head = this.tail = undefined;
        this.size = 0;
        this[keymapSym] = {};
      }

      /**
       * Get all keys stored in keymap
       * Array returned is in an arbitrary order
       */

    }, {
      key: 'keys',
      value: function keys() {
        return Object.keys(this[keymapSym]);
      }
    }, {
      key: 'forEach',
      value: function forEach(callback) {
        if (typeof callback === 'function') {
          var entry = this.head,
              index = 0;
          while (entry) {
            callback(entry.value, index, this);
            index++;
            entry = entry.newer;
          }
        }
      }

      /**
       * Create an array of stored objects and
       * @param {string='mhLocalCache'} storageKey - key to save to local storage to
       *
       * save to localStorage
       * objects are JSON.stringiy-ed with promise properties removed
       *
       */

    }, {
      key: 'saveToLocalStorage',
      value: function saveToLocalStorage() {
        var storageKey = arguments.length <= 0 || arguments[0] === undefined ? 'mhLocalCache' : arguments[0];

        var arr = [],
            entry = this.head,
            replacer = function replacer(key, value) {
          if (/promise|request/gi.test(key)) {
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
      }

      /**
       * Fill cache localStorage.mhLocalCache
       * @param {string='mhLocalCache'} storageKey
       */

    }, {
      key: 'restoreFromLocalStorage',
      value: function restoreFromLocalStorage() {
        var storageKey = arguments.length <= 0 || arguments[0] === undefined ? 'mhLocalCache' : arguments[0];

        var MHObject = System.get('../../src/models/base/MHObject.js').MHObject;
        //console.log('circular dep: ', MHObject);

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
    }]);
    return MHCache;
  })();

  var xhrc;

  // Use XMLHttpRequest from a browser or shim it in Ndoe with xmlhttprequest-cookie.
  if (typeof window !== 'undefined') {
    if (!window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest())) {
      throw new Error("No XMLHttpRequest 2 Object found, please update your browser.");
    } else {
      xhrc = window;
    }
  } else if (typeof window === 'undefined') {
    xhrc = require("xmlhttprequest-cookie");
  }

  var extraEncode$1 = function extraEncode(str) {
    // encodeURIComponent then encode - _ . ! ~ * ' ( ) as well
    return encodeURIComponent(str).replace(/\-/g, "%2D").replace(/\_/g, "%5F").replace(/\./g, "%2E").replace(/\!/g, "%21").replace(/\~/g, "%7E").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
  };
  var promiseRequest = function promiseRequest(args) {
    var prop,
        method = args.method || 'GET',
        url = args.url || null,
        params = args.params || null,
        data = args.data || null,
        headers = args.headers || null,
        withCreds = args.withCredentials !== undefined ? args.withCredentials : true,
        onprogress = args.onprogress || null,
        xhr = new xhrc.XMLHttpRequest();

    // Check for url
    if (url === null) {
      throw new TypeError('url was null or undefined in arguments object', 'promiseRequest.js', 70);
    }

    // Add params
    if (params !== null) {
      // If the URL already contains a ?, then we won't add one
      if (url.indexOf('?') === -1) {
        url += '?';
      }
      for (prop in params) {
        if (params.hasOwnProperty(prop)) {
          if (url[url.length - 1] !== '?') {
            url += '&';
          }
          if (typeof params[prop] === 'string' || params[prop] instanceof String) {
            url += encodeURIComponent(prop) + '=' + extraEncode$1(params[prop]).replace('%20', '+');
          } else if (Array.isArray(params[prop]) || params[prop] instanceof Array) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = params[prop][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var p = _step.value;

                url += encodeURIComponent(prop) + '=' + extraEncode$1(p).replace('%20', '+');
                url += '&';
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            if (params[prop].length > 0) {
              url = url.slice(0, -1); // Remove last & character
            }
          } else {
              url += encodeURIComponent(prop) + '=' + extraEncode$1(JSON.stringify(params[prop])).replace('%20', '+');
            }
        }
      }
      prop = null;
    }

    // Stringify Data
    if (data) {
      if (typeof data === 'string' || data instanceof String || data instanceof ArrayBuffer) {
        // do nothing
      } else if (typeof FormData !== 'undefined' && data instanceof FormData) {
          // do nothing
        } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
            // do nothing
          } else {
              data = JSON.stringify(data);
              if (headers == null) {
                headers = {
                  'Content-Type': 'application/json'
                };
              } else if (!headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type']) {
                headers['Content-Type'] = 'application/json';
              }
            }
    }

    // Open Request
    xhr.open(method, url, true);

    // Set Credentials, spec says can be done in UNSENT or OPENED states
    xhr.withCredentials = withCreds;

    // Set Headers
    if (headers !== null) {
      for (prop in headers) {
        if (headers.hasOwnProperty(prop)) {
          xhr.setRequestHeader(prop, headers[prop]);
        }
      }
    }

    // Create Promise
    return new Promise(function (resolve, reject) {

      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          // Done
          if (this.status >= 200 && this.status < 300) {
            resolve(this);
          } else {
            //console.log(this);
            reject({
              error: new Error('Request failed with status: ' + this.status + ', ' + this.statusText),
              'xhr': this
            });
          }
        } else if (this.readyState === 3) {
          // Loading
          if (typeof onprogress === 'function') {
            onprogress(this.responseText);
          }
        } else if (this.readyState === 2) {
          // Headers Received
        } else if (this.readyState === 1) {
            // Request Open
          } else if (this.readyState === 0) {
              // Unset ie, not open
            }
      };

      xhr.addEventListener('abort', function () {
        console.log('Request to ' + url + ' aborted with status: ' + this.status + ', ' + this.statusText);
      }, false);

      // Send Request
      if (data !== null) {
        xhr.send(data);
      } else {
        xhr.send();
      }
    });
  };
  // Add extraEncode as an export
  Object.defineProperty(promiseRequest, 'extraEncode', {
    configurable: false,
    enumerable: false,
    get: function get() {
      return extraEncode$1;
    }
  });

  var extraEncode = promiseRequest.extraEncode;
  var defaults = {
    headers: {
      'Accept': 'application/json'
    },
    withCredentials: true
  };
  var responseThen = function responseThen(response) {
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
  var houndRequest = function houndRequest(args) {
    // Passed through to promiseRequest
    //  method
    //  params
    //  data
    //  headers
    //  withCredentials
    //  onprogress or onProgress
    //
    // Unique
    //  endpoint -- {String} api endpoint to pass as url to promiseRequest
    //
    // Overwrites
    //  url

    // If args doesn't exist throw TypeError
    if (!args) {
      throw new TypeError('Arguments not specified for houndRequest', 'houndRequest.js', 27);
    }
    //log('args before defaults: ', JSON.stringify(args));

    // Enforce capitals for method
    if (typeof args.method === 'string' && /[a-z]/.test(args.method)) {
      args.method = args.method.toUpperCase();
    }

    // Set/Add defaults for POST requests
    if (args.method && args.method === 'POST') {
      defaults.withCredentials = true;
    }

    // Set args.url via args.endpoint
    //  delete endpoint from args
    if (args.endpoint) {
      // houndOrigin defined in hound-origin.js before import, must be fully qualified domain name
      args.url = MHSDK.origin + args.endpoint;
      delete args.endpoint;
    }

    // Set the OAuth access token if the client has configured OAuth.
    if (MHSDK.MHAccessToken) {
      if (args.params) {
        args.params.access_token = MHSDK.MHAccessToken;
      } else {
        args.params = {
          access_token: MHSDK.MHAccessToken
        };
      }
    }

    // Set to defaults or merge
    //  headers
    if (!args.headers) {
      args.headers = defaults.headers;
    } else {
      // Merge Defaults in
      var prop;
      for (prop in defaults.headers) {
        if (defaults.headers.hasOwnProperty(prop) && !(prop in args.headers)) {
          args.headers[prop] = defaults.headers[prop];
        }
      }
    }

    // withCredentials
    if (args.withCredentials == null) {
      args.withCredentials = defaults.withCredentials;
    }

    //log('args after defaults: ', JSON.stringify(args));

    return promiseRequest(args).then(responseThen);
  };

  Object.defineProperty(houndRequest, 'extraEncode', {
    configurable: false,
    enumerable: false,
    get: function get() {
      return extraEncode;
    }
  });

  var _MHAccessToken = null;
  var _MHClientId = null;
  var _MHClientSecret = null;

  var _houndOrigin = 'https://api-v11.mediahound.com/';

  var MHSDK = (function () {
    function MHSDK() {
      babelHelpers.classCallCheck(this, MHSDK);
    }

    babelHelpers.createClass(MHSDK, null, [{
      key: 'configure',

      /**
       * MHSDK.create(clientId, clientSecret)
       * Configures the MediaHound SDK with an OAuth clientId and clientSecret.
       *
       * @param   clientId <String> - OAuth Client Identifier
       * @param   clientSecret <String> - OAuth Client Secret
       * @param   origin <String> - (Optional) MediaHound network origin.
       * @returns <Promise> - A promise that resolves when the configuration is complete.
       */
      value: function configure(clientId, clientSecret, origin) {
        _MHClientId = clientId;
        _MHClientSecret = clientSecret;
        if (origin) {
          _houndOrigin = origin;
        }

        return this.refreshOAuthToken();
      }
    }, {
      key: 'refreshOAuthToken',
      value: function refreshOAuthToken() {
        return houndRequest({
          endpoint: 'cas/oauth2.0/accessToken',
          params: {
            client_id: _MHClientId,
            client_secret: _MHClientSecret,
            grant_type: 'client_credentials'
          }
        }).then(function (response) {
          _MHAccessToken = response.accessToken;
        });
      }
    }, {
      key: 'MHAccessToken',
      get: function get() {
        return _MHAccessToken;
      }
    }, {
      key: 'origin',
      get: function get() {
        return _houndOrigin;
      }
    }]);
    return MHSDK;
  })();

  var mapValueToType = function mapValueToType(rawValue, type) {
    var initialValue = null;

    if ((typeof type === 'undefined' ? 'undefined' : babelHelpers.typeof(type)) === 'object') {
      if (type) {
        if (type instanceof Array) {
          var innerType = type[0];

          if (rawValue !== null && rawValue !== undefined) {
            initialValue = rawValue.map(function (v) {
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
            initialValue = rawValue !== null && rawValue !== undefined ? type.mapper(rawValue) : null;
          }
        }
      }
    } else if (type === String) {
      initialValue = rawValue !== null && rawValue !== undefined ? String(rawValue) : null;
    } else if (type === Number) {
      initialValue = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;

      if (Number.isNaN(initialValue)) {
        initialValue = null;
      }
    } else if (type === Boolean) {
      initialValue = rawValue !== null && rawValue !== undefined ? Boolean(rawValue) : null;
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
      initialValue = rawValue !== null && rawValue !== undefined ? new type(rawValue) : null;
    }

    return initialValue;
  };

  var setPropertyFromArgs = function setPropertyFromArgs(args, obj, name, type, optional, merge) {
    if (!obj[name]) {
      var rawValue = args[name];
      var convertedValue = mapValueToType(rawValue, type);

      if (!optional && !convertedValue) {
        throw TypeError('non-optional field `' + name + '` found null value. Args:', args);
      }

      if (convertedValue !== undefined) {
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

  var jsonParseArgs = function jsonParseArgs(args, obj, merge) {
    var properties = obj.jsonProperties;
    for (var name in properties) {
      if (properties.hasOwnProperty(name)) {
        var value = properties[name];

        var optional = true;
        var type;
        if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object') {
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

  var jsonCreateWithArgs = function jsonCreateWithArgs(args, obj) {
    jsonParseArgs(args, obj, false);
  };

  var jsonMergeWithArgs = function jsonMergeWithArgs(args, obj) {
    jsonParseArgs(args, obj, true);
  };

  // MediaHound Social Object
  var MHSocial = (function () {
    function MHSocial(args) {
      babelHelpers.classCallCheck(this, MHSocial);

      jsonCreateWithArgs(args, this);
    }

    /**
     * TODO maybe just do a this[prop] === other[prop] check
     * @param {MHSocial} otherObj - another MHSocial object to check against
     * @returns {boolean}
     */

    babelHelpers.createClass(MHSocial, [{
      key: 'isEqualToMHSocial',
      value: function isEqualToMHSocial(otherObj) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this.jsonProperties)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var prop = _step.value;

            if (typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop]) {
              continue;
            } else if (!this[prop] && !otherObj[prop]) {
              continue;
            }
            return false;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return true;
      }

      /**
       * Returns a new social object with the expected change of a given action
       * @private
       * @param action - MHSocial.ACTION to take on this social object
       * @returns {MHSocial} - A new MHSocial object that represents the expected outcome
       */

    }, {
      key: 'newWithAction',
      value: function newWithAction(action) {
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

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(this.jsonProperties)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var prop = _step2.value;

            if (prop === toChange) {
              newArgs[prop] = newValue;
            } else if (prop === alsoFlip) {
              newArgs[prop] = !this[prop];
            } else {
              newArgs[prop] = this[prop];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return new MHSocial(newArgs);
      }

      /**
       * Social Action Types
       *
       */

    }, {
      key: 'jsonProperties',
      get: function get() {
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
    }], [{
      key: 'LIKE',
      get: function get() {
        return 'like';
      }
    }, {
      key: 'UNLIKE',
      get: function get() {
        return 'unlike';
      }
    }, {
      key: 'DISLIKE',
      get: function get() {
        return 'dislike';
      }
    }, {
      key: 'UNDISLIKE',
      get: function get() {
        return 'undislike';
      }
    }, {
      key: 'FOLLOW',
      get: function get() {
        return 'follow';
      }
    }, {
      key: 'UNFOLLOW',
      get: function get() {
        return 'unfollow';
      }
    }, {
      key: 'SOCIAL_ACTIONS',
      get: function get() {
        return [MHSocial.LIKE, MHSocial.UNLIKE, MHSocial.DISLIKE, MHSocial.UNDISLIKE, MHSocial.FOLLOW, MHSocial.UNFOLLOW];
      }
    }, {
      key: 'POST',
      get: function get() {
        return 'post';
      }
    }, {
      key: 'COLLECT',
      get: function get() {
        return 'collect';
      }
    }, {
      key: 'COMMENT',
      get: function get() {
        return 'comment';
      }
    }]);
    return MHSocial;
  })();

  var MHImageData = (function () {
    function MHImageData(args) {
      babelHelpers.classCallCheck(this, MHImageData);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHImageData, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          url: String,
          width: Number,
          height: Number
        };
      }
    }]);
    return MHImageData;
  })();

  var MHMetadata = (function () {
    function MHMetadata(args) {
      babelHelpers.classCallCheck(this, MHMetadata);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          mhid: { type: String, optional: false },
          altId: String,
          name: String,
          description: String,
          createdDate: Date
        };
      }
    }]);
    return MHMetadata;
  })();

  var MHMediaMetadata = (function (_MHMetadata) {
    babelHelpers.inherits(MHMediaMetadata, _MHMetadata);

    function MHMediaMetadata() {
      babelHelpers.classCallCheck(this, MHMediaMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMediaMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHMediaMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHMediaMetadata.prototype), 'jsonProperties', this), {
          releaseDate: Date
        });
      }
    }]);
    return MHMediaMetadata;
  })(MHMetadata);

  var MHUserMetadata = (function (_MHMetadata2) {
    babelHelpers.inherits(MHUserMetadata, _MHMetadata2);

    function MHUserMetadata() {
      babelHelpers.classCallCheck(this, MHUserMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHUserMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHUserMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHUserMetadata.prototype), 'jsonProperties', this), {
          username: { type: String, optional: false },
          email: String
        });
      }
    }]);
    return MHUserMetadata;
  })(MHMetadata);

  var MHCollectionMetadata = (function (_MHMetadata3) {
    babelHelpers.inherits(MHCollectionMetadata, _MHMetadata3);

    function MHCollectionMetadata() {
      babelHelpers.classCallCheck(this, MHCollectionMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHCollectionMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHCollectionMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHCollectionMetadata.prototype), 'jsonProperties', this), {
          mixlist: String
        });
      }
    }]);
    return MHCollectionMetadata;
  })(MHMetadata);

  var MHActionMetadata = (function (_MHMetadata4) {
    babelHelpers.inherits(MHActionMetadata, _MHMetadata4);

    function MHActionMetadata() {
      babelHelpers.classCallCheck(this, MHActionMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHActionMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHActionMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHActionMetadata.prototype), 'jsonProperties', this), {
          message: String
        });
      }
    }]);
    return MHActionMetadata;
  })(MHMetadata);

  var MHImageMetadata = (function (_MHMetadata5) {
    babelHelpers.inherits(MHImageMetadata, _MHMetadata5);

    function MHImageMetadata() {
      babelHelpers.classCallCheck(this, MHImageMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHImageMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHImageMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHImageMetadata.prototype), 'jsonProperties', this), {
          isDefault: Boolean,
          averageColor: String,
          thumbnail: MHImageData,
          small: MHImageData,
          medium: MHImageData,
          large: MHImageData,
          original: MHImageData
        });
      }
    }]);
    return MHImageMetadata;
  })(MHMetadata);

  var MHSubscriptionMetadata = (function (_MHMetadata6) {
    babelHelpers.inherits(MHSubscriptionMetadata, _MHMetadata6);

    function MHSubscriptionMetadata() {
      babelHelpers.classCallCheck(this, MHSubscriptionMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSubscriptionMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHSubscriptionMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHSubscriptionMetadata.prototype), 'jsonProperties', this), {
          timePeriod: String,
          price: String,
          currency: String,
          mediums: String
        });
      }
    }]);
    return MHSubscriptionMetadata;
  })(MHMetadata);

  var MHSourceMetadata = (function (_MHMetadata7) {
    babelHelpers.inherits(MHSourceMetadata, _MHMetadata7);

    function MHSourceMetadata() {
      babelHelpers.classCallCheck(this, MHSourceMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSourceMetadata).apply(this, arguments));
    }

    babelHelpers.createClass(MHSourceMetadata, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHSourceMetadata.prototype), 'jsonProperties', this), {
          connectable: Boolean
        });
      }
    }]);
    return MHSourceMetadata;
  })(MHMetadata);

  var MHContributorMetadata = (function (_MHMetadata8) {
    babelHelpers.inherits(MHContributorMetadata, _MHMetadata8);

    function MHContributorMetadata() {
      babelHelpers.classCallCheck(this, MHContributorMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHContributorMetadata).apply(this, arguments));
    }

    return MHContributorMetadata;
  })(MHMetadata);

  var MHHashtagMetadata = (function (_MHMetadata9) {
    babelHelpers.inherits(MHHashtagMetadata, _MHMetadata9);

    function MHHashtagMetadata() {
      babelHelpers.classCallCheck(this, MHHashtagMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHHashtagMetadata).apply(this, arguments));
    }

    return MHHashtagMetadata;
  })(MHMetadata);

  var MHTraitMetadata = (function (_MHMetadata10) {
    babelHelpers.inherits(MHTraitMetadata, _MHMetadata10);

    function MHTraitMetadata() {
      babelHelpers.classCallCheck(this, MHTraitMetadata);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHTraitMetadata).apply(this, arguments));
    }

    return MHTraitMetadata;
  })(MHMetadata);

  var childrenConstructors = {};
  var __cachedRootResponses = {};

  // Create Cache
  var mhidLRU = new MHCache(1000);

  if (typeof window !== 'undefined') {
    if (window.location.host === 'local.mediahound.com:2014') {
      window.mhidLRU = mhidLRU;
    }
  }

  // Symbols for Element hiding
  var lastSocialRequestIdSym = Symbol('lastSocialRequestId');
  var socialSym = Symbol('social');
  // TODO: editable primary and secondary image properties using Symbols

  // Base MediaHound Object
  var MHObject = (function () {

    /** MHObject Constructor
     *  @constructor
     * MediaHound Object constructors take a single parameter {Object | JSON String}
     * If the argument is an object properties will be read and placed properly
     *  if a prop doesn't exist and is optional it will be replaced with a null value.
     * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
     *
     *  @param args - { Object | JSON String }
     *
     *    Require Param Props
     *      mhid    - { MediaHound ID string }
     *
     *  Optional Param Props
     *      name            - { String }
     *      altId           - { String }
     *      primaryImage    - { MHImage }
     *      secondaryImage  - { MHImage }
     *      createdDate     - { Date }
     *
     */

    function MHObject(args) {
      babelHelpers.classCallCheck(this, MHObject);

      jsonCreateWithArgs(args, this);

      this.cachedResponses = {};
    }

    babelHelpers.createClass(MHObject, [{
      key: 'isEqualToMHObject',

      /**
       * mhObj.isEqualToMHObject(otherObj)
       *
       * @param { <MHObject> }  - MediaHound Type to check against
       * @return { Boolean }    - True or False if mhids match
       *
       */
      value: function isEqualToMHObject(otherObj) {
        if (otherObj && otherObj.metadata.mhid) {
          return this.metadata.mhid === otherObj.metadata.mhid;
        }
        return false;
      }
      // TODO Add deep equality check?
      // might be useful for checking for changes in cache'd objects

      /**
       * mhObj.hasMhid(mhid)
       *
       * @param {string} mhid - a string mhid to check against this object
       * @returns {boolean}
       */

    }, {
      key: 'hasMhid',
      value: function hasMhid(mhid) {
        if (typeof mhid === 'string' || mhid instanceof String) {
          return this.metadata.mhid === mhid;
        }
        return false;
      }

      // TODO Could change as needed

    }, {
      key: 'toString',
      value: function toString() {
        return this.className + " with mhid " + this.metadata.mhid + " and name " + this.mhName;
      }
    }, {
      key: 'mergeWithData',
      value: function mergeWithData(args) {
        jsonMergeWithArgs(args, this);
      }

      /**
       * MHObject.fetchByMhid(mhid)
       *
       * @param   { String        } mhid  - valid MediaHound ID
       * @param   { String        } view  - set to basic, basic_social, extended, extended_social, full, defaults to basic.
       * @param   { boolean=false } force - set to true to re-request for the given mhid
       * @return  { Promise       } - resloves to specific MHObject sub class
       *
       */

    }, {
      key: 'subendpoint',

      /**
       * mhObj.subendpoint(sub)
       *
       * @param   { String } - subendpoint to be added onto this.endpoint
       * @returns { String } - example with ('like'): 'graph/media/mhmov1000009260/like'
       *
       */
      value: function subendpoint(sub) {
        if (typeof sub !== 'string' && !(sub instanceof String)) {
          throw new TypeError('Sub not of type string or undefined in (MHObject).subendpoint.');
        }
        return this.endpoint + '/' + sub;
      }
    }, {
      key: 'fetchSocial',

      /**
       * mhObj.fetchSocial()
       * Calls server for new social stats
       * @param {boolean} force - Forces an http request if set to true
       * @return  { Promise }  - Resolves to Social stats as returned by the server
       *
       */
      value: function fetchSocial() {
        var _this = this;

        var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var path = this.subendpoint('social');

        if (!force && this.social instanceof MHSocial) {
          return Promise.resolve(this.social);
        }
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then((function (parsed) {
          return _this.social = new MHSocial(parsed);
        }).bind(this)).catch(function (err) {
          console.warn('fetchSocial:', err);
        });
      }

      /** TODO: Move to Objects that actually use it, i.e. not MHAction
       * mhObj.fetchFeed(view, page, size)
       *
       * @param { string=full   } view - the view param
       * @param { number=0      } page - the zero indexed page number to return
       * @param { number=12     } size  - the number of items to return per page
       * @param { Boolean=false } force
       *
       * @return { houndPagedRequest }  - MediaHound paged request object for this feed
       *
       */

    }, {
      key: 'fetchFeed',
      value: function fetchFeed() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('feed');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /* TODO: DocJS
      * mhMed.fetchImages()
      *
      * @param force { Boolean } - force refetch of content
      * @return { Promise } - resolves to
      *
      */

    }, {
      key: 'fetchImages',
      value: function fetchImages() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('images');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /*
       * mhContributor.fetchCollections(force)
       *
       * @return { Promise }  - resolves to server response of collections for this MediaHound object
       *
       */

    }, {
      key: 'fetchCollections',
      value: function fetchCollections() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        var path = this.subendpoint('collections');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /* TODO: DocJS
      * mhMed.fetchBaseTraits()
      *
      * @param force { Boolean } - force refetch of content
      * @return { Promise } - resolves to
      *
      */

    }, {
      key: 'fetchBaseTraits',
      value: function fetchBaseTraits() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('baseTraits');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /**
       *
       * mhObj.takeAction(action)
       *
       * @param   { string } action - The action to take, should be accessed from MHSocial.LIKE, MHSocial.FOLLOW, etc.
       *
       * @return  { Promise } - resolves to server response of action call
       *
       */

    }, {
      key: 'takeAction',
      value: function takeAction(action) {
        var _this2 = this;

        if (typeof action !== 'string' && !(action instanceof String)) {
          throw new TypeError('Action not of type String or undefined');
        }
        if (!MHSocial.SOCIAL_ACTIONS.some(function (a) {
          return action === a;
        })) {
          throw new TypeError('Action is not of an accepted type in mhObj.takeAction');
        }

        log('in takeAction, action: ' + action + ', obj: ' + this.toString());

        var path = this.subendpoint(action),
            requestId = Math.random(),
            original = this.social,
            self = this;

        // Expected outcome
        if (this.social instanceof MHSocial) {
          this.social = this.social.newWithAction(action);
        }

        // Save request id to check against later
        this[lastSocialRequestIdSym] = requestId;

        // Return promise to new Social as returned from the server
        return houndRequest({
          method: 'PUT',
          endpoint: path
        }).then(function (socialRes) {
          var newSocial = new MHSocial(socialRes.social);

          // only update if this is the last request returning
          if (_this2[lastSocialRequestIdSym] === requestId) {
            self.social = newSocial;
          }
          //log('in take action response, newSocial: ', newSocial);
          return newSocial;
        }).catch(function (err) {
          if (_this2[lastSocialRequestIdSym] === requestId) {
            self.social = original;
          }
          throw err;
        });
      }
    }, {
      key: 'responseCacheKeyForPath',
      value: function responseCacheKeyForPath(path) {
        return "__cached_" + path;
      }
    }, {
      key: 'cachedResponseForPath',
      value: function cachedResponseForPath(path) {
        var cacheKey = this.responseCacheKeyForPath(path);
        return this.cachedResponses[cacheKey];
      }
    }, {
      key: 'setCachedResponse',
      value: function setCachedResponse(response, path) {
        var cacheKey = this.responseCacheKeyForPath(path);
        this.cachedResponses[cacheKey] = response;
      }
    }, {
      key: 'fetchPagedEndpoint',
      value: function fetchPagedEndpoint(path, view, size, force) {
        var _this3 = this;

        var next = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

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
            params: {
              pageSize: size,
              view: view
            }
          });
        }

        var finalPromise = promise.then(function (response) {
          var pagedResponse = new ___models_container_MHPagedResponse_js.MHPagedResponse(response);

          pagedResponse.fetchNextOperation = function (newNext) {
            return _this3.fetchPagedEndpoint(path, view, size, force, newNext);
          };

          return pagedResponse;
        });

        if (!next) {
          this.setCachedResponse(finalPromise, path);
        }

        return finalPromise;
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return {
          metadata: MHMetadata,
          primaryImage: { mapper: MHObject.create },
          secondaryImage: { mapper: MHObject.create },
          social: MHSocial
        };
      }

      /** @property {MHSocial} social */

    }, {
      key: 'social',
      get: function get() {
        return this[socialSym] || null;
      },
      set: function set(newSocial) {
        if (newSocial instanceof MHSocial) {
          this[socialSym] = newSocial;
        }
        return this.social;
      }

      /**
       * MHObject.create(args)
       *
       * @param   { Object | JSON<String> | Array{Objects | JSON<Strings>} } - Array or, single Object or JSON of MediaHound Object definition(s).
       * @returns { <MHObject> } - Specific MediaHound Type. ex: MHMovie, MHAlbum, MHTrack, MHContributor, etc.
       *
       * returns null if can't find associated class
       */

    }, {
      key: 'type',
      get: function get() {
        return MHObject.isType(this);
      }

      /**
       * This uses the function.name feature which is shimmed if it doesn't exist during the child constructor registration process.
       * @property {string} className - the string class name for this object, ie: MHUser, MHMovie, MHPost, etc.
       */

    }, {
      key: 'className',
      get: function get() {
        return this.constructor.mhName;
      }
    }, {
      key: 'endpoint',

      /**
       * mhObj.endpoint
       *
       * @return { String } - ex: 'graph/media/mhmov1000009260'
       *
       */
      get: function get() {
        return this.constructor.rootEndpoint + '/' + this.metadata.mhid;
      }
    }], [{
      key: 'create',
      value: function create(args) {
        var saveToLRU = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        if (args instanceof Array) {
          log('trying to create MHObject that is new: ' + args);
          //return args.map(MHObject.create); // <-- should probably be this once all MHObjs are done
          return args.map(function (value) {
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

          //log(args.metadata.mhid)
          var mhid = args.metadata.mhid || args.mhid || undefined;
          var mhObj;
          //console.log('at start of creating... ',mhid,args);

          if (mhid !== 'undefined' && mhid !== null && args instanceof Object) {
            args.mhid = mhid;
            // check cache
            //log('in create function trying to parseArgs: \n\n' , args);

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

            // if( prefix === 'mhimg' ){
            //   // bypass cache
            // } else {
            //   log('putting from create');
            //   mhidLRU.putMHObj(mhObj);
            // }
            //console.log('creating... ',prefix,': ', mhObj);
            if (saveToLRU) {
              mhidLRU.putMHObj(mhObj);
            }
            return mhObj;
          } else {
            mhObj = args;
            //log('creating without a prefix...', mhObj);
            return mhObj;
          }
        } catch (err) {
          //log(err);
          console.log(err);
          console.log(err.stack);
          if (err instanceof TypeError) {
            if (err.message === 'undefined is not a function') {
              warn('Unknown mhid prefix, see args object: ', args);
            }
            if (err.message === 'Args was object without mhid!') {
              //warn('Incomplete Object passed to create function: ', args);
            }
          }
          //error(err.stack); // turning off this error because it is really annoying!
          return null;
        }
        return null;
      }

      /***
       * Register Child Constructors
       *
       * MHObject.registerConstructor(mhClass)
       *
       * @param  { Function } mhClass - MediaHound Object constructor to be used within MHObject.create and other methods
       * @return { Boolean }                - Success(true) or Fail(false)
       *
       */

    }, {
      key: 'registerConstructor',
      value: function registerConstructor(mhClass, mhName) {
        // Add class name if function.name is not native
        // if( mhClass.name === undefined ){
        //   mhClass.name = mhClass.toString().match(/function (MH[A-Za-z]*)\(args\)/)[1];
        //   log('shimmed mhClass.name to: ' + mhClass.name);
        // }
        mhClass.mhName = mhName;
        //log('registering constructor: ' + mhClass.name);

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
      }

      /**
       * MHObject.prefixes
       *
       * @return { Array } - A list of MediaHound ID prefixes
       *
       * Note: This list contains only prefixes of types known to the MHObject.create method
       */
      // List of prefixes known to MHObject through registerConstructor

    }, {
      key: 'getPrefixFromMhid',

      /**
       * MHObject.getPrefixFromMhid(mhid)
       *
       * @param  { String } mhid - a valid MediaHound ID
       * @return { String } - a valid MediaHound ID prefix
       *
       */
      value: function getPrefixFromMhid(mhid) {
        for (var pfx in childrenConstructors) {
          if (childrenConstructors.hasOwnProperty(pfx) && new RegExp('^' + pfx).test(mhid)) {
            return pfx;
          }
        }
        return null;
      }

      /**
       * MHObject.getClassNameFromMhid(mhid)
       *
       * @param  { String } mhid - a valid MediaHound ID
       * @return { String } - the class name associated with the prefix
       *
       */

    }, {
      key: 'getClassNameFromMhid',
      value: function getClassNameFromMhid(mhid) {
        var pfx = MHObject.getPrefixFromMhid(mhid);
        if (childrenConstructors[pfx]) {
          return childrenConstructors[pfx].mhName;
        }
        return null;
      }

      /**
       * mhObj.mhidPrefix
       *
       * @return { String } - the MediaHound ID prefix associated with this MHObject.
       *
       * Note: Override at child level
       */

    }, {
      key: 'isMedia',

      // Type Checking
      // TODO: Update these checks for cross site scripting cases
      // case:
      //    instanceof only works if the object being checked was created
      //    in the same global scope as the constructor function it is being checked against
      value: function isMedia(toCheck) {
        return toCheck instanceof System.get('models/media/MHMedia.js').MHMedia;
      }
    }, {
      key: 'isContributor',
      value: function isContributor(toCheck) {
        return toCheck instanceof System.get('models/contributor/MHContributor.js').MHContributor;
      }
    }, {
      key: 'isAction',
      value: function isAction(toCheck) {
        return toCheck instanceof System.get('models/action/MHAction.js').MHAction;
      }
    }, {
      key: 'isUser',
      value: function isUser(toCheck) {
        return toCheck instanceof System.get('models/user/MHUser.js').MHUser;
      }
    }, {
      key: 'isCollection',
      value: function isCollection(toCheck) {
        return toCheck instanceof System.get('models/collection/MHCollection.js').MHCollection;
      }
    }, {
      key: 'isImage',
      value: function isImage(toCheck) {
        return toCheck instanceof System.get('models/image/MHImage.js').MHImage;
      }
    }, {
      key: 'isTrait',
      value: function isTrait(toCheck) {
        return toCheck instanceof System.get('models/trait/MHTrait.js').MHTrait;
      }
    }, {
      key: 'isSource',
      value: function isSource(toCheck) {
        return toCheck instanceof System.get('models/source/MHSource.js').MHSource;
      }
    }, {
      key: 'isType',
      value: function isType(obj) {
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
      }
    }, {
      key: 'enterWithMappedSourceIds',
      value: function enterWithMappedSourceIds(msis) {
        var endpoint = 'graph/enter/raw';
        var params = {
          ids: msis
        };

        return houndRequest({
          method: 'GET',
          endpoint: endpoint,
          params: params
        });
      }
    }, {
      key: 'fetchByMhid',
      value: function fetchByMhid(mhid) {
        var view = arguments.length <= 1 || arguments[1] === undefined ? 'full' : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        if (typeof mhid !== 'string' && !(mhid instanceof String)) {
          throw TypeError('MHObject.fetchByMhid argument must be type string.');
        }

        if (view === null || view === undefined) {
          view = 'full';
        }

        log('in fetchByMhid, looking for: ', mhid, 'with view = ', view);

        // Check LRU for mhid
        if (!force && mhidLRU.has(mhid)) {
          return Promise.resolve(mhidLRU.get(mhid));
        }
        // Check LRU for altId
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

        //console.log('fetching:', mhClass.rootEndpoint + '/' + mhid);

        return houndRequest({
          method: 'GET',
          endpoint: mhClass.rootEndpoint + '/' + mhid,
          params: {
            view: view
          }
        }).then(function (response) {
          newObj = MHObject.create(response);
          return newObj;
        });
      }

      /**
       * Children override
       *
       */

    }, {
      key: 'rootEndpointForMhid',

      /**
       * MHObject.rootEndpointForMhid(mhid)
       *
       * @param   { String } mhid - a valid MediaHound ID
       * @return  { String } - the endpoint for MediaHound Type of mhid
       *
       */
      value: function rootEndpointForMhid(mhid) {
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
    }, {
      key: 'rootSubendpoint',
      value: function rootSubendpoint(sub) {
        if (typeof sub !== 'string' && !(sub instanceof String)) {
          throw new TypeError('Sub not of type string or undefined in (MHObject).rootSubendpoint.');
        }
        return this.rootEndpoint + '/' + sub;
      }
    }, {
      key: 'rootResponseCacheKeyForPath',
      value: function rootResponseCacheKeyForPath(path, params) {
        return "___root_cached_" + path + "_" + JSON.stringify(params, function (k, v) {
          if (k === 'view' || k === 'pageSize' || k === 'access_token') {
            return undefined;
          }
          return v;
        });
      }
    }, {
      key: 'cachedRootResponseForPath',
      value: function cachedRootResponseForPath(path, params) {
        var cacheKey = this.rootResponseCacheKeyForPath(path, params);
        return __cachedRootResponses[cacheKey];
      }
    }, {
      key: 'setCachedRootResponse',
      value: function setCachedRootResponse(response, path, params) {
        var cacheKey = this.rootResponseCacheKeyForPath(path, params);
        __cachedRootResponses[cacheKey] = response;
      }
    }, {
      key: 'fetchRootPagedEndpoint',
      value: function fetchRootPagedEndpoint(path, params, view, size, force) {
        var _this4 = this;

        var next = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

        if (!force && !next) {
          var cached = this.cachedRootResponseForPath(path, params);
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
          params.pageSize = size;

          promise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: params
          });
        }

        var finalPromise = promise.then(function (response) {
          var MHPagedResponse = System.get('models/container/MHPagedResponse.js').MHPagedResponse;
          var pagedResponse = new MHPagedResponse(response);

          pagedResponse.fetchNextOperation = function (newNext) {
            return _this4.fetchRootPagedEndpoint(path, params, view, size, force, newNext);
          };

          return pagedResponse;
        });

        if (!next) {
          this.setCachedRootResponse(finalPromise, path, params);
        }

        return finalPromise;
      }
    }, {
      key: 'prefixes',
      get: function get() {
        return Object.keys(childrenConstructors);
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return null;
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return null;
      }
    }]);
    return MHObject;
  })();

  // MediaHound Action Object
  var MHAction = (function (_MHObject) {
    babelHelpers.inherits(MHAction, _MHObject);

    function MHAction() {
      babelHelpers.classCallCheck(this, MHAction);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAction).apply(this, arguments));
    }

    babelHelpers.createClass(MHAction, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHAction.prototype), 'jsonProperties', this), {
          metadata: MHActionMetadata,
          primaryOwner: { mapper: MHObject.create },
          primaryMention: { mapper: MHObject.create }
        });
      }
    }], [{
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/action';
      }
    }]);
    return MHAction;
  })(MHObject);

  // MediaHound Add Object
  var MHAdd = (function (_MHAction) {
    babelHelpers.inherits(MHAdd, _MHAction);

    function MHAdd() {
      babelHelpers.classCallCheck(this, MHAdd);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAdd).apply(this, arguments));
    }

    babelHelpers.createClass(MHAdd, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhadd';
      }
    }]);
    return MHAdd;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHAdd, 'MHAdd');
  })();

  // MediaHound Comment Object
  var MHComment = (function (_MHAction) {
    babelHelpers.inherits(MHComment, _MHAction);

    function MHComment() {
      babelHelpers.classCallCheck(this, MHComment);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHComment).apply(this, arguments));
    }

    babelHelpers.createClass(MHComment, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhcmt';
      }
    }]);
    return MHComment;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHComment, 'MHComment');
  })();

  // MediaHound Create Object
  var MHCreate = (function (_MHAction) {
    babelHelpers.inherits(MHCreate, _MHAction);

    function MHCreate() {
      babelHelpers.classCallCheck(this, MHCreate);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHCreate).apply(this, arguments));
    }

    babelHelpers.createClass(MHCreate, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhcrt';
      }
    }]);
    return MHCreate;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHCreate, 'MHCreate');
  })();

  // MediaHound Like Object
  var MHLike = (function (_MHAction) {
    babelHelpers.inherits(MHLike, _MHAction);

    function MHLike() {
      babelHelpers.classCallCheck(this, MHLike);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHLike).apply(this, arguments));
    }

    babelHelpers.createClass(MHLike, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhlke';
      }
    }]);
    return MHLike;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHLike, 'MHLike');
  })();

  // MediaHound Follow Object
  var MHFollow = (function (_MHAction) {
    babelHelpers.inherits(MHFollow, _MHAction);

    function MHFollow() {
      babelHelpers.classCallCheck(this, MHFollow);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHFollow).apply(this, arguments));
    }

    babelHelpers.createClass(MHFollow, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhflw';
      }
    }]);
    return MHFollow;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHFollow, 'MHFollow');
  })();

  // MediaHound Post Object
  var MHPost = (function (_MHAction) {
    babelHelpers.inherits(MHPost, _MHAction);

    function MHPost() {
      babelHelpers.classCallCheck(this, MHPost);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHPost).apply(this, arguments));
    }

    babelHelpers.createClass(MHPost, null, [{
      key: 'createWithMessage',

      /**
       *
       * MHPost.createWithMessage(message{String}, mentions{Array<MHObject>}, primaryMention{MHObject})
       *
       * @param {string} message - the message for this new post
       */
      value: function createWithMessage(message, mentions, primaryMention) {
        if (!message || !mentions || !primaryMention || typeof message !== 'string' || !Array.isArray(mentions) || !mentions.every(function (x) {
          return x instanceof MHObject;
        }) || !(primaryMention instanceof MHObject)) {
          throw new TypeError("Can't create post without message string, mentions array, and primary mention object.");
        }

        var path = this.rootSubendpoint('new'),
            mentionedMhids = mentions.map(function (m) {
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
        }).then(function (res) {
          // update social counts of mentioned objects
          mentions.forEach(function (m) {
            return m.fetchSocial(true);
          });
          return res;
        });
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return 'mhpst';
      }
    }]);
    return MHPost;
  })(MHAction);

  (function () {
    MHObject.registerConstructor(MHPost, 'MHPost');
  })();

  var MHHashtag = (function (_MHObject) {
    babelHelpers.inherits(MHHashtag, _MHObject);

    function MHHashtag() {
      babelHelpers.classCallCheck(this, MHHashtag);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHHashtag).apply(this, arguments));
    }

    babelHelpers.createClass(MHHashtag, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHHashtag.prototype), 'jsonProperties', this), {
          metadata: MHHashtagMetadata
        });
      }

      /**
      * MHHashtag.fetchByName(name,view,force)
      *
      * @param { String } username - Username to fetch info for
      * @param { boolean} force - force fetch to server
      *
      * @return { Promise } - resolves to the MHUser object
      *
      */

    }], [{
      key: 'fetchByName',
      value: function fetchByName(name) /*, force=false*/{
        var view = arguments.length <= 1 || arguments[1] === undefined ? 'full' : arguments[1];

        if (!name || typeof name !== 'string' && !(name instanceof String)) {
          throw new TypeError('Hashtag not of type String in fetchByTag');
        }

        var path = this.rootSubendpoint('/lookup/' + name);

        return houndRequest({
          method: 'GET',
          endpoint: path,
          params: {
            view: view
          }
        }).then(function (response) {
          var newObj = MHObject.create(response);
          return newObj;
        });
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return 'mhhtg';
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/hashtag';
      }
    }]);
    return MHHashtag;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHHashtag, 'MHHashtag');
  })();

  // MediaHound SourceFormat Object
  var MHSourceFormat = (function () {
    function MHSourceFormat(args) {
      babelHelpers.classCallCheck(this, MHSourceFormat);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHSourceFormat, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          type: String,
          price: String,
          currency: String,
          timePeriod: String,
          launchInfo: Object,
          contentCount: Number
        };
      }
    }, {
      key: 'displayPrice',
      get: function get() {
        return '$' + this.price;
      }
    }]);
    return MHSourceFormat;
  })();

  // MediaHound SourceMethod Object
  var MHSourceMethod = (function () {
    function MHSourceMethod(args) {
      babelHelpers.classCallCheck(this, MHSourceMethod);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHSourceMethod, [{
      key: 'formatForType',
      value: function formatForType(type) {
        return this.formats.filter(function (format) {
          return format.type === type;
        })[0];
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return {
          type: String,
          formats: [MHSourceFormat]
        };
      }
    }], [{
      key: 'TYPE_PURCHASE',
      get: function get() {
        return 'purchase';
      }
    }, {
      key: 'TYPE_RENTAL',
      get: function get() {
        return 'rental';
      }
    }, {
      key: 'TYPE_SUBSCRIPTION',
      get: function get() {
        return 'subscription';
      }
    }, {
      key: 'TYPE_ADSUPPORTED',
      get: function get() {
        return 'adSupported';
      }
    }]);
    return MHSourceMethod;
  })();

  // MediaHound SourceMedium Object
  var MHSourceMedium = (function () {
    function MHSourceMedium(args) {
      babelHelpers.classCallCheck(this, MHSourceMedium);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHSourceMedium, [{
      key: 'methodForType',
      value: function methodForType(type) {
        return this.methods.filter(function (method) {
          return method.type === type;
        })[0];
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return {
          type: String,
          methods: [MHSourceMethod]
        };
      }
    }], [{
      key: 'TYPE_STREAM',
      get: function get() {
        return 'stream';
      }
    }, {
      key: 'TYPE_DOWNLOAD',
      get: function get() {
        return 'download';
      }
    }, {
      key: 'TYPE_DELIVER',
      get: function get() {
        return 'deliver';
      }
    }, {
      key: 'TYPE_PICKUP',
      get: function get() {
        return 'pickup';
      }
    }, {
      key: 'TYPE_ATTEND',
      get: function get() {
        return 'attend';
      }
    }]);
    return MHSourceMedium;
  })();

  var MHRelationship = (function () {
    function MHRelationship(args) {
      babelHelpers.classCallCheck(this, MHRelationship);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHRelationship, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          contribution: String,
          role: String,
          object: { mapper: MHObject.create }
        };
      }
    }]);
    return MHRelationship;
  })();

  var MHSorting = (function () {
    function MHSorting(args) {
      babelHelpers.classCallCheck(this, MHSorting);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHSorting, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          importance: Number,
          position: Number
        };
      }
    }]);
    return MHSorting;
  })();

  var MHContext = (function () {
    function MHContext(args) {
      babelHelpers.classCallCheck(this, MHContext);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHContext, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          consumable: Boolean,
          sorting: MHSorting,
          relationships: [MHRelationship],
          mediums: [MHSourceMedium]
        };
      }
    }]);
    return MHContext;
  })();

  // MediaHound Relational Pair Object
  var MHRelationalPair = (function () {
    function MHRelationalPair(args) {
      babelHelpers.classCallCheck(this, MHRelationalPair);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHRelationalPair, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          context: MHContext,
          object: { mapper: MHObject.create }
        };
      }
    }]);
    return MHRelationalPair;
  })();

  // MediaHound User Object
  var MHUser = (function (_MHObject) {
    babelHelpers.inherits(MHUser, _MHObject);

    function MHUser() {
      babelHelpers.classCallCheck(this, MHUser);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHUser).apply(this, arguments));
    }

    babelHelpers.createClass(MHUser, [{
      key: 'setPassword',

      /* TODO: change endpoint to CamelCase and to use mhid?
      * mhUser.setPassword()
      *
      * @return { Promise }
      *
      */
      value: function setPassword(password, newPassword) {

        if (!password || typeof password !== 'string' && !(password instanceof String)) {
          throw new TypeError('password must be type string in MHUser.newPassword');
        }
        if (!newPassword || typeof newPassword !== 'string' && !(newPassword instanceof String)) {
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
        }).then(function (response) {
          console.log('valid password: ', response);
          return response;
        }).catch(function (error) {
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
      }
      /* TODO: docJS
      *
      * mhUser.setProfileImage(image);
      *
      */

    }, {
      key: 'setProfileImage',
      value: function setProfileImage(image) {
        log('in setProfileImage with image: ', image);
        if (!image) {
          throw new TypeError('No Image passed to setProfileImage');
          //return Promise.resolve(null);
        }
        if (!(image instanceof Blob || image instanceof File)) {
          throw new TypeError('Image was not of type Blob or File.');
        }

        // If not current user throw error
        if (!this.isCurrentUser) {
          //throw new NoMHSessionError('No valid user session. Please log in to change profile picture');
          throw (function () {
            var NoMHSessionError = function NoMHSessionError(message) {
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

        // send form or file?
        return houndRequest({
          method: 'POST',
          endpoint: path,
          withCredentials: true,
          data: form
        }).then(function (primaryImage) {

          // var MHLoginSession = System.get('../../src/models/user/MHLoginSession.js').MHLoginSession;
          // //console.warn('circular dep: ', MHLoginSession);
          //var img = new MHImage(primaryImage);
          //MHLoginSession.updatedProfileImage(img);
          //return img;

          // TODO: wire back up the Event in MHLoginSession
          return primaryImage;
        });
      }

      /**
      * MHUser.fetchByUsername(username)
      *
      * @param { String } username - Username to fetch info for
      * @param { boolean} force - force fetch to server
      *
      * @return { Promise } - resolves to the MHUser object
      *
      */

    }, {
      key: 'fetchInterestFeed',

      /* TODO: add local cache
      * mhUsr.fetchInterestFeed(view, page, size)
      *
      * @param view { String } - the view type query parameter
      * @param page { Number } - the page number query parameter
      * @param size { Number } - the number of items per page
      *
      * @return { pagedRequest } - resolves to paged response from server, res.content contains array of data
      *
      */
      value: function fetchInterestFeed() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('interestFeed');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /* TODO: remove console.log debug stuffs
      * mhUsr.fetchOwnedCollections()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'fetchOwnedCollections',
      value: function fetchOwnedCollections() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        var path = this.subendpoint('ownedCollections');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /**
      * mhObj.fetchSuggested(mhid,force)
      *
      * @param { string='full' } view - the view needed to depict each MHObject that is returned
      * @param { number=12     } size  - the number of items to return per page
      * @param { Boolean=false } force
      *
      * @return { houndPagedRequest }  - MediaHound paged request object for this feed
      *
      */

    }, {
      key: 'fetchSuggested',
      value: function fetchSuggested() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('suggested');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /**
      * mhUser.fetchFollowing()
      * @param force {boolean=false}
      * @returns {Promise}
      */

    }, {
      key: 'fetchFollowing',
      value: function fetchFollowing() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('following');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'fetchFollowers',
      value: function fetchFollowers() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('followers');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /*
      * mhUser.linkService()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'fetchServiceSettings',

      /*
      * mhUser.fetchServiceSettings()
      *
      * @return { Promise }
      *
      */
      value: function fetchServiceSettings(serv) {

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
          //data   : { 'successRedirectUrl' : 'http://www.mediahound.com',  'failureRedirectUrl' : 'http://www.mediahound.com'},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).catch(function (response) {
          console.error(response);
        }).then(function (response) {
          if (response === undefined) {
            return 500;
          } else {
            return response;
          }
        });
      }

      /*
      * mhUser.fetchTwitterFollowers()
      *
      * @return { PagedRequest }
      *
      */

    }, {
      key: 'fetchTwitterFollowers',
      value: function fetchTwitterFollowers() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('settings') + '/twitter/friends';
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /*
      * mhUser.fetchFacebookFriends()
      *
      * @return { PagedRequest }
      *
      */

    }, {
      key: 'fetchFacebookFriends',
      value: function fetchFacebookFriends() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('settings') + '/facebook/friends';
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHUser.prototype), 'jsonProperties', this), {
          metadata: MHUserMetadata
        });
      }
    }, {
      key: 'isCurrentUser',
      get: function get() {
        var currentUser = System.get('../../src/models/user/MHLoginSession.js').MHLoginSession.currentUser;
        //console.warn('circular dep: (currentUser) ', currentUser);
        return this.isEqualToMHObject(currentUser);
      }

      /*
      * Register New User on MediaHound
      *  Required Params
      *    username          { String }
      *    password          { String }
      *    email             { String }
      *    firstName         { String }
      *    lastName          { String }
      *
      *  Optional Params
      *    role              { Integer }
      *    phoneNumber       { String }
      *    description       { String }
      *    onboarded         { boolean}
      *    facebookToken     { String }
      *    spotifyToken      { String }
      *    spotifyUsername   { String }
      *    rdioToken         { String }
      *    rdioAccessToken   { String }
      *
      * Returns Promise that resolves to a MHUser object.
      *
      */

    }], [{
      key: 'registerNewUser',
      value: function registerNewUser(username, password, email, firstName, lastName, optional) {
        var path = MHUser.rootEndpoint + '/new',
            data = optional && (typeof optional === 'undefined' ? 'undefined' : babelHelpers.typeof(optional)) === 'object' && !(optional instanceof Array || optional instanceof String) ? optional : {},
            notString = function notString(obj) {
          return typeof obj !== 'string' && !(obj instanceof String);
        };

        // Check for required params
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

        // TODO: call validate username and email before register?
        return houndRequest({
          method: 'POST',
          endpoint: path,
          'data': data,
          withCredentials: true,
          headers: {
            //'Accept':'application/json',
            //'Content-Type':'application/json'
          }
        }).then(function (parsed) {
          return parsed.metadata;
        });
        /*
        .catch(function(error){
        console.error('Error on MHUser.registerNewUser: ', error);
        throw new Error('Problem registring new User');
        });
        */
      }

      /**
      * fetchSettings(mhid)
      * @param mhid
      * Fetches the settings for the current logged in user.
      */

    }, {
      key: 'fetchSettings',
      value: function fetchSettings(mhid) {
        if (!mhid || typeof mhid !== 'string' && !(mhid instanceof String)) {
          throw new TypeError('mhid must be type string in MHUser.fetchSettings');
        }
        var path = MHUser.rootEndpoint + '/' + mhid + '/settings/internal';

        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          log('valid settings response: ', response);
          return response.internalSettings;
        }).catch(function (error) {
          console.log('error in fetchSettings: ', error.error.message);
          console.error(error.error.stack);
          return false;
        });
      }

      /**
      * fetchSourceSettings(mhid)
      * @param mhid
      * Fetches the settings for the current logged in user.
      */

    }, {
      key: 'fetchSourceSettings',
      value: function fetchSourceSettings(mhid) {
        if (!mhid || typeof mhid !== 'string' && !(mhid instanceof String)) {
          throw new TypeError('mhid must be type string in MHUser.fetchSourceSettings');
        }
        var path = MHUser.rootEndpoint + '/' + mhid + '/settings/sources';

        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          response = MHRelationalPair.createFromArray(response.content);
          console.log('valid settings response: ', response);
          return response;
        }).catch(function (error) {
          console.log('error in fetchSourceSettings: ', error.error.message);
          console.error(error.error.stack);
          return false;
        });
      }

      /**
      * updateSettings(mhid,updates)
      *
      * @param updates
      * updates must be passed into updateSettings as an object with three required params.
      * An example of updating the boolean value of onboarded.
      * {
      *   "operation":"replace",
      *   "property":"onboarded",
      *   "value":Boolean
      * }
      * operation refers to the actions "replace", "add", or "remove"
      * property is the property you want to change, i.e. "onboarded", "access", or "tooltips"
      * value is either a boolean or string based on context of the request
      *
      * Another exmaple for updating tooltips:
      * {
      *   "operation":"add",
      *   "property":"tooltips",
      *   "value":["webapptooltip1", "webapptooltip2", "webapptooltip3"]
      * }
      * @returns {Promise}
      */

    }, {
      key: 'updateSettings',
      value: function updateSettings(mhid, updates) {
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
        }).catch(function (err) {
          console.log('error on profile update: ', err);
          throw err;
        });
      }

      /** TODO: refactor after new auth system
      *
      */

    }, {
      key: 'validateUsername',
      value: function validateUsername(username) {
        if (!username || typeof username !== 'string' && !(username instanceof String)) {
          throw new TypeError('Username must be type string in MHUser.validateUsername');
        }
        var path = MHUser.rootEndpoint + '/validate/username/' + encodeURIComponent(username);

        // returns 200 for acceptable user name
        // returns 406 for taken user name
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          return response;
        }).catch(function (error) {
          if (error.xhr.status === 406) {
            console.error('The username ' + username + ' is already taken.');
          } else {
            console.log('error in validate username: ', error.error.message);
            console.error(error.error.stack);
          }
          return false;
        });
      }

      /** TODO: refactor after new auth system
      *
      */

    }, {
      key: 'validateEmail',
      value: function validateEmail(email) {
        if (!email || typeof email !== 'string' && !(email instanceof String)) {
          throw new TypeError('Email must be type string in MHUser.validateEmail');
        }
        var path = MHUser.rootEndpoint + '/validate/email/' + encodeURIComponent(email);

        // returns 200 for acceptable user name
        // returns 406 for taken user name
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          //console.log('valid email response: ', response);
          return response;
        }).catch(function (error) {
          if (error.xhr.status === 406) {
            console.error('The email ' + email + ' is already registered.');
          } else {
            console.log('error in validate username: ', error.error.message);
            console.error(error.error.stack);
          }
          return false;
        });
      }
      /* TODO: change endpoint to CamelCase and to use mhid?
      * mhUser.forgotUsernameWithEmail()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'forgotUsernameWithEmail',
      value: function forgotUsernameWithEmail(email) {
        if (!email || typeof email !== 'string' && !(email instanceof String)) {
          throw new TypeError('Email must be type string in MHUser.forgotUsernameWithEmail');
        }
        var path = MHUser.rootEndpoint + '/forgotusername',
            data = {};

        data.email = email;

        // returns 200 for acceptable user name
        // returns 406 for taken user name
        return houndRequest({
          method: 'POST',
          endpoint: path,
          withCredentials: false,
          data: data
        }).then(function (response) {
          //  console.log('valid forgotUsernameWithEmail: ', response);
          return response;
        }).catch(function (error) {
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
      }
      /* TODO: change endpoint to CamelCase and to use mhid?
      * mhUser.forgotPasswordWithEmail()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'forgotPasswordWithEmail',
      value: function forgotPasswordWithEmail(email) {
        if (!email || typeof email !== 'string' && !(email instanceof String)) {
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
        }).then(function (response) {
          console.log('valid forgotPasswordWithEmail: ', response);
          return response;
        }).catch(function (error) {
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
      }
      /* TODO: change endpoint to CamelCase and to use mhid?
      * mhUser.forgotPasswordWithEmail()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'forgotPasswordWithUsername',
      value: function forgotPasswordWithUsername(username) {
        if (!username || typeof username !== 'string' && !(username instanceof String)) {
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
        }).then(function (response) {
          console.log('valid forgotPasswordWithUsername: ', response);
          return response;
        }).catch(function (error) {
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
      }
      /* TODO: change endpoint to CamelCase and to use mhid?
      * mhUser.newPassword()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'newPassword',
      value: function newPassword(password, ticket) {

        if (!password || typeof password !== 'string' && !(password instanceof String)) {
          throw new TypeError('password must be type string in MHUser.newPassword');
        }
        if (!ticket || typeof ticket !== 'string' && !(ticket instanceof String)) {
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
        }).then(function (response) {
          console.log('valid newPassword: ', response);
          return response;
        }).catch(function (error) {
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
      }
    }, {
      key: 'fetchByUsername',
      value: function fetchByUsername(username) {
        var view = arguments.length <= 1 || arguments[1] === undefined ? 'full' : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        if (!username || typeof username !== 'string' && !(username instanceof String)) {
          throw new TypeError('Username not of type String in fetchByUsername');
        }
        if (MHObject.getPrefixFromMhid(username) != null) {
          throw new TypeError('Passed mhid to fetchByUsername, please use MHObject.fetchByMhid for this request.');
        }
        if (view === null || view === undefined) {
          view = 'full';
        }

        log('in fetchByUsername, looking for: ' + username);

        // Check LRU for altId === username
        if (!force && mhidLRU.hasAltId(username)) {
          return Promise.resolve(mhidLRU.getByAltId(username));
        }

        var path = MHUser.rootEndpoint + '/lookup/' + username,
            newObj;

        return houndRequest({
          method: 'GET',
          endpoint: path,
          withCredentials: true,
          params: {
            view: view
          }
        }).then(function (response) {
          newObj = MHObject.create(response);
          mhidLRU.putMHObj(newObj);
          return newObj;
        });
      }

      /* TODO: Refactor to api 1.0 specs
      * MHUser.fetchFeaturedUsers()
      *
      * @return { Promise } - resloves to an array of featured users of type MHUser
      *
      */

    }, {
      key: 'fetchFeaturedUsers',
      value: function fetchFeaturedUsers() {
        var path = this.rootSubendpoint('featured');
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          return Promise.all(MHObject.fetchByMhids(response));
        });
      }
    }, {
      key: 'linkService',
      value: function linkService(serv, succ, fail) {

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
          //data   : { 'successRedirectUrl' : 'http://www.mediahound.com',  'failureRedirectUrl' : 'http://www.mediahound.com'},
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          console.log(response);
          return response;
        });
      }
      /*
      * mhUser.unlinkService()
      *
      * @return { Promise }
      *
      */

    }, {
      key: 'unlinkService',
      value: function unlinkService(serv) {
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
        }).then(function (response) {
          console.log(response);
          return response;
        });
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return 'mhusr';
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/user';
      }
    }]);
    return MHUser;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHUser, 'MHUser');
  })();

  /* taken from iOS
   *
   *  NSString* const MHLoginSessionUserProfileImageDidChange = @"LoginSessionUserProfileImageDidChange";
   *
   */

  var makeEvent = function makeEvent(name, options) {
    var evt;
    options.bubbles = options.bubbles || false;
    options.cancelable = options.cancelable || false;
    options.detail = options.detail || void 0;

    try {

      evt = new CustomEvent(name, options);
    } catch (err) {

      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(name, options.bubbles, options.cancelable, options.detail);
    }
    return evt;
  };

  /**
   *
   * Class Events
   *  mhUserLogin
   *  mhUserLogout
   *  mhSessionUserProfileImageChange
   *
   *  currently can't extend built in classes or else this would be:
   *    'MHUserLoginEvent extends CustomEvent'
   *
   */

  var MHUserLoginEvent = (function () {
    function MHUserLoginEvent() {
      babelHelpers.classCallCheck(this, MHUserLoginEvent);
    }

    babelHelpers.createClass(MHUserLoginEvent, null, [{
      key: 'create',
      value: function create(mhUserObj) {
        return makeEvent('mhUserLogin', {
          bubbles: false,
          cancelable: false,
          detail: {
            mhUser: mhUserObj
          }
        });
      }
    }]);
    return MHUserLoginEvent;
  })();

  var MHUserLogoutEvent = (function () {
    function MHUserLogoutEvent() {
      babelHelpers.classCallCheck(this, MHUserLogoutEvent);
    }

    babelHelpers.createClass(MHUserLogoutEvent, null, [{
      key: 'create',
      value: function create(mhUserObj) {
        return makeEvent('mhUserLogout', {
          bubbles: false,
          cancelable: false,
          detail: {
            mhUser: mhUserObj
          }
        });
      }
    }]);
    return MHUserLogoutEvent;
  })();

  // class MHSessionUserProfileImageChange {
  //   static create(mhUserObj){
  //     return makeEvent('mhSessionUserProfileImageChange', {
  //       bubbles:    false,
  //       cancelable: false,
  //       detail: {
  //         mhUser: mhUserObj
  //       }
  //     });
  //   }
  // }

  // Singleton Containers

  var loggedInUser = null;
  var onboarded = false;
  var access = false;
  var count = null;
  // Hidden Restore from Storage function
  var restoreFromSessionStorage = function restoreFromSessionStorage() {
    var inStorage = window.sessionStorage.currentUser;

    if (inStorage) {
      //loggedInUser = MHObject.create(inStorage);
      return true;
    }
    return false;
  };

  // MediaHound Login Session Singleton
  /** @class MHLoginSession */
  var MHLoginSession = (function () {
    function MHLoginSession() {
      babelHelpers.classCallCheck(this, MHLoginSession);
    }

    babelHelpers.createClass(MHLoginSession, null, [{
      key: 'updateCount',
      value: function updateCount() {
        return houndRequest({
          method: 'GET',
          endpoint: MHUser.rootEndpoint + '/count'
        }).then(function (res) {
          count = res.count;
          return res;
        }).catch(function (err) {
          warn('Error fetching user count');
          error(err.error.stack);
          return count;
        });
      }

      /** DEPRECATED: updatedProfileImage doesn't need to be called, just fetch the current logged in user.
       * When A user updates their profile picture this will fire the event
       * and update the currentUser property.
       * @param  {MHUser} updatedUser
       * @returns {Boolean}
       */
      // static updatedProfileImage(updatedImage){
      //   console.log('updatedUploadImage: ', updatedUser, updatedUser instanceof MHUser, updatedUser.hasMhid(loggedInUser.mhid));
      //   if( !(updatedUser instanceof MHUser) || !updatedUser.hasMhid(loggedInUser.mhid) ){
      //     throw new TypeError("Updated Profile Image must be passed a new MHUser Object that equals the currently logged in user");
      //   }
      //
      //   loggedInUser = updatedUser;
      //   loggedInUser.fetchSocial();
      //   loggedInUser.fetchOwnedCollections();
      //
      //   // dispatch profile image changed event: 'mhUserProfileImageChanged'
      //   window.dispatchEvent(MHSessionUserProfileImageChange.create(loggedInUser));
      //
      //   return true;
      // }

      // DEPRECATED: Use MHUser.updateSettings() instead.
      // static completedOnboarding(){
      //   var path = MHUser.rootEndpoint + '/onboard';
      //   return houndRequest({
      //       method            : 'POST',
      //       endpoint          : path,
      //       'withCredentials' : true
      //     })
      //     .then(loginMap => {
      //       access    = loginMap.access;
      //       onboarded = loginMap.onboarded;
      //       console.log(loginMap);
      //       return loginMap;
      //     });
      // }

      /**
       *  MHLoginSession.login(username, password)
       *
       *  @param {string} username - the username for the user logging in
       *  @param {string} password - the password for the user logging in
       *
       *  @return {Promise<MHUser>} - resolves to MHUser object of logged in user
       */

    }, {
      key: 'login',
      value: function login(username, password) {
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
        }).then(function (loginMap) {
          if (!loginMap.Error) {
            return MHObject.fetchByMhid(loginMap.mhid).then(function (mhUser) {
              return [loginMap, mhUser];
            });
          } else {
            throw new Error(loginMap.Error);
          }
        }).then(function (mhUserMap) {
          if (mhUserMap[0].access === false) {

            mhUserMap[1].settings = {
              onboarded: mhUserMap[0].onboarded,
              access: mhUserMap[0].access
            };
            return mhUserMap[1];
          } else {
            return MHUser.fetchSettings(mhUserMap[1].mhid).then(function (settings) {
              mhUserMap[1].settings = settings;
              return mhUserMap[1];
            });
          }
        }).then(function (user) {
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
        }).catch(function (error) {
          //console.error('Error on MHLoginSession.login', error.error, 'xhr: ', error.xhr);
          throw new Error(error);
        });
      }

      /**
       * MHLoginSession.logout()
       *
       * @returns {Promise} - resolves to user that just logged out.
       */

    }, {
      key: 'logout',
      value: function logout() {
        var currentCookies = document.cookie.split('; ').map(function (c) {
          var keyVal = c.split('=');
          return {
            'key': keyVal[0],
            'value': keyVal[1]
          };
        });

        window.sessionStorage.currentUser = null;

        currentCookies.forEach(function (cookie) {
          if (cookie.key === 'JSESSIONID') {
            var expires = new Date(0).toGMTString();
            document.cookie = cookie.key + '=' + cookie.value + '; expires=' + expires + '; domain=.mediahound.com';
          }
        });

        // Dispatch logout event
        if ((typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)) !== undefined) {
          window.dispatchEvent(MHUserLogoutEvent.create(loggedInUser));
        }

        mhidLRU.removeAll();

        return Promise.resolve(loggedInUser).then(function (mhUser) {
          loggedInUser = null;
          access = false;
          onboarded = false;
          return mhUser;
        });
      }

      /**
       * @returns {Promise} - resolves to the user that has an open session.
       */

    }, {
      key: 'validateOpenSession',
      value: function validateOpenSession() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? "full" : arguments[0];

        var path = MHUser.rootEndpoint + '/validateSession';

        return houndRequest({
          method: 'GET',
          endpoint: path,
          params: {
            view: view
          },
          withCredentials: true,
          headers: {}
        }).then(function (loginMap) {

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
        }).then(function (user) {
          // loggedInUser.access = access;
          // loggedInUser.onboarded = onboarded;
          loggedInUser = user;
          //console.log(loggedInUser);
          window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));
          return loggedInUser;
        }).catch(function (error) {
          if (error.xhr.status === 401) {
            console.log('No open MediaHound session');
          }
          return error;
        });
      }
    }, {
      key: 'currentUser',

      /**
       * The Currently logged in MHUser object
       * @property {MHUser}
       * @static
       */
      get: function get() {
        return loggedInUser;
      }

      /**
       * True or False, is there an open session?
       * @property {Boolean}
       * @static
       */

    }, {
      key: 'openSession',
      get: function get() {
        return loggedInUser instanceof MHUser;
      }

      /**
       * If the currently logged in user has gone through the onboarding process.
       * @property {Boolean|null} onboarded
       */

    }, {
      key: 'onboarded',
      get: function get() {
        return onboarded;
      }

      /**
       * If the currently logged in user has access to the application.
       * @property {Boolean|null} access
       */

    }, {
      key: 'access',
      get: function get() {
        return access;
      }

      /**
       * The count of users in the system
       * @returns {number}
       */

    }, {
      key: 'count',
      get: function get() {
        return count;
      }
    }]);
    return MHLoginSession;
  })();

  // MediaHound Media Object
  var MHMedia = (function (_MHObject) {
    babelHelpers.inherits(MHMedia, _MHObject);

    function MHMedia() {
      babelHelpers.classCallCheck(this, MHMedia);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMedia).apply(this, arguments));
    }

    babelHelpers.createClass(MHMedia, [{
      key: 'fetchContent',

      /* TODO: DocJS
      * mhMed.fetchContent()
      *
      * @param force { Boolean } - force refetch of content
      * @return { Promise } - resolves to
      *
      */

      value: function fetchContent() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('content');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /* TODO: DocJS
       * mhMed.fetchSources()
       *
       * @param force { Boolean } - force refetch of content
       * @return { Promise } - resolves to
       *
       */

    }, {
      key: 'fetchSources',
      value: function fetchSources() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('sources');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /**
      * mhObj.fetchContributors(mhid,force)
      *
      * @param { string='full' } view - the view needed to depict each MHObject that is returned
      * @param { number=12     } size  - the number of items to return per page
      * @param { Boolean=false } force
      *
      * @return { houndPagedRequest }  - MediaHound paged request object for this feed
      *
      */

    }, {
      key: 'fetchContributors',
      value: function fetchContributors() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('contributors');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'fetchIVATrailer',
      value: function fetchIVATrailer() {
        var path = this.subendpoint('ivaTrailer');

        var cached = this.cachedResponseForPath(path);
        if (cached) {
          return cached;
        }

        var promise = houndRequest({
          method: 'GET',
          endpoint: path
        });

        this.setCachedResponse(promise, path);

        return promise;
      }

      /**
      * mhObj.fetchRelated(mhid,force)
      *
      * @param { string='full' } view - the view needed to depict each MHObject that is returned
      * @param { number=0      } page - the zero indexed page number to return
      * @param { number=12     } size  - the number of items to return per page
      * @param { Boolean=false } force
      *
      * @return { houndPagedRequest }  - MediaHound paged request object for this feed
      *
      */

    }, {
      key: 'fetchRelated',
      value: function fetchRelated() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('related');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'fetchShortestDistance',

      /**
      * mhObj.fetchShortestDistance(otherMhid)
      *
      * @param { otherMhid } otherMhid - the MHID for the object to calculate shortest path.
      *
      * @return { Number }  - Returns the shortest distance between the two objects.
      *                       If there is no path between the two objects, returns `null`.
      *
      */
      value: function fetchShortestDistance(otherMhid) {
        var path = this.subendpoint('shortestPath/' + otherMhid);
        return houndRequest({
          method: 'GET',
          endpoint: path
        }).then(function (response) {
          // This method returns an array of shortest paths.
          // Since we only care about the length, we can look at the first
          // shortest path and calculate its length.
          // The path includes both the start and mhid.
          // We do not count the start as a 'step', so we subtract one.
          return response.paths[0].path.length - 1;
        }).catch(function (err) {
          if (err.xhr.status === 404) {
            // A 404 indicates there is no path between the two nodes.
            return null;
          } else {
            throw err;
          }
        });
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHMedia.prototype), 'jsonProperties', this), {
          metadata: MHMediaMetadata,
          keyContributors: [MHRelationalPair],
          primaryGroup: MHRelationalPair
        });
      }
    }], [{
      key: 'fetchRelatedTo',
      value: function fetchRelatedTo(medias) {
        var filters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var view = arguments.length <= 2 || arguments[2] === undefined ? 'full' : arguments[2];
        var size = arguments.length <= 3 || arguments[3] === undefined ? 12 : arguments[3];
        var force = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

        var factors = medias.map(function (m) {
          if ('metadata' in m) {
            return m.metadata.mhid;
          } else {
            return m;
          }
        });
        var path = this.rootSubendpoint('related');
        var params = {
          factors: JSON.stringify(factors),
          filters: JSON.stringify(filters)
        };

        return this.fetchRootPagedEndpoint(path, params, view, size, force);
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/media';
      }
    }]);
    return MHMedia;
  })(MHObject);

  // MediaHound Album Object
  var MHAlbum = (function (_MHMedia) {
    babelHelpers.inherits(MHAlbum, _MHMedia);

    function MHAlbum() {
      babelHelpers.classCallCheck(this, MHAlbum);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAlbum).apply(this, arguments));
    }

    babelHelpers.createClass(MHAlbum, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhalb';
      }
    }]);
    return MHAlbum;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHAlbum, 'MHAlbum');
  })();

  // MediaHound Album Object
  var MHAlbumSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHAlbumSeries, _MHMedia);

    function MHAlbumSeries() {
      babelHelpers.classCallCheck(this, MHAlbumSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAlbumSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHAlbumSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhals';
      }
    }]);
    return MHAlbumSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHAlbumSeries, 'MHAlbumSeries');
  })();

  // MediaHound Anthology Object
  var MHAnthology = (function (_MHMedia) {
    babelHelpers.inherits(MHAnthology, _MHMedia);

    function MHAnthology() {
      babelHelpers.classCallCheck(this, MHAnthology);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAnthology).apply(this, arguments));
    }

    babelHelpers.createClass(MHAnthology, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhath';
      }
    }]);
    return MHAnthology;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHAnthology, 'MHAnthology');
  })();

  // MediaHound Book (Track) Object
  var MHBook = (function (_MHMedia) {
    babelHelpers.inherits(MHBook, _MHMedia);

    function MHBook() {
      babelHelpers.classCallCheck(this, MHBook);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHBook).apply(this, arguments));
    }

    babelHelpers.createClass(MHBook, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhbok';
      }
    }]);
    return MHBook;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHBook, 'MHBook');
  })();

  // MediaHound Book Series Object
  var MHBookSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHBookSeries, _MHMedia);

    function MHBookSeries() {
      babelHelpers.classCallCheck(this, MHBookSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHBookSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHBookSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhbks';
      }
    }]);
    return MHBookSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHBookSeries, 'MHBookSeries');
  })();

  // MediaHound Comic Book Object
  var MHComicBook = (function (_MHMedia) {
    babelHelpers.inherits(MHComicBook, _MHMedia);

    function MHComicBook() {
      babelHelpers.classCallCheck(this, MHComicBook);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHComicBook).apply(this, arguments));
    }

    babelHelpers.createClass(MHComicBook, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhcbk';
      }
    }]);
    return MHComicBook;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHComicBook, 'MHComicBook');
  })();

  // MediaHound Comic Book Series Object
  var MHComicBookSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHComicBookSeries, _MHMedia);

    function MHComicBookSeries() {
      babelHelpers.classCallCheck(this, MHComicBookSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHComicBookSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHComicBookSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhcbs';
      }
    }]);
    return MHComicBookSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHComicBookSeries, 'MHComicBookSeries');
  })();

  // MediaHound Game (Track) Object
  var MHGame = (function (_MHMedia) {
    babelHelpers.inherits(MHGame, _MHMedia);

    function MHGame() {
      babelHelpers.classCallCheck(this, MHGame);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGame).apply(this, arguments));
    }

    babelHelpers.createClass(MHGame, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgam';
      }
    }]);
    return MHGame;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHGame, 'MHGame');
  })();

  // MediaHound Game Series Object
  var MHGameSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHGameSeries, _MHMedia);

    function MHGameSeries() {
      babelHelpers.classCallCheck(this, MHGameSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGameSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHGameSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgms';
      }
    }]);
    return MHGameSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHGameSeries, 'MHGameSeries');
  })();

  // MediaHound Graphic Novel Object
  var MHGraphicNovel = (function (_MHMedia) {
    babelHelpers.inherits(MHGraphicNovel, _MHMedia);

    function MHGraphicNovel() {
      babelHelpers.classCallCheck(this, MHGraphicNovel);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGraphicNovel).apply(this, arguments));
    }

    babelHelpers.createClass(MHGraphicNovel, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgnl';
      }
    }]);
    return MHGraphicNovel;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHGraphicNovel, 'MHGraphicNovel');
  })();

  // MediaHound Graphic Novel Series Object
  var MHGraphicNovelSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHGraphicNovelSeries, _MHMedia);

    function MHGraphicNovelSeries() {
      babelHelpers.classCallCheck(this, MHGraphicNovelSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGraphicNovelSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHGraphicNovelSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgns';
      }
    }]);
    return MHGraphicNovelSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHGraphicNovelSeries, 'MHGraphicNovelSeries');
  })();

  // MediaHound Movie Object
  var MHMovie = (function (_MHMedia) {
    babelHelpers.inherits(MHMovie, _MHMedia);

    function MHMovie() {
      babelHelpers.classCallCheck(this, MHMovie);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMovie).apply(this, arguments));
    }

    babelHelpers.createClass(MHMovie, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhmov';
      }
    }]);
    return MHMovie;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHMovie, 'MHMovie');
  })();

  // MediaHound Movie Series Object
  var MHMovieSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHMovieSeries, _MHMedia);

    function MHMovieSeries() {
      babelHelpers.classCallCheck(this, MHMovieSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMovieSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHMovieSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhmvs';
      }
    }]);
    return MHMovieSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHMovieSeries, 'MHMovieSeries');
  })();

  // MediaHound Music Video Object
  var MHMusicVideo = (function (_MHMedia) {
    babelHelpers.inherits(MHMusicVideo, _MHMedia);

    function MHMusicVideo() {
      babelHelpers.classCallCheck(this, MHMusicVideo);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMusicVideo).apply(this, arguments));
    }

    babelHelpers.createClass(MHMusicVideo, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhmsv';
      }
    }]);
    return MHMusicVideo;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHMusicVideo, 'MHMusicVideo');
  })();

  // MediaHound Novella Object
  var MHNovella = (function (_MHMedia) {
    babelHelpers.inherits(MHNovella, _MHMedia);

    function MHNovella() {
      babelHelpers.classCallCheck(this, MHNovella);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHNovella).apply(this, arguments));
    }

    babelHelpers.createClass(MHNovella, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhnov';
      }
    }]);
    return MHNovella;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHNovella, 'MHNovella');
  })();

  // MediaHound Periodical Object
  var MHPeriodical = (function (_MHMedia) {
    babelHelpers.inherits(MHPeriodical, _MHMedia);

    function MHPeriodical() {
      babelHelpers.classCallCheck(this, MHPeriodical);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHPeriodical).apply(this, arguments));
    }

    babelHelpers.createClass(MHPeriodical, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhpdc';
      }
    }]);
    return MHPeriodical;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHPeriodical, 'MHPeriodical');
  })();

  // MediaHound Periodical Series Object
  var MHPeriodicalSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHPeriodicalSeries, _MHMedia);

    function MHPeriodicalSeries() {
      babelHelpers.classCallCheck(this, MHPeriodicalSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHPeriodicalSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHPeriodicalSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhpds';
      }
    }]);
    return MHPeriodicalSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHPeriodicalSeries, 'MHPeriodicalSeries');
  })();

  // MediaHound ShowEpisode Object
  var MHShowEpisode = (function (_MHMedia) {
    babelHelpers.inherits(MHShowEpisode, _MHMedia);

    function MHShowEpisode() {
      babelHelpers.classCallCheck(this, MHShowEpisode);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHShowEpisode).apply(this, arguments));
    }

    babelHelpers.createClass(MHShowEpisode, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsep';
      }
    }]);
    return MHShowEpisode;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHShowEpisode, 'MHShowEpisode');
  })();

  // MediaHound ShowSeason (Track) Object
  var MHShowSeason = (function (_MHMedia) {
    babelHelpers.inherits(MHShowSeason, _MHMedia);

    function MHShowSeason() {
      babelHelpers.classCallCheck(this, MHShowSeason);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHShowSeason).apply(this, arguments));
    }

    babelHelpers.createClass(MHShowSeason, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhssn';
      }
    }]);
    return MHShowSeason;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHShowSeason, 'MHShowSeason');
  })();

  // MediaHound ShowSeries (Track) Object
  var MHShowSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHShowSeries, _MHMedia);

    function MHShowSeries() {
      babelHelpers.classCallCheck(this, MHShowSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHShowSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHShowSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsss';
      }
    }]);
    return MHShowSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHShowSeries, 'MHShowSeries');
  })();

  // MediaHound Track Object
  var MHTrack = (function (_MHMedia) {
    babelHelpers.inherits(MHTrack, _MHMedia);

    function MHTrack() {
      babelHelpers.classCallCheck(this, MHTrack);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHTrack).apply(this, arguments));
    }

    babelHelpers.createClass(MHTrack, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsng';
      }
    }]);
    return MHTrack;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHTrack, 'MHTrack');
  })();

  // MediaHound Special Media Object
  // TV Special is the most common use case
  var MHSpecial = (function (_MHMedia) {
    babelHelpers.inherits(MHSpecial, _MHMedia);

    function MHSpecial() {
      babelHelpers.classCallCheck(this, MHSpecial);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSpecial).apply(this, arguments));
    }

    babelHelpers.createClass(MHSpecial, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhspc';
      }
    }]);
    return MHSpecial;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHSpecial, 'MHSpecial');
  })();

  // MediaHound Special Series Object
  var MHSpecialSeries = (function (_MHMedia) {
    babelHelpers.inherits(MHSpecialSeries, _MHMedia);

    function MHSpecialSeries() {
      babelHelpers.classCallCheck(this, MHSpecialSeries);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSpecialSeries).apply(this, arguments));
    }

    babelHelpers.createClass(MHSpecialSeries, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsps';
      }
    }]);
    return MHSpecialSeries;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHSpecialSeries, 'MHSpecialSeries');
  })();

  // MediaHound Trailer Object
  var MHTrailer = (function (_MHMedia) {
    babelHelpers.inherits(MHTrailer, _MHMedia);

    function MHTrailer() {
      babelHelpers.classCallCheck(this, MHTrailer);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHTrailer).apply(this, arguments));
    }

    babelHelpers.createClass(MHTrailer, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhtrl';
      }
    }]);
    return MHTrailer;
  })(MHMedia);

  (function () {
    MHObject.registerConstructor(MHTrailer, 'MHTrailer');
  })();

  /**
   * @classdesc Mediahound Collection Object (MHCollection) inherits from MHObject
   */
  var MHCollection = (function (_MHObject) {
    babelHelpers.inherits(MHCollection, _MHObject);

    function MHCollection() {
      babelHelpers.classCallCheck(this, MHCollection);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHCollection).apply(this, arguments));
    }

    babelHelpers.createClass(MHCollection, [{
      key: 'editMetaData',

      /**
      * @param {string} name - the name of the new collection for the currently logged in user.
      * @returns {Promise<MHCollection>} - a Promise that resolves to the newly created MHCollection
      * @static
      */
      value: function editMetaData(name, description) {
        var path = this.subendpoint('update'),
            data = {};

        if (description) {
          data = {
            "name": name,
            "description": description
          };
        } else if (name) {
          data = { "name": name };
        }

        return houndRequest({
          method: 'PUT',
          endpoint: path,
          data: data
        }).then(function (response) {
          return MHObject.fetchByMhid(response.metadata.mhid);
        }).then(function (newCollection) {
          if (MHLoginSession.openSession) {
            MHLoginSession.currentUser.fetchOwnedCollections("full", 12, true);
          }
          return newCollection;
        });
      }
      /**
       * @param {MHMedia} - a MHMedia object to add to this collection
       * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
       */

    }, {
      key: 'addContent',
      value: function addContent(content) {
        return this.addContents([content]);
      }

      /**
       * @param {Array<MHMedia>} - an Array of MHMedia objects to add to this collection
       * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
       */

    }, {
      key: 'addContents',
      value: function addContents(contents) {
        return this.changeContents(contents, 'add');
      }

      /**
       * @param {MHMedia} - a MHMedia object to remove from this collection
       * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
       */

    }, {
      key: 'removeContent',
      value: function removeContent(content) {
        return this.removeContents([content]);
      }

      /**
       * @param {Array<MHMedia>} - an Array of MHMedia objects to remove from this collection
       * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
       */

    }, {
      key: 'removeContents',
      value: function removeContents(contents) {
        return this.changeContents(contents, 'remove');
      }

      /**
       * @private
       * @param {Array<MHMedia>} - an Array of MHMedia objects to add or remove from this collection
       * @param {string} sub - the subendpoint string, 'add' or 'remove'
       * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
       */

    }, {
      key: 'changeContents',
      value: function changeContents(contents, sub) {
        var _this2 = this;

        if (!Array.isArray(contents)) {
          throw new TypeError('Contents must be an array in changeContents');
        }
        if (typeof sub !== 'string' || sub !== 'add' && sub !== 'remove') {
          throw new TypeError('Subendpoint must be add or remove');
        }

        var path = this.subendpoint(sub),
            mhids = contents.map(function (v) {
          if (v instanceof MHObject) {
            if (!(v instanceof MHAction)) {
              return v.mhid;
            } else {
              console.error('MHActions including like, favorite, create, and post cannot be collected. Please resubmit with actual content.');
            }
          } else if (typeof v === 'string' && MHObject.prefixes.indexOf(MHObject.getPrefixFromMhid(v)) > -1) {
            // TODO double check this if statement
            return v;
          }
          return null;
        }).filter(function (v) {
          return v !== null;
        });

        // invalidate mixlistPromise
        this.mixlistPromise = null;
        if (mhids.length > -1) {

          log('content array to be submitted: ', mhids);

          return this.content = houndRequest({
            method: 'PUT',
            endpoint: path,
            data: {
              'content': mhids
            }
          }).catch((function (err) {
            _this2.content = null;throw err;
          }).bind(this)).then(function (response) {
            // fetch social for original passed in mhobjs
            contents.forEach(function (v) {
              return typeof v.fetchSocial === 'function' && v.fetchSocial(true);
            });
            return response;
          });
        } else {
          console.error('To add or remove content from a Collection the content array must include at least one MHObject');
        }
      }

      /**
       * @param {boolean} force - whether to force a call to the server instead of using the cached ownersPromise
       * @returns {Promise} - a promise that resolves to a list of mhids for the owners of this MHCollection
       */

    }, {
      key: 'fetchOwners',
      value: function fetchOwners() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('owners');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'fetchContent',
      value: function fetchContent() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('content');
        return this.fetchPagedEndpoint(path, view, size, force);
      }

      /**
       * @param {boolean} force - whether to force a call to the server instead of using the cached mixlistPromise
       * @returns {Promise} - a promise that resolves to the list of mixlist content for this MHCollection
       */

    }, {
      key: 'fetchMixlist',
      value: function fetchMixlist() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('mixlist');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHCollection.prototype), 'jsonProperties', this), {
          metadata: MHCollectionMetadata,
          firstContentImage: { mapper: MHObject.create },
          primaryOwner: { mapper: MHObject.create }
        });
      }

      // Static Mixlist enums

    }], [{
      key: 'createWithName',

      /**
       * @param {string} name - the name of the new collection for the currently logged in user.
       * @returns {Promise<MHCollection>} - a Promise that resolves to the newly created MHCollection
       * @static
       */
      value: function createWithName(name, description) {
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
        }).then(function (response) {
          return MHObject.fetchByMhid(response.metadata.mhid);
        }).then(function (newCollection) {
          if (MHLoginSession.openSession) {
            MHLoginSession.currentUser.fetchOwnedCollections("full", 12, true);
          }
          return newCollection;
        });
      }
    }, {
      key: 'MIXLIST_TYPE_NONE',
      get: function get() {
        return 'none';
      }
    }, {
      key: 'MIXLIST_TYPE_PARTIAL',
      get: function get() {
        return 'partial';
      }
    }, {
      key: 'MIXLIST_TYPE_FULL',
      get: function get() {
        return 'full';
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return 'mhcol';
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/collection';
      }
    }]);
    return MHCollection;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHCollection, 'MHCollection');
  })();

  var MHImage = (function (_MHObject) {
    babelHelpers.inherits(MHImage, _MHObject);

    function MHImage() {
      babelHelpers.classCallCheck(this, MHImage);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHImage).apply(this, arguments));
    }

    babelHelpers.createClass(MHImage, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHImage.prototype), 'jsonProperties', this), {
          metadata: MHImageMetadata
        });
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhimg';
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/image';
      }
    }]);
    return MHImage;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHImage, 'MHImage');
  })();

  var MHPagingInfo = (function () {
    function MHPagingInfo(args) {
      babelHelpers.classCallCheck(this, MHPagingInfo);

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHPagingInfo, [{
      key: 'jsonProperties',
      get: function get() {
        return {
          next: String
        };
      }
    }]);
    return MHPagingInfo;
  })();

  var MHPagedResponse = (function () {
    function MHPagedResponse(args) {
      babelHelpers.classCallCheck(this, MHPagedResponse);

      this.cachedNextResponse = null;
      this.fetchNextOperation = null;

      jsonCreateWithArgs(args, this);
    }

    babelHelpers.createClass(MHPagedResponse, [{
      key: 'fetchNext',
      value: function fetchNext() {
        var _this = this;

        var cachedResponse = this.cachedNextResponse;
        if (cachedResponse) {
          return new Promise(function (resolve) {
            resolve(cachedResponse);
          });
        }

        return this.fetchNextOperation(this.pagingInfo.next).then(function (response) {
          _this.cachedNextResponse = response;
          return response;
        });
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return {
          content: [MHRelationalPair],
          pagingInfo: MHPagingInfo
        };
      }
    }, {
      key: 'hasMorePages',
      get: function get() {
        return this.pagingInfo.next !== undefined && this.pagingInfo.next !== null;
      }
    }]);
    return MHPagedResponse;
  })();

  var MHTrait = (function (_MHObject) {
    babelHelpers.inherits(MHTrait, _MHObject);

    function MHTrait() {
      babelHelpers.classCallCheck(this, MHTrait);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHTrait).apply(this, arguments));
    }

    babelHelpers.createClass(MHTrait, [{
      key: 'fetchContent',
      value: function fetchContent() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('content');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHTrait.prototype), 'jsonProperties', this), {
          metadata: MHTraitMetadata
        });
      }
    }], [{
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/trait';
      }
    }]);
    return MHTrait;
  })(MHObject);

  // MediaHound Trait Object
  var MHGenre = (function (_MHTrait) {
    babelHelpers.inherits(MHGenre, _MHTrait);

    function MHGenre() {
      babelHelpers.classCallCheck(this, MHGenre);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGenre).apply(this, arguments));
    }

    babelHelpers.createClass(MHGenre, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgnr';
      }
    }]);
    return MHGenre;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHGenre, 'MHGenre');
  })();

  // MediaHound Trait Object
  var MHSubGenre = (function (_MHTrait) {
    babelHelpers.inherits(MHSubGenre, _MHTrait);

    function MHSubGenre() {
      babelHelpers.classCallCheck(this, MHSubGenre);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSubGenre).apply(this, arguments));
    }

    babelHelpers.createClass(MHSubGenre, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsgn';
      }
    }]);
    return MHSubGenre;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHSubGenre, 'MHSubGenre');
  })();

  // MediaHound Trait Object
  var MHMood = (function (_MHTrait) {
    babelHelpers.inherits(MHMood, _MHTrait);

    function MHMood() {
      babelHelpers.classCallCheck(this, MHMood);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMood).apply(this, arguments));
    }

    babelHelpers.createClass(MHMood, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhmod';
      }
    }]);
    return MHMood;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHMood, 'MHMood');
  })();

  // MediaHound Trait Object
  var MHQuality = (function (_MHTrait) {
    babelHelpers.inherits(MHQuality, _MHTrait);

    function MHQuality() {
      babelHelpers.classCallCheck(this, MHQuality);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHQuality).apply(this, arguments));
    }

    babelHelpers.createClass(MHQuality, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhqlt';
      }
    }]);
    return MHQuality;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHQuality, 'MHQuality');
  })();

  // MediaHound Trait Object
  var MHStyleElement = (function (_MHTrait) {
    babelHelpers.inherits(MHStyleElement, _MHTrait);

    function MHStyleElement() {
      babelHelpers.classCallCheck(this, MHStyleElement);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHStyleElement).apply(this, arguments));
    }

    babelHelpers.createClass(MHStyleElement, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsty';
      }
    }]);
    return MHStyleElement;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHStyleElement, 'MHStyleElement');
  })();

  // MediaHound Trait Object
  var MHStoryElement = (function (_MHTrait) {
    babelHelpers.inherits(MHStoryElement, _MHTrait);

    function MHStoryElement() {
      babelHelpers.classCallCheck(this, MHStoryElement);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHStoryElement).apply(this, arguments));
    }

    babelHelpers.createClass(MHStoryElement, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhstr';
      }
    }]);
    return MHStoryElement;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHStoryElement, 'MHStoryElement');
  })();

  // MediaHound Trait Object
  var MHMaterialSource = (function (_MHTrait) {
    babelHelpers.inherits(MHMaterialSource, _MHTrait);

    function MHMaterialSource() {
      babelHelpers.classCallCheck(this, MHMaterialSource);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHMaterialSource).apply(this, arguments));
    }

    babelHelpers.createClass(MHMaterialSource, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhmts';
      }
    }]);
    return MHMaterialSource;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHMaterialSource, 'MHMaterialSource');
  })();

  // MediaHound Trait Object
  var MHTheme = (function (_MHTrait) {
    babelHelpers.inherits(MHTheme, _MHTrait);

    function MHTheme() {
      babelHelpers.classCallCheck(this, MHTheme);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHTheme).apply(this, arguments));
    }

    babelHelpers.createClass(MHTheme, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhthm';
      }
    }]);
    return MHTheme;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHTheme, 'MHTheme');
  })();

  // MediaHound Trait Object
  var MHAchievement = (function (_MHTrait) {
    babelHelpers.inherits(MHAchievement, _MHTrait);

    function MHAchievement() {
      babelHelpers.classCallCheck(this, MHAchievement);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAchievement).apply(this, arguments));
    }

    babelHelpers.createClass(MHAchievement, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhach';
      }
    }]);
    return MHAchievement;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHAchievement, 'MHAchievement');
  })();

  // MediaHound Trait Object
  var MHEra = (function (_MHTrait) {
    babelHelpers.inherits(MHEra, _MHTrait);

    function MHEra() {
      babelHelpers.classCallCheck(this, MHEra);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHEra).apply(this, arguments));
    }

    babelHelpers.createClass(MHEra, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhera';
      }
    }]);
    return MHEra;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHEra, 'MHEra');
  })();

  // MediaHound Trait Object
  var MHAudience = (function (_MHTrait) {
    babelHelpers.inherits(MHAudience, _MHTrait);

    function MHAudience() {
      babelHelpers.classCallCheck(this, MHAudience);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHAudience).apply(this, arguments));
    }

    babelHelpers.createClass(MHAudience, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhaud';
      }
    }]);
    return MHAudience;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHAudience, 'MHAudience');
  })();

  // MediaHound Trait Object
  var MHFlag = (function (_MHTrait) {
    babelHelpers.inherits(MHFlag, _MHTrait);

    function MHFlag() {
      babelHelpers.classCallCheck(this, MHFlag);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHFlag).apply(this, arguments));
    }

    babelHelpers.createClass(MHFlag, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhflg';
      }
    }]);
    return MHFlag;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHFlag, 'MHFlag');
  })();

  // MediaHound Trait Object
  var MHGraphGenre = (function (_MHTrait) {
    babelHelpers.inherits(MHGraphGenre, _MHTrait);

    function MHGraphGenre() {
      babelHelpers.classCallCheck(this, MHGraphGenre);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHGraphGenre).apply(this, arguments));
    }

    babelHelpers.createClass(MHGraphGenre, null, [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhgrg';
      }
    }]);
    return MHGraphGenre;
  })(MHTrait);

  (function () {
    MHObject.registerConstructor(MHGraphGenre, 'MHGraphGenre');
  })();

  // MediaHound Contributor Object
  var MHContributor = (function (_MHObject) {
    babelHelpers.inherits(MHContributor, _MHObject);

    function MHContributor() {
      babelHelpers.classCallCheck(this, MHContributor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHContributor).apply(this, arguments));
    }

    babelHelpers.createClass(MHContributor, [{
      key: 'fetchMedia',

      /*
       * TODO DocJS
       */
      value: function fetchMedia() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? 'full' : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 12 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.subendpoint('media');
        return this.fetchPagedEndpoint(path, view, size, force);
      }
    }, {
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHContributor.prototype), 'jsonProperties', this), {
          metadata: MHContributorMetadata
        });
      }

      /*
       * TODO DocJS
       */

    }, {
      key: 'isGroup',
      get: function get() {
        return !this.isIndividual;
      }

      /*
       * TODO DocJS
       */

    }, {
      key: 'isFictional',
      get: function get() {
        return !this.isReal;
      }
    }], [{
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/contributor';
      }
    }]);
    return MHContributor;
  })(MHObject);

  // MediaHound Contributor Object
  var MHRealIndividualContributor = (function (_MHContributor) {
    babelHelpers.inherits(MHRealIndividualContributor, _MHContributor);

    function MHRealIndividualContributor() {
      babelHelpers.classCallCheck(this, MHRealIndividualContributor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHRealIndividualContributor).apply(this, arguments));
    }

    babelHelpers.createClass(MHRealIndividualContributor, [{
      key: 'isIndividual',
      get: function get() {
        return true;
      }
    }, {
      key: 'isReal',
      get: function get() {
        return true;
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhric';
      }
    }]);
    return MHRealIndividualContributor;
  })(MHContributor);

  (function () {
    MHObject.registerConstructor(MHRealIndividualContributor, 'MHRealIndividualContributor');
  })();

  // MediaHound Contributor Object
  var MHRealGroupContributor = (function (_MHContributor) {
    babelHelpers.inherits(MHRealGroupContributor, _MHContributor);

    function MHRealGroupContributor() {
      babelHelpers.classCallCheck(this, MHRealGroupContributor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHRealGroupContributor).apply(this, arguments));
    }

    babelHelpers.createClass(MHRealGroupContributor, [{
      key: 'isIndividual',
      get: function get() {
        return false;
      }
    }, {
      key: 'isReal',
      get: function get() {
        return true;
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhrgc';
      }
    }]);
    return MHRealGroupContributor;
  })(MHContributor);

  (function () {
    MHObject.registerConstructor(MHRealGroupContributor, 'MHRealGroupContributor');
  })();

  // MediaHound Contributor Object
  var MHFictionalIndividualContributor = (function (_MHContributor) {
    babelHelpers.inherits(MHFictionalIndividualContributor, _MHContributor);

    function MHFictionalIndividualContributor() {
      babelHelpers.classCallCheck(this, MHFictionalIndividualContributor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHFictionalIndividualContributor).apply(this, arguments));
    }

    babelHelpers.createClass(MHFictionalIndividualContributor, [{
      key: 'isIndividual',
      get: function get() {
        return true;
      }
    }, {
      key: 'isReal',
      get: function get() {
        return false;
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhfic';
      }
    }]);
    return MHFictionalIndividualContributor;
  })(MHContributor);

  (function () {
    MHObject.registerConstructor(MHFictionalIndividualContributor, 'MHFictionalIndividualContributor');
  })();

  // MediaHound Contributor Object
  var MHFictionalGroupContributor = (function (_MHContributor) {
    babelHelpers.inherits(MHFictionalGroupContributor, _MHContributor);

    function MHFictionalGroupContributor() {
      babelHelpers.classCallCheck(this, MHFictionalGroupContributor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHFictionalGroupContributor).apply(this, arguments));
    }

    babelHelpers.createClass(MHFictionalGroupContributor, [{
      key: 'isIndividual',
      get: function get() {
        return false;
      }
    }, {
      key: 'isReal',
      get: function get() {
        return false;
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhfgc';
      }
    }]);
    return MHFictionalGroupContributor;
  })(MHContributor);

  (function () {
    MHObject.registerConstructor(MHFictionalGroupContributor, 'MHFictionalGroupContributor');
  })();

  // MediaHound Source Master Object
  var MHSource = (function (_MHObject) {
    babelHelpers.inherits(MHSource, _MHObject);

    function MHSource() {
      babelHelpers.classCallCheck(this, MHSource);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSource).apply(this, arguments));
    }

    babelHelpers.createClass(MHSource, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHSource.prototype), 'jsonProperties', this), {
          metadata: MHSourceMetadata,
          subscriptions: [{ mapper: MHObject.create }] // TODO: It would be nicer to be able to just say [MHSubscription]
        });
      }
    }], [{
      key: 'fetchAllSources',
      value: function fetchAllSources() {
        var view = arguments.length <= 0 || arguments[0] === undefined ? "full" : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
        var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var path = this.rootSubendpoint('all');
        return this.fetchRootPagedEndpoint(path, {}, view, size, force);
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/source';
      }
    }, {
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsrc';
      }
    }]);
    return MHSource;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHSource, 'MHSource');
  })();

  // MediaHound Subscription Object
  var MHSubscription = (function (_MHObject) {
    babelHelpers.inherits(MHSubscription, _MHObject);

    function MHSubscription() {
      babelHelpers.classCallCheck(this, MHSubscription);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MHSubscription).apply(this, arguments));
    }

    babelHelpers.createClass(MHSubscription, [{
      key: 'jsonProperties',
      get: function get() {
        return Object.assign({}, babelHelpers.get(Object.getPrototypeOf(MHSubscription.prototype), 'jsonProperties', this), {
          metadata: MHSubscriptionMetadata
        });
      }
    }], [{
      key: 'mhidPrefix',
      get: function get() {
        return 'mhsub';
      }
    }, {
      key: 'rootEndpoint',
      get: function get() {
        return 'graph/subscription';
      }
    }]);
    return MHSubscription;
  })(MHObject);

  (function () {
    MHObject.registerConstructor(MHSubscription, 'MHSubscription');
  })();

  var MHSearch = (function () {
    function MHSearch() {
      babelHelpers.classCallCheck(this, MHSearch);
    }

    babelHelpers.createClass(MHSearch, null, [{
      key: 'fetchResultsForSearchTerm',
      value: function fetchResultsForSearchTerm(searchTerm, scopes) {
        var size = arguments.length <= 2 || arguments[2] === undefined ? 12 : arguments[2];
        var next = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        var path = 'search/all/' + houndRequest.extraEncode(searchTerm);

        var promise;
        if (next) {
          promise = houndRequest({
            method: 'GET',
            url: next
          });
        } else {
          var params = {
            pageSize: size
          };

          if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
            params.types = scopes;
          }

          promise = houndRequest({
            method: 'GET',
            endpoint: path,
            params: params
          });
        }

        return promise.then(function (response) {
          var _this = this;

          var pagedResponse = new MHPagedResponse(response);

          pagedResponse.fetchNextOperation = function (newNext) {
            return _this.fetchResultsForSearchTerm(searchTerm, scopes, size, newNext);
          };

          return pagedResponse;
        });
      }

      // Static Search Scopes enums

    }, {
      key: 'SCOPE_ALL',
      get: function get() {
        return 'all';
      }
    }, {
      key: 'SCOPE_MOVIE',
      get: function get() {
        return 'movie';
      }
    }, {
      key: 'SCOPE_TRACK',
      get: function get() {
        return 'track';
      }
    }, {
      key: 'SCOPE_ALBUM',
      get: function get() {
        return 'album';
      }
    }, {
      key: 'SCOPE_SHOWSERIES',
      get: function get() {
        return 'showseries';
      }
    }, {
      key: 'SCOPE_SHOWSEASON',
      get: function get() {
        return 'showseason';
      }
    }, {
      key: 'SCOPE_SHOWEPISODE',
      get: function get() {
        return 'showepisode';
      }
    }, {
      key: 'SCOPE_BOOK',
      get: function get() {
        return 'book';
      }
    }, {
      key: 'SCOPE_GAME',
      get: function get() {
        return 'game';
      }
    }, {
      key: 'SCOPE_COLLECTION',
      get: function get() {
        return 'collection';
      }
    }, {
      key: 'SCOPE_USER',
      get: function get() {
        return 'user';
      }
    }, {
      key: 'SCOPE_CONTRIBUTOR',
      get: function get() {
        return 'contributor';
      }
    }]);
    return MHSearch;
  })();

  var hound = {
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

  return hound;

}));