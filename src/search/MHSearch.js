
import { houndRequest } from '../request/hound-request.js';
import { MHRelationalPair } from '../models/base/MHRelationalPair.js';
import { jsonCreateFromArrayData } from '../models/internal/jsonParse.js';

export class MHSearch {
  static fetchResultsForSearchTerm(searchTerm, scopes, size=12){
    var path = 'search/all/' + houndRequest.extraEncode(searchTerm);

    var params = {
      pageSize: size
    };

    if (Array.isArray(scopes) && scopes.indexOf(MHSearch.SCOPE_ALL) === -1) {
      params.types = scopes;
    }

    return houndRequest({
      method: 'GET',
      endpoint: path,
      params: params
    }).then(response => {
      return jsonCreateFromArrayData(response.content, [MHRelationalPair]);
    });
  }

  // Static Search Scopes enums
  static get SCOPE_ALL()           { return 'all'; }
  static get SCOPE_MOVIE()         { return 'movie'; }
  static get SCOPE_TRACK()         { return 'track'; }
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
