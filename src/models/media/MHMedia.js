
import { MHObject } from '../base/MHObject';
import { MHSourceModel } from '../source/MHSourceModel';
import { MHEmbeddedObject } from '../base/MHEmbeddedObject';
//import { MHRelationalPair } from '../base/MHRelationalPair';
//import { MHEmbeddedRelation } from '../base/MHEmbeddedRelation';

import { houndRequest } from '../../request/hound-request';
import { pagedRequest } from '../../request/hound-paged-request';

// MediaHound Media Object
export class MHMedia extends MHObject {
  /* MHMedia Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @constructor
   *    @param args - { Object | JSON String }
   *
   * Inherited from MHObject
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *    Optional Param Props
   *      name            - { String }
   *      primaryImage    - { MHImage }
   *      createdDate     - { String | Date }
   *
   * MHMedia Params
   *    Optional Param Props
   *      releaseDate     - { String | Date }
   *
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // Default MHMedia unique objects to null
    var releaseDate       = new Date(args.releaseDate)*1000, //convert to milliseconds
        suitabilityRating = args.suitabilityRating  || null,
        length            = args.length             || null,
        //primaryGroup      = args.primaryGroup.object || null,
        keyContributors   = (!!args.keyContributors) ? MHEmbeddedObject.createFromArray(args.keyContributors) : null;

    if( isNaN(releaseDate) ){
      releaseDate = args.releaseDate || null;
    }

    // Create imutable properties
    //  releaseDate
    Object.defineProperties(this, {
      'releaseDate':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        releaseDate
      },
      'suitabilityRating':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        suitabilityRating
      },
      'length':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        length
      },
      'keyContributors':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        keyContributors
      },
      // 'primaryGroup':{
      //   configurable: false,
      //   enumerable:   true,
      //   writable:     false,
      //   value:        primaryGroup
      // },
      // Promises
      'collectionsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'contentPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'sourcesPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'contributorsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'charactersPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'traitsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  /*
   * MHMedia.rootEndpoint
   *
   * @return { String } - endpoint for this MHObject Type
   */
  static get rootEndpoint(){ return 'graph/media'; }

  // Could change as needed
  toString(){
    return super.toString() + ' and releaseDate ' + this.releaseDate;
  }

  /* TODO: REMOVE ids.map to fetchByMhid
   * TODO: UPDATE DocJS COMMENTS
   * mhMedia.fetchCollections(force)
   *
   * @return { Promise }  - resolves to server response of collections for this MediaHound object
   *
   */
  fetchCollections(force=false){
    var path = this.subendpoint('collections');

    if( force || this.collectionsPromise === null ){
      this.collectionsPromise = houndRequest({
          method    : 'GET',
          endpoint  : path
        }).catch( (err => { this.collectionsPromise = null; throw err; }).bind(this) );
    }

    return this.collectionsPromise;
  }

  /*
   * TODO: DocJS comments
   */
  // fetchContent(view='full', size=24, force=false){
  //   var path = this.subendpoint('content'),
  //       self = this;
  //
  //   if( force || this.contentPromise === null ){
  //     this.contentPromise = pagedRequest({
  //         method: 'GET',
  //         endpoint: path,
  //         pageSize: size,
  //         params: { view }
  //       })
  //       .catch(err => { self.contentPromise = null; throw err; })
  //       .then(function(parsed){
  //         console.log(parsed);
  //         //if( view === 'full' && Array.isArray(parsed) ){
  //         parsed = MHRelationalPair.createFromArray(parsed).sort( (a,b) => a.position - b.position );
  //         //}
  //         console.log(parsed);
  //         return parsed;
  //       });
  //   }
  //
  //   return this.contentPromise.then(res => {
  //     // if asking for 'full' but cached is 'ids'
  //     if( view === 'full' && Array.isArray(res) && typeof res[0] === 'string' ){
  //       return self.fetchContent(view, true);
  //     }
  //     // if asking for 'ids' but cached is 'full'
  //     if( view === 'ids' && Array.isArray(res) && res[0].object instanceof MHObject ){
  //       return res.map(pair => pair.object.mhid);
  //     }
  //     return res;
  //   });
  // }

