
import { houndRequest } from '../request/hound-request.js';
import { MHRelationalPair } from '../models/base/MHRelationalPair.js';

export class MHSearch {
  static fetchResultsForSearchTerm(searchTerm, scopes, size=12){

    var makeEndpoint = function(query){
      return 'search/all/' + houndRequest.extraEncode(query);
    };

    var makeParams = function(scopes, size){
      var params = {
        pageSize: (typeof size === 'number') ? size : 8
      };

      if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
        params.types = scopes;
      }

      return params;
    };

    var makeSearchRequest = function(searchTerm, scopes, size){
      return houndRequest({
          method: 'GET',
          endpoint: makeEndpoint(searchTerm),
          params: makeParams(scopes, size)
        });
    };

    return makeSearchRequest(searchTerm, scopes, size)
      .then(response => {
        return Promise.all(MHRelationalPair.createFromArray(response.content));
      });
  }

  // Static Search Scopes enums
  static get SCOPE_ALL()           { return 'all'; }
  static get SCOPE_MOVIE()         { return 'movie'; }
  static get SCOPE_SONG()          { return 'song'; }
  static get SCOPE_ALBUM()         { return 'album'; }
  static get SCOPE_SHOWSERIES()    { return 'showseries'; }
  static get SCOPE_SHOWSEASON()    { return 'showseason'; }
  static get SCOPE_SHOWEPISODE()   { return 'showepisode'; }
  static get SCOPE_BOOK()          { return 'book'; }
  static get SCOPE_GAME()          { return 'game'; }
  static get SCOPE_COLLECTION()    { return 'collection'; }
  static get SCOPE_USER()          { return 'user'; }
  static get SCOPE_CONTRIBUTOR()   { return 'contributor'; }
}
