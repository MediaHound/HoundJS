(function(define){
define(['hound/model-compiled', 'hound/hound-request'], function(model, houndRequest){
  'use strict';

  var i, prop, buildSearchHelper, houndSearch,
      search        = {},
      MHObject      = model.MHObject,
      extraEncode   = houndRequest.extraEncode,
      types         = ['all', 'movie', 'song', 'album', 'tvseries', 'book', 'person', 'collection', 'user'], //'game' 

      makeEndpoint = function(searchType, query){
        return 'search/' + searchType + '/find/' + extraEncode(query) + '/autocomplete';
      },

      makeParams = function(size, page){
        var params = {};
        params['page.size'] = (typeof size === 'number') ? size : 8;

        if(typeof page === 'number'){
          params.page = page;
        }

        return params;
      },

      makeSearchRequest = function(searchType, query, size, page){
        return houndRequest({
            method: 'GET',
            endpoint: makeEndpoint(searchType, query),
            params: makeParams(size, page),
            /*onprogress:function(responseText){
              console.log(searchType + ' progress: ', responseText);
            }*/
          });
      };

  // search specific
  buildSearchHelper = function(index){
    // search.type = function( searchQuery, pageSize, pageNumber
    //  returns promise created in makeSearchRequest defined above ^^^
    search[types[index]] = function(query, size, page){
      return makeSearchRequest(types[index], query, size, page)
        // Clean Search Results TODO REMOVE
        .then(function(parsed){
          var newContent = parsed.content.map(function(v,i,a){
                if( v.title && !v.name ){
                  v.name = v.title;
                  console.log('cleaned title: '+v.title);
                }
                if( v.id && !v.mhid ){
                  v.mhid = v.id;
                  console.log('cleaned id: '+v.id);
                }
                /*
                if( v.imageURL && !v.primaryImageUrl ){
                  v.primaryImageUrl = v.imageURL;
                  console.log('cleaned primaryImageUrl: '+v.imageURL);
                }
                */
                return v;
              });
          parsed.content = newContent;
          return parsed;
        })
        // End Clean Search Results
        .then(function(parsed){
          var mhObj;
          return parsed.content.map(function(v,i,a){
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
   * houndSearch(query, size, page)
   *
   * returns a map of search results
   *  all: [results]
   *  movie: [results]
   *  song: [results]
   *  etc...
   *
   */
  houndSearch = function(query, size, page){
    var j, typeMap = {};
    return Promise.all(
        types.map(function(v){
          return search[v](query, size, page);
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
      houndSearch[prop] = search[prop];
    }
  }

  /*
   * houndSearch.everything(query, size, page)
   *
   *  returns a map of search promises
   *
   */
  houndSearch.everything = function(query, size, page){
    var currType,
        i = 0,
        rtn = {};

    for( currType = types[i] ; i < types.length ; currType = types[++i] ){
      rtn[currType] = search[currType](query, size, page);
    }

    return rtn;
  };

  return houndSearch;

});
})( define );