  fetchContent(view='full', size=20, force=true){
    var path = this.subendpoint('content');
    if( force || this.feedPagedRequest === null ){
      this.feedPagedRequest = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: { view }
      });
    }
    //console.log(this.feedPagedRequest);
    return this.feedPagedRequest;
  }


  /* TODO: DocJS
   * mhMed.fetchSources()
   *
   * @param force { Boolean } - force refetch of content
   * @return { Promise } - resolves to
   *
   */
  fetchSources(force=false){
    var self = this,
        path = this.subendpoint('sources');

    if( force || this.sourcesPromise === null ){
      this.sourcesPromise = houndRequest({
          method  : 'GET',
          endpoint: path
        })
        .catch( err => { self.sourcesPromise = null; throw err; } )
        .then(function(parsed){
          parsed = parsed.content;
          console.log(parsed);
          return parsed.map( v => new MHSourceModel(v, self) );
        })
        .then(function(sources){
          console.log(sources);
        });

    }

    return this.sourcesPromise;
  }

  // TODO should this be here?
  fetchAvailableSources(){ return this.fetchSources(); }
  fetchDesiredSource(){ return this.fetchAvailableSources(); }


  /* TODO: docJS
   * mhMed.fetchContributors()
   *
   * @return { Promise } - resolves to
   *
   */
  fetchContributors(view='ids', force=false){
    var path = this.subendpoint('contributors');

    if( force || this.contributorsPromise === null ){
      this.contributorsPromise = houndRequest({
          method  : 'GET',
          endpoint: path,
          params: { view }
        })
        .catch( (err => { this.contributorsPromise = null; throw err; }).bind(this) )
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });

    }

    return this.contributorsPromise.then( res => {
      if( view === 'full' && Array.isArray(res) && typeof res[0] === 'string' ){
        return Promise.all(MHObject.fetchByMhids(res));
      }
      if( view === 'ids' && Array.isArray(res) && typeof res[0] instanceof MHObject ){
        return res.map(obj => obj.mhid);
      }
      return res;
    });
  }

  /* TODO: docJS
   * mhMed.fetchCharacters()
   *
   * @return { Promise } - resolves to
   *
   */
  fetchCharacters(view='ids', excludeMinors=false, force=false){
    var path = this.subendpoint('contributors');

    if( force || this.charactersPromise === null ){
      this.charactersPromise = houndRequest({
          method  : 'GET',
          endpoint: path,
          params: { view, excludeMinors }
        })
        .catch( (err => { this.charactersPromise = null; throw err; }).bind(this) )
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.charactersPromise.then(res => {
      if( view === 'full' && Array.isArray(res) && typeof res[0] === 'string' ){
        return Promise.all(MHObject.fetchByMhids(res));
      }
      if( view === 'ids' && Array.isArray(res) && typeof res[0] instanceof MHObject ){
        return res.map(obj => obj.mhid);
      }
      return res;
    });
  }

  fetchTraits(view='ids', force=false){
    var path = this.subendpoint('traits');

    if( force || this.traitsPromise === null ){
      this.traitsPromise = houndRequest({
        method: 'GET',
        endpoint: path,
        params: { view }
      })
      .catch( (err => { this.traitsPromise = null; throw err; }).bind(this) )
      .then(function(parsed){
        if( view === 'full' && Array.isArray(parsed) ){
          parsed = MHObject.create(parsed);
        }
        return parsed;
      });
    }

    return this.traitsPromise.then(res => {
      // if asking for 'full' but cached is 'ids'
      if( view === 'full' && Array.isArray(res) && typeof res[0] === 'string' ){
        return Promise.all(MHObject.fetchByMhids(res));
      }
      // if asking for 'ids' but cached is 'full'
      if( view === 'ids' && Array.isArray(res) && res[0] instanceof MHObject ){
        return res.map(obj => obj.mhid);
      }
      return res;
    });
  }

  /* TODO?
   * mhMed.fetchTrailers()
   *
   * @return { Promise } - resolves to
   *
   */

}
