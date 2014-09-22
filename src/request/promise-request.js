/**
 * API Request Object
 * Takes single config obj, returns Promise
 *
 * Config Options
 * Object describing the request to be made and how it should be processed. The object has following properties:
 *
 *  WIP: these were copied from angular's http service
 *  >>> Lines starting with // are not currently supported <<<
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
 // timeout - {number|Promise}
 *      - timeout in milliseconds, or promise that should abort the request when resolved.
 *
 // withCredentials   - {boolean}
 *      - whether to set the withCredentials flag on the XHR object.
 *      See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5 for more information.
 *
 // responseType  - {string} - see requestType.
 *
 *  onprogress    - {function} a function fired as progress is reported
 *
 *
 **/
(function(){
  'use strict';

  // Start Module
  if( !window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest()) ){
    throw new Error("No XMLHttpRequest 2 Object found, please update your browser.");
  }

  var extraEncode = function(str){
        // encodeURIComponent then encode - _ . ! ~ * ' ( ) as well
        return encodeURIComponent(str)
                .replace(/\-/g, "%2D")
                .replace(/\_/g, "%5F")
                .replace(/\./g, "%2E")
                .replace(/\!/g, "%21")
                .replace(/\~/g, "%7E")
                .replace(/\*/g, "%2A")
                .replace(/\'/g, "%27")
                .replace(/\(/g, "%28")
                .replace(/\)/g, "%29");
      },

  /* Promise around an XMLHttpRequest
   *  @param args - {Object} see definition above, not all props are supported yet
   *  @returns {Promise}
   */
      promiseRequest = function(args){
        // Prelim work
        // method {GET,POST,OPTION,...}
        // url
        // params -- map to url params
        // data -- request body
        // headers -- request headers
        // withCredentials -- not working currently
        // onprogress or onProgress
        var prop, rtnPromise,
            method      = args.method           || 'GET',
            url         = args.url              || null,
            params      = args.params           || null,
            data        = args.data             || null,
            headers     = args.headers          || null,
            withCreds   = args.withCredentials  || false,
            onprogress  = args.onprogress       || args.onProgress || null,
            xhr         = new XMLHttpRequest();

        // Wasn't working in ie11...
        xhr.withCredentials = withCreds;

        // Check for url
        if( url === null ){
          throw new TypeError('url was null or undefined in arguments object', 'promiseRequest.js', 70);
        }

        // Add params
        if( params !== null ){
          url += '?';
          for( prop in params ){
            if( params.hasOwnProperty(prop) ){
              if( url[url.length-1] !== '?' ){
                url += '&';
              }
              if( typeof params[prop] === 'string' || params[prop] instanceof String ){
                url += encodeURIComponent(prop) + '=' + extraEncode(params[prop]).replace('%20', '+');
              } else {
                url += encodeURIComponent(prop) + '=' + extraEncode(JSON.stringify(params[prop])).replace('%20', '+');
              }
            }
          }
          prop = null;
        }

        // Stringify Data
        if( data ){
          if( typeof data === 'string'    ||
              data instanceof String      ||
              data instanceof Blob        ||
              data instanceof ArrayBuffer ||
              data instanceof FormData
          ){
            // do nothing
          } else {
            data = JSON.stringify(data);
            if( headers == null ){
              headers = {
                'Content-Type': 'application/json'
              };
            } else if( !headers['Content-Type'] && !headers['content-type'] && !headers['Content-type'] && !headers['content-Type'] ){
              headers['Content-Type'] = 'application/json';
            }
          }
        }

        // Open Request
        xhr.open(method, url, true);

        // NOT SUPPORTED ACROSS THE BOARD... :/
        //xhr.responseType = 'json';

        // Set Headers
        if( headers !== null ){
          for( prop in headers ){
            if( headers.hasOwnProperty(prop) ){
              xhr.setRequestHeader(prop, headers[prop]);
            }
          }
        }

        // Create Promise
        rtnPromise = new Promise(function(resolve, reject){

          xhr.onreadystatechange = function(){
            if( this.readyState === 4 ){
              // Done
              if( this.status >= 200 && this.status < 300 ){
                resolve(this);
              } else {
                //console.log(this);
                reject({
                  error: new Error('Request failed with status: ' + this.status + ', ' + this.statusText),
                  'xhr': this
                });
              }
            } else if ( this.readyState === 3 ){
              // Loading
              if( typeof onprogress === 'function' ){
                onprogress(this.responseText);
              }
            } else if ( this.readyState === 2 ){
              // Headers Received
            } else if ( this.readyState === 1 ){
              // Request Open
            } else if ( this.readyState === 0 ){
              // Unset ie, not open
            }
          };

        /*
          // On Load -- resolve(json)
          xhr.onload = function(){
            if( this.status === 200 ){
              resolve(this.responseText);
            } else {
              console.warn('Error on response', this);
              reject(new Error(this.statusText));
            }
          };

          // On Error -- reject(Error)
          xhr.onerror = function(){
            //console.log(this);
            reject(new Error('Request failed with status: ' + this.status + ', ' + this.statusText));
          };
        */

          xhr.addEventListener('abort', function(evt){
            console.log('Request to ' + url + ' aborted with status: ' + this.status + ', ' + this.statusText);
          }, false);

          // Send Request
          if( data !== null ){
            //console.log('sending data: ', data);
            xhr.send(data);
          } else {
            xhr.send();
          }

          // End Promise
        });


        return rtnPromise;
        // End promiseRequest
      };

  // Add extraEncode as an export
  Object.defineProperty(promiseRequest, 'extraEncode', {
    configurable  : false,
    enumerable    : false,
    get           : function(){
      return extraEncode;
    }
  });

  export default promiseRequest;

})();
