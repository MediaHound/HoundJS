/* jshint -W098 */

// Import Request Helpers
import { houndRequest as request } from './request/hound-request.js';
import { pagedRequest } from './request/hound-paged-request.js';

// Import Models
import { models } from './models/all-models.js';

// Import Search Helpers
import { quickSearch } from './search/quick-search.js';
import { pagedSearch } from './search/paged-search.js';

export { request, pagedRequest, models, quickSearch, pagedSearch };

export default {
  get models()        { return models;        },
  get request()       { return request;       },
  get pagedRequest()  { return pagedRequest;  },
  get quickSearch()   { return quickSearch;   },
  get pagedSearch()   { return pagedSearch;   }
};

//module.exports = System.get('hound-api').default;
