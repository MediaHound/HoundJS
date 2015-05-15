
import { log } from '../models/internal/debug-helpers.js';

// Start Module
import { promiseRequest } from './promise-request.js';

import { MHSDK } from '../models/sdk/MHSDK.js';

var extraEncode = promiseRequest.extraEncode,
    requestMap  = {},
    defaults    = {
      headers: {
        'Accept':'application/json'
      },
      withCredentials: true
    },
    responseThen = function(response){
      //log('hound-request: ', response);
      if( !!response ){
        // currently no XML support only JSON text else return status
        if( response.responseText != null && response.responseText !== ''){
          return JSON.parse(response.responseText);
        }
        if( response.response != null && typeof response.response === 'string' && response.response !== '' ){
          return JSON.parse(response.response);
        }
        return response.status;
      }
      return response;
    };

export var houndRequest = function(args){
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
  if( !args ){
    throw new TypeError('Arguments not specified for houndRequest', 'houndRequest.js', 27);
  }
  //log('args before defaults: ', JSON.stringify(args));

  // Enforce capitals for method
  if( typeof args.method === 'string' && (/[a-z]/).test(args.method) ){
    args.method = args.method.toUpperCase();
  }

  // Set/Add defaults for POST requests
  if( args.method && args.method === 'POST' ){
    defaults.withCredentials = true;
  }

  // Set args.url via args.endpoint
  //  delete endpoint from args
  if( args.endpoint ){
    // houndOrigin defined in hound-origin.js before import, must be fully qualified domain name
    args.url = MHSDK.origin + args.endpoint;
    delete args.endpoint;
  }

  // Set the OAuth access token if the client has configured OAuth.
  if (MHSDK.MHAccessToken) {
    if (args.params) {
      args.params.access_token = MHSDK.MHAccessToken;
    }
    else {
      args.params = {
        access_token: MHSDK.MHAccessToken
      };
    }
  }


  // Set to defaults or merge
  //  headers
  if( !args.headers ){
    args.headers = defaults.headers;
  } else {
    // Merge Defaults in
    var prop;
    for( prop in defaults.headers ){
      if( defaults.headers.hasOwnProperty(prop) && !(prop in args.headers) ){
        args.headers[prop] = defaults.headers[prop];
      }
    }
  }

  // withCredentials
  if( args.withCredentials == null ){
    args.withCredentials = defaults.withCredentials;
  }

  //log('args after defaults: ', JSON.stringify(args));

  // on GET request save into requestMap, then if request is called again return Promise from requestMap
  if( args.method == null || args.method === 'GET' ){

    if( requestMap.hasOwnProperty(args.url) ){
      log('request is in map: ', args.url);
      return requestMap[args.url];
    }

    requestMap[args.url] = promiseRequest(args)
      .then(
        res => { delete requestMap[args.url]; return res; },
        err => { delete requestMap[args.url]; throw err; }
      )
      .then(responseThen);
      //.then(x => {log(x); return x;});

    return requestMap[args.url];
  }

  log('bypassing requestMap for POST: ', args.url);
  // else POST request
  return promiseRequest(args)
    .then(responseThen);
    //.then(x => {log(x); return x;});
};

Object.defineProperty(houndRequest, 'extraEncode', {
  configurable  : false,
  enumerable    : false,
  get           : function(){
    return extraEncode;
  }
});

export default houndRequest;
