import houndRequest from '../request/hound-request.js';
import MHPagedResponse from '../models/container/MHPagedResponse.js';
import MHObject from '../models/base/MHObject.js';

export default class MHSearch {
  static fetchTopResults(scope, size=12, next=null) {
    const path = 'search/top';

    let promise;
    if (next) {
      promise = houndRequest({
        method: 'GET',
        url: next
      });
    }
    else {
      const params = {
        pageSize: size
      };

      params.types = [scope];

      promise = houndRequest({
        method  : 'GET',
        endpoint: path,
        params
      });
    }

    return promise.then(response => {
      const pagedResponse = new MHPagedResponse(response);

      pagedResponse.fetchNextOperation = (newNext => {
        return this.fetchTopResults(scope, size, newNext);
      });

      return pagedResponse;
    });
  }

  static fetchResultsForSearchTerm(searchTerm, scopes, size=12, next=null) {
    const path = 'search/all/' + houndRequest.extraEncode(searchTerm);

    let promise;
    if (next) {
      promise = houndRequest({
        method: 'GET',
        url: next
      });
    }
    else {
      const params = {
        pageSize: size
      };

      if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
        params.types = scopes;
      }

      promise = houndRequest({
        method  : 'GET',
        endpoint: path,
        params: params
      });
    }

    return promise.then(response => {
      const pagedResponse = new MHPagedResponse(response);

      pagedResponse.fetchNextOperation = (newNext => {
        return this.fetchResultsForSearchTerm(searchTerm, scopes, size, newNext);
      });

      return pagedResponse;
    });
  }

  static fetchSegmentedResultsForSearchTerm(searchTerm, scopes, siloPageSize=12, includeAll=true) {
    const path = 'search/segmented/' + houndRequest.extraEncode(searchTerm);

    const params = { siloPageSize, includeAll };

    if (Array.isArray(scopes)) {
      params.types = scopes;
    }

    return MHObject.fetchRootBucketedEndpoint(path, 'full', 12, null, params);
  }

  // Static Search Scopes enums
  static get SCOPE_ALL()              { return 'all'; }
  static get SCOPE_MOVIE()            { return 'movie'; }
  static get SCOPE_TRACK()            { return 'track'; }
  static get SCOPE_ALBUM()            { return 'album'; }
  static get SCOPE_SHOWSERIES()       { return 'showSeries'; }
  static get SCOPE_SHOWSEASON()       { return 'showSeason'; }
  static get SCOPE_SHOWEPISODE()      { return 'showEpisode'; }
  static get SCOPE_BOOK()             { return 'book'; }
  static get SCOPE_GAME()             { return 'game'; }
  static get SCOPE_COLLECTION()       { return 'collection'; }
  static get SCOPE_USER()             { return 'user'; }
  static get SCOPE_CONTRIBUTOR()      { return 'contributor'; }
  static get SCOPE_BASE_CONTRIBUTOR() { return 'baseContributor'; }
}
