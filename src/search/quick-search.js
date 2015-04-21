
/***
 * The scope of quick-search it to return the first n results only.
 * There will be no paging concept to this search helper, it will be
 * used for doing quick searches (ex: searching for posting mentions).
 * This search will only ever hit the /autocomplete endpoint.
 *
 * For Filtered and paged searching use ./paged-search.js
 *
 */

import { warn, error } from '../models/internal/debug-helpers';

import { houndRequest } from '../request/hound-request';
import { MHObject } from '../models/base/MHObject';

var i, prop, buildSearchHelper, quickSearch,
    search        = {},
    extraEncode   = houndRequest.extraEncode,
    types         = ['all', 'movie', 'song', 'album', 'tvseries', 'book', 'game', 'person', 'collection', 'user'],

    makeEndpoint = function(searchType, query){

      if(searchType === 'all'){
        return 'search/' + searchType + '/find/' + extraEncode(query) + '/autocomplete';
      }
      else{
        return 'search/' + searchType + '/' + extraEncode(query) + '';
      }

    },

    makeParams = function(size,type){
      var params;

      if(type === 'all'){
        params = {
          page: 0
        };
      }
      else{

        params = {};

      }

      params['page.size'] = (typeof size === 'number') ? size : 8;

      return params;
    },

    makeSearchRequest = function(searchType, query, size){
      return houndRequest({
          method: 'GET',
          endpoint: makeEndpoint(searchType, query),
          params: makeParams(size,searchType)
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
      // Cleanup
      .then(parsed => {
        parsed.content = parsed.content.map(v => {
          //TEMP fix for Search Results
          v.metadata = {};
          v.metadata.mhid = v.mhid;
          v.metadata.altId = v.altId;
          v.metadata.name = v.name;
          v.metadata.username = v.username || null;
          v.metadata.releaseDate = v.releaseDate;
          if( typeof v.primaryImageUrl === 'string' ){
            v.primaryImage = {
              metadata:{
                mhid: 'mhimgPlaceHolderSearchShim-'+v.mhid,
                isDefault: false
              },
              original:{
                url: v.primaryImageUrl
              }

            };
          }
          return v;
        });
        return parsed;
      })
      // END Cleanup
      .then(parsed => {
        var mhObj;
        return parsed.content.map((v) => {
          try{
            mhObj = MHObject.create(v, false);
            // Add contributor names to mhobject
            if (v.contributorNames) {
              mhObj.contributorNames = v.contributorNames;
            }
            return mhObj;
          } catch(e) {
            warn('unrecognized mhid prefix: ', v.mhid);
            error(e);
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
/*
 * quickSearch.type(query, size)
 *
 *  returns a map of search promises
 *
 */
quickSearch.type = function(query, size, type){
  return search[type](query, size);
};

export { quickSearch };
