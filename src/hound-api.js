/* jshint -W098 */

// Import Request Helpers
import { houndRequest as request } from './request/hound-request.js';
import { pagedRequest } from './request/hound-paged-request.js';

// Import Models
import { models } from './models/all-models.js';

// Import Search Helpers
import { MHSearch } from './search/MHSearch.js';

export { request, pagedRequest, models, MHSearch };

export default {
  get models()        { return models;        },
  get request()       { return request;       },
  get pagedRequest()  { return pagedRequest;  },
  get MHSearch()      { return MHSearch;      }
};
