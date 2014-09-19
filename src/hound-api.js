(function( window, define ){
define([
    'hound/model-compiled',
    'hound/hound-search',
    'hound/hound-request',
    'hound/hound-paged-request'
  ],
  function(
    model,
    houndSearch,
    houndRequest,
    houndPagedRequest
  ){
    'use strict';

    var apiExports = {
          get models()        { return model;             },
          get search()        { return houndSearch;       },
          get request()       { return houndRequest;      },
          get pagedRequest()  { return houndPagedRequest; }
        };

    // For testing
    if( window.location.host === 'local.mediahound.com:2014' ){
      window.houndapi = apiExports;
      window.houndApi = apiExports;
      window.houndAPI = apiExports;

      // Extra Mhids
      window.MHIDS = {
        // TV
        'modernFamilySeries': 'mhtsr1000000001',
        'modernFamilySeason': 'mhtvs1000003108',
        'modernFamilyEpisode': 'mhtve1000039923',

        // Movies
        'skyfall':'mhmov1000017937',
        'savingPrivateRyan': 'mhmov1000009260',
        'ironMan3':'mhmov1000020539',
        'spiderman':'mhmov1000000948',

        // Albums


        // Songs
        'metricGoldGunsGirls':'mhsng1007117726',
        'justGazin':'mhsng1025234357',
        'phoenix1901':'mhsng1007569202',

        // Collections
        'joesMyNewCollection':'mhcol100000000004',
        'tylerCoolSongs':'mhcol100000000063',
        'tylerMoviesToSee':'mhcol100000000064'

      };
    }

    return apiExports;
  }
);
}( window, define ));
