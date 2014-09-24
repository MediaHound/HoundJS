/* jshint -W098 */

// Import Request Helpers
import { houndRequest as request } from './request/hound-request';
import { pagedRequest } from './request/hound-paged-request';

// Import Models
import { models } from './models/all-models';

// Import Search Helpers
import { quickSearch } from './search/quick-search';
import { pagedSearch } from './search/paged-search';

export { request, pagedRequest, models, quickSearch, pagedSearch };

export default {
  get models()        { return models;        },
  get request()       { return request;       },
  get pagedRequest()  { return pagedRequest;  },
  get quickSearch()   { return quickSearch;   },
  get pagedSearch()   { return pagedSearch;   }
};


// TODO for testing
/*
if( window.location.host === 'local.mediahound.com:2014' ){
  window.houndapi = houndApi;
  window.houndApi = houndApi;
  window.houndAPI = houndApi;
}
*/


