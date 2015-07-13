/* jshint -W098 */

// Import Models
import { models } from './models/all-models.js';

// Import Search Helpers
import { MHSearch } from './search/MHSearch.js';

export { models, MHSearch };

export default {
  get models()   { return models;   },
  get MHSearch() { return MHSearch; }
};
