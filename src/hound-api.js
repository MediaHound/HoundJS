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

//module.exports = System.get('hound-api').default;
