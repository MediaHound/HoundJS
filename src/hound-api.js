/* jshint -W098 */
(function( /*window*/ ){
  'use strict';

  // Import Request Helpers
  import { request } from './request/hound-request.js';
  import { pagedRequest } from './request/hound-paged-request.js';

  // Import Models
  import { models } from './models/all-models.js';

  // Import Search Helpers
  import { quickSearch } from './search/quick-search.js';
  import { pagedSearch } from './search/paged-search.js';


  export var houndApiPackage = {
    get models()        { return models;        },
    get request()       { return request;       },
    get pagedRequest()  { return pagedRequest;  },
    get quickSearch()   { return quickSearch;   },
    get pagedSearch()   { return pagedSearch;   }
  };


  // TODO for testing
  /*
  if( window.location.host === 'local.mediahound.com:2014' ){
    window.houndapi = houndApiPackage;
    window.houndApi = houndApiPackage;
    window.houndAPI = houndApiPackage;
  }
  */

}( window ));


