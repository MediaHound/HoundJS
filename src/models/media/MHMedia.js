
import { MHObject } from '../base/MHObject.js';
import { MHSourceModel } from '../source/MHSourceModel.js';
import { MHEmbeddedObject } from '../base/MHEmbeddedObject.js';
import { MHRelationalPair } from '../base/MHRelationalPair.js';
import { MHEmbeddedRelation } from '../base/MHEmbeddedRelation.js';

import { houndRequest } from '../../request/hound-request.js';

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
    var releaseDate       = new Date(args.releaseDate),
        suitabilityRating = args.suitabilityRating  || null,
        length            = args.length             || null,
        primaryGroup      = args.primaryGroup       || null,
        keyContributors   = (!!args.keyContributors) ? MHEmbeddedObject.createFromArray(args.keyContributors) : null;
        //primaryGroup      = (!!args.primaryGroup)    ? new MHEmbeddedRelation(args.primaryGroup) : null;


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
      'primaryGroup':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        primaryGroup
      },
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
      }
    });
  }

  //get displayableType(){ return ''; }

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
          method: 'GET',
          endpoint: path
        });
    }

    return this.collectionsPromise;
  }

  /*
   * TODO: DocJS comments
   */
  fetchContent(view='ids', force=false){
    var path = this.subendpoint('content');

    if( force || this.contentPromise === null ){
      this.contentPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params: {
            'view':view
          }
        })
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHRelationalPair.createFromArray(parsed).sort( (a,b) => a.position - b.position );
            //parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.contentPromise.then(function(parsed){
      if( view === 'full' && Array.isArray(parsed) && typeof parsed[0] === 'string'){
        return Promise.all(MHObject.fetchByMhids(parsed));
      } else if( view === 'ids' && Array.isArray(parsed) && parsed[0] instanceof MHObject ){
        return parsed.map(mhObj => mhObj.mhid);
      }
      return parsed;
    });
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
        .then(function(parsed){
          return parsed.map( v => new MHSourceModel(v, self) );
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
          params: {
            'view':view,
            'fullView': (view === 'full') // TODO deprecate
          }
        })
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });

    }

    return this.contributorsPromise;
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
          params: {
            'view':view,
            'fullView': (view === 'full'), // TODO deprecate
            'excludeMinors': excludeMinors
          }
        })
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.charactersPromise;
  }

  /* TODO?
   * mhMed.fetchTrailers()
   *
   * @return { Promise } - resolves to
   *
   */

}

