
var xhrc;

// Use XMLHttpRequest from a browser or shim it in Ndoe with xmlhttprequest-cookie.
if (typeof window !== 'undefined') {
    if ( !window.XMLHttpRequest || !('withCredentials' in new XMLHttpRequest()) ) {
      throw new Error('No XMLHttpRequest 2 Object found, please update your browser.');
    }
    else {
      xhrc = window;
    }
}
else if (typeof window === 'undefined') {
  xhrc = require('xmlhttprequest-cookie');
}


const extraEncode = str => {
  // encodeURIComponent then encode - _ . ! ~ * ' ( ) as well
  return encodeURIComponent(str)
          .replace(/\-/g, '%2D')
          .replace(/\_/g, '%5F')
          .replace(/\./g, '%2E')
          .replace(/\!/g, '%21')
          .replace(/\~/g, '%7E')
          .replace(/\*/g, '%2A')
          .replace(/\'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
};

/**
 * API Request Object
 * Takes single config obj, returns Promise
 * Inspired by Angular's HTTP service.
 *
 * Config Options
 * Object describing the request to be made and how it should be processed. The object has following properties:
 *
 *  method  - {string} - HTTP method (e.g. 'GET', 'POST', etc)
 *  url     - {string} - Absolute or relative URL of the resource that is being requested.
 *  params  - {Object.<string|Object>}
 *      - Map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url.
 *      If the value is not a string, it will be JSONified.
 *
 *  data    - {string|Object} - Data to be sent as the request message data.
 *  headers - {Object}
 *      - Map of strings or functions which return strings representing HTTP headers to send to the server.
 *      If the return value of a function is null, the header will not be sent.
 *
 *
 * withCredentials   - {boolean}
 *      - whether to set the withCredentials flag on the XHR object.
 *      See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5 for more information.
 *
 *  onprogress    - {function} a function fired as progress is reported
 *
 **/
const promiseRequest = args => {
  let   prop;
  const method      = args.method           || 'GET';
  let   url         = args.url              || null;
  const params      = args.params           || null;
  let   data        = args.data             || null;
  let   headers     = args.headers          || null;
  const withCreds   = (args.withCredentials !== undefined) ? args.withCredentials : true;
  const onprogress  = args.onprogress       || null;
  const xhr         = new xhrc.XMLHttpRequest();


  // Check for url
  if ( url === null ) {
    throw new TypeError('url was null or undefined in arguments object', 'promiseRequest.js', 70);
  }

  // Add params
  if ( params !== null ) {
    // If the URL already contains a ?, then we won't add one
    if (url.indexOf('?') === -1) {
      url += '?';
    }
    for( prop in params ) {
      if ( params.hasOwnProperty(prop) ) {
        if ( url[url.length-1] !== '?' ) {
          url += '&';
        }
        if ( typeof params[prop] === 'string' || params[prop] instanceof String ) {
          url += encodeURIComponent(prop) + '=' + extraEncode(params[prop]).replace('%20', '+');
        }
        else if (Array.isArray(params[prop]) || params[prop] instanceof Array ) {
          for (var p of params[prop]) {
            url += encodeURIComponent(prop) + '=' + extraEncode(p).replace('%20', '+');
            url += '&';
          }

          if (params[prop].length > 0) {
            url = url.slice(0, -1); // Remove last & character
          }
        }
        else {
          url += encodeURIComponent(prop) + '=' + extraEncode(JSON.stringify(params[prop])).replace('%20', '+');
        }
      }
    }
    prop = null;
  }

  // Stringify Data
  if ( data ) {
    if ( typeof data === 'string'    ||
        data instanceof String      ||
        data instanceof ArrayBuffer
    ) {
      // do nothing
    } else if ( typeof FormData !== 'undefined' && data instanceof FormData) {
      // do nothing
    } else if ( typeof Blob !== 'undefined' && data instanceof Blob) {
      // do nothing
    } else {
      if (args.useForms) {
        var dataUrl = '';
        for( prop in data ) {
          if ( data.hasOwnProperty(prop) ) {
            if ( dataUrl.length !== 0 ) {
              dataUrl += '&';
            }
            if ( typeof data[prop] === 'string' || data[prop] instanceof String ) {
              dataUrl += prop + '=' +data[prop];
            }
            else if (Array.isArray(data[prop]) || data[prop] instanceof Array ) {
              for (var p2 of data[prop]) {
                dataUrl += prop + '=' + p2;
                dataUrl += '&';
              }

              if (data[prop].length > 0) {
                dataUrl = dataUrl.slice(0, -1); // Remove last & character
              }
            }
            else {
              dataUrl += prop + '=' + JSON.stringify(data[prop]);
            }
          }
        }
        data = dataUrl;

        if ( headers === null ) {
          headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
          };
        } else if ( !headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type'] ) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        }
      }
      else {
        data = JSON.stringify(data);
        if ( headers === null ) {
          headers = {
            'Content-Type': 'application/json'
          };
        } else if ( !headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type'] ) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }
  }

  // Open Request
  xhr.open(method, url, true);

  // Set Credentials, spec says can be done in UNSENT or OPENED states
  xhr.withCredentials = withCreds;

  // Set Headers
  if ( headers !== null ) {
    for( prop in headers ) {
      if ( headers.hasOwnProperty(prop) ) {
        xhr.setRequestHeader(prop, headers[prop]);
      }
    }
  }

  // Create Promise
  return new Promise(function(resolve, reject) {

    xhr.onreadystatechange = function() {
      if ( this.readyState === 4 ) {
        // Done
        if ( this.status >= 200 && this.status < 300 ) {
          resolve(this);
        } else {
          //console.log(this);
          reject({
            error: new Error('Request failed with status: ' + this.status + ', ' + this.statusText),
            'xhr': this
          });
        }
      } else if ( this.readyState === 3 ) {
        // Loading
        if ( typeof onprogress === 'function' ) {
          onprogress(this.responseText);
        }
      } else if ( this.readyState === 2 ) {
        // Headers Received
      } else if ( this.readyState === 1 ) {
        // Request Open
      } else if ( this.readyState === 0 ) {
        // Unset ie, not open
      }
    };

    xhr.addEventListener('abort', function() {
      console.log('Request to ' + url + ' aborted with status: ' + this.status + ', ' + this.statusText);
    }, false);

    // Send Request
    if ( data !== null ) {
      xhr.send(data);
    }
    else {
      xhr.send();
    }
  });
};

// Add extraEncode as an export
Object.defineProperty(promiseRequest, 'extraEncode', {
  configurable  : false,
  enumerable    : false,
  get           : function() {
    return extraEncode;
  }
});

export default promiseRequest;
