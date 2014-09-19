/*globals XDomainRequest */
(function(define){
define([
    'hound/hound-request',
    'require',
    'hound/model-compiled' // circular dep
  ],
  function(
    houndRequest,
    require,
    models // <-- resolves to undefined
  ){
    'use strict';

    // Start Module
    var extraEncode = houndRequest.extraEncode,
        defaults    = {
          headers: {
            'Accept':'application/json'
          },
          pageSize: 10,
          startingPage: 0,
          withCredentials: false
        },
        // get page size from args helper
        getPageSize = function(args){
          if( typeof args.pageSize === 'number' ){
            return args.pageSize;
          }
          if( args.params != null && typeof args.params['page.size'] === 'number' ){
            return args.params['page.size'];
          }
          return defaults.pageSize;
        },
        // get starting page number from args helper
        getStartingPage = function(args){
          if( typeof args.startingPage === 'number' ){
            return args.startingPage;
          }
          if( args.params != null && typeof args.params.page === 'number' ){
            return args.params.page;
          }
          return defaults.startingPage;
        },
    // Then Helpers, use 'call' or 'bind' to set proper this reference
        setContentForPage = function(pageNumber, pageSize, newContent){
          var i = 0, length = newContent.length;
          for( ; i < length ; i++ ){
            this.content[pageNumber*pageSize + i] = newContent[i];
          }
        },
        setInfo = function(response){
          // set: lastPage, firstPage, totalPages, numberOfElements, totalElements
          this.firstPage        = response.firstPage || response.first;
          this.lastPage         = response.lastPage  || response.last;
          this.page             = response.number;
          this.totalPages       = response.totalPages;
          this.numberOfElements = response.numberOfElements;
          this.totalElements    = response.totalElements;
          return response;
        },
        setContentArray = function(response){
          var self = this, i = 0, newContent;
          var MHObject = require('hound/model-compiled').MHObject;

          if( (this.args.params.view && this.args.params.view === 'id') || typeof response.content[0] === 'string' ){
            newContent = Promise.all(MHObject.fetchByMhids(response.content));
          } else {
            newContent = Promise.resolve(MHObject.create(response.content));
          }

          return newContent.then(function(mhObjs){
              setContentForPage.call(self, response.number, response.size, mhObjs);
              response.content = mhObjs;
              return response;
            });
        };


    /*
     * Takes arguments for houndRequest plus 'pageSize' and 'startingPage'
     * returns paged request object
     *
     * constructor args (from hound-request)
     *  method, endpoint, headers, params, data?, withCredentials, etc..
     *
     * for paged-request
     *  pageSize, startingPage
     *
     * Members:
     *  content   -- array of all elements fetched
     *  page      -- (from response.number) the page number that the currentPromise resolves to (also the index of the current Promise in pagePromises array)
     *  pageSize  -- # of items per page (immutable)
     *
     *  args  -- the arguments passed into hound-request (immutable, but not really)
     *
     *  totalPages        -- total number of pages
     *  numberOfElements  -- per page
     *  totalElements     -- total number of items in this paged response (possibly not yet fetched)
     *  size              -- number of elements on this page
     *
     *  currentPromise  -- the current page promise
     *  pagePromises    -- array of the fetched page promises
     *
     * Methods:
     *  next()    -- function to fetch the next page
     *  prev()    -- function to move the current promise back a page
     *  jumpTo(n) -- takes number n, jumps to that page number
     *
     */
    var PagedRequest = function(args){
          // Check for Method and Endpoint
          if( args.method == null || args.endpoint == null ){
            throw new TypeError('Method or Endpoint was not defined on pagedRequest argument map');
          }

          // Page Size and Starting Page
          var pageSize      = getPageSize(args),
              startingPage  = getStartingPage(args),
              myArgs        = args;

          // pageSize and starting page can't be negative
          if( pageSize <= 0 ){
            pageSize = defaults.pageSize;
          }
          if( startingPage < 0 ){
            startingPage = defaults.startingPage;
          }

          myArgs.params               = myArgs.params || {};
          myArgs.params['page.size']  = pageSize;
          myArgs.params.page          = startingPage;

          // remove extraneous args props
          delete myArgs.pageSize;
          delete myArgs.startingPage;

          // Define normal instance properties
          this.content = [];
          this.pagePromises = [];
          this.page = startingPage;
          this.args = myArgs;

          this.pagePromises[this.page] = houndRequest(this.args)
                                          .then(setInfo.bind(this))
                                          .then(setContentArray.bind(this));

          // Define Immutable Props and getters
          Object.defineProperties(this, {
            'pageSize':{
              configurable: false,
              enumerable:   true,
              writeable:    false,
              value:        pageSize
            }
          });
        }; // end constructor

    // Prototype Members!

    // Prototype Getters
    Object.defineProperties(PagedRequest.prototype, {
      'currentPromise': {
        configurable  : false,
        enumerable    : false,
        get: function(){
          return this.pagePromises[this.page];
        }
      }
    });
    // End Getters

    // Methods, next(), prev(), jumpTo(n)
    // .next()
    PagedRequest.prototype.next = function(){
      var self = this;
      return this.currentPromise
        .then(function(response){
          if( !self.lastPage ){
            self.page += 1;
            self.args.params.page = self.page;

            if( self.pagePromises[self.page] == null ){
              self.pagePromises[self.page] = houndRequest(self.args)
                                              .then(setInfo.bind(self))
                                              .then(setContentArray.bind(self));
            }
            return self.pagePromises[self.page];
          }
          return response;
        });
    };

    // .prev()
    PagedRequest.prototype.prev = function(){
      var self = this;
      return this.currentPromise
        .then(function(response){
          if( !self.firstPage ){
            self.page -= 1;
            self.args.params.page = self.page;

            if( self.pagePromises[self.page] == null ){
              self.pagePromises[self.page] = houndRequest(self.args)
                                              .then(setInfo.bind(self))
                                              .then(setContentArray.bind(self));
            }
            return self.pagePromises[self.page];
          }
          return response;
        });
    };

    // .jumpTo(n)
    //  needs testing
    PagedRequest.prototype.jumpTo = function(n){
      if( n < 0 ){ n = 0; }
      if( n >= this.totalPages ){
        n = this.totalPages;
        //throw TypeError("Can't jump to page that doesn't exist.");
      }

      if( this.pagePromises[n] == null ){
        // needs request
        var self = this;
        return this.currentPromise
          .then(function(response){
            self.page = n;
            self.args.params.page = self.page;
            self.pagePromises[self.page] = houndRequest(self.args)
                                            .then(setInfo.bind(self))
                                            .then(setContentArray.bind(self));
            return self.pagePromises[self.page];
          });
      } else if( this.page !== n ){
        this.page = n;
        return this.pagePromises[this.page];
      }
      return this.currentPromise;
    };

    // extraEncode
    Object.defineProperties(PagedRequest, {
      'extraEncode': {
        configurable  : false,
        enumerable    : false,
        get           : function(){
          return extraEncode;
        }
      }
    });

    // Return Function that returns new PagedRequest
    return (function(a){ return new PagedRequest(a); });
});
})( define );
