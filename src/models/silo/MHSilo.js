import MHObject from '../base/MHObject.js';

export default class MHSilo {
  static fetchSuggestedSilos(filters, view='full', size=10) {
    const path = `graph/silo/suggested`;
    const params = {};
    if (filters) {
      params.filters = filters;
    }
    return MHObject.fetchRootBucketedEndpoint(path, view, size, null, params);
  }
}
