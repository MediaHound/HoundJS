
/***
 * The scope of quick-search it to return the first n results only.
 * There will be no paging concept to this search helper, it will be
 * used for doing quick searches (ex: searching for posting mentions).
 * This search will only ever hit the /autocomplete endpoint.
 *
 * For Filtered and paged searching use ./paged-search.js
 *
 */

import { houndRequest } from '../request/hound-request';
import { MHObject } from '../models/base/MHObject';

var i, prop, buildSearchHelper, quickSearch,
    search        = {},
    extraEncode   = houndRequest.extraEncode,
    types         = ['all', 'movie', 'song', 'album', 'tvseries', 'book', /*'game',*/ 'person', 'collection', 'user'],

    makeEndpoint = function(searchType, query){
      return 'search/' + searchType + '/find/' + extraEncode(query) + '/autocomplete';
    },

    makeParams = function(size){
      var params = {
        page: 0
      };

      params['page.size'] = (typeof size === 'number') ? size : 8;

      return params;
    },

    makeSearchRequest = function(searchType, query, size){
      return houndRequest({
          method: 'GET',
          endpoint: makeEndpoint(searchType, query),
          params: makeParams(size)
          /*onprogress:function(responseText){
            console.log(searchType + ' progress: ', responseText);
          }*/
        });
    };

// search specific
buildSearchHelper = function(index){
  // search.type = function( searchQuery, pageSize
  //  returns promise created in makeSearchRequest defined above ^^^
  search[types[index]] = function(query, size){
    return makeSearchRequest(types[index], query, size)
      .then((parsed) => {
        var mhObj;
        return parsed.content.map((v) => {
          try{
            mhObj = MHObject.create(v);
            return mhObj;
          } catch(e) {
            console.log('unrecognized mhid prefix: ', v.mhid);
            console.log(e);
            return v;
          }
        });
      });
  };
};

for( i = 0 ; i < types.length ; i++ ){
  buildSearchHelper(i);
}

/*
 * quickSearch(query, size)
 *
 * returns a map of search results
 *  all: [results]
 *  movie: [results]
 *  song: [results]
 *  etc...
 *
 */
quickSearch = function(query, size){
  var j, typeMap = {};
  return Promise.all(
      types.map(function(v){
        return search[v](query, size);
      })
    )
    .then(function(results){
      for( j = 0 ; j < types.length ; j++ ){
        typeMap[types[j]] = results[j];
      }
      return typeMap;
    });
};

for( prop in search ){
  if( search.hasOwnProperty(prop) ){
    quickSearch[prop] = search[prop];
  }
}

/*
 * quickSearch.everything(query, size)
 *
 *  returns a map of search promises
 *
 */
quickSearch.everything = function(query, size){
  var currType,
      i = 0,
      rtn = {};

  for( currType = types[i] ; i < types.length ; currType = types[++i] ){
    rtn[currType] = search[currType](query, size);
  }

  return rtn;
};

export { quickSearch };

