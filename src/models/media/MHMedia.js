
import { MHObject } from '../base/MHObject';
import { MHSourceModel } from '../source/MHSourceModel';

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
    var keyContributors   = (!!args.keyContributors) ? MHObject.createFromArray(args.keyContributors) : null;

    // Create imutable properties
    //  releaseDate
    Object.defineProperties(this, {
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
      'collections':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'content':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'sources':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'contributors':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'characters':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'traits':{
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
   fetchCollections(view='full', size=20, force=true){
     var path = this.subendpoint('collections');
     if( force || this.collections === null ){
       this.collections = pagedRequest({
         method: 'GET',
         endpoint: path,
         pageSize: size,
         params: { view }
       });
     }
     //console.log(this.feedPagedRequest);
     return this.collections;
   }

  /* TODO: DocJS
  * mhMed.fetchContent()
  *
  * @param force { Boolean } - force refetch of content
  * @return { Promise } - resolves to
  *
  */

  fetchContent(view='full', size=20, force=true){
    var path = this.subendpoint('content');
    if( force || this.content === null ){
      this.content = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: { view }
      });
    }
    //console.log(this.feedPagedRequest);
    return this.content;
  }


  /* TODO: DocJS
   * mhMed.fetchSources()
   *
   * @param force { Boolean } - force refetch of content
   * @return { Promise } - resolves to
   *
   */
  fetchSources(force=true){
    var self = this,
        path = this.subendpoint('sources');

    if(MHSourceModel.sources === null || MHSourceModel.sources === undefined){
      MHSourceModel.fetchAllSources("full",true);
    }

    if( force || this.sources === null ){

      this.sources = houndRequest({
          method  : 'GET',
          endpoint: path
        })
        .catch( err => { self.sources = null; throw err; } )
        .then(function(parsed){
          var content = parsed.content;
          return content.map( v => new MHSourceModel(v, self) );
        });
    }

    return this.sources;
  }

  // TODO should this be here?
  fetchAvailableSources(){ return this.fetchSources(); }
  fetchDesiredSource(){ return this.fetchAvailableSources(); }


  /**
  * mhObj.fetchContributors(mhid,force)
  *
  * @param { string='full' } view - the view needed to depict each MHObject that is returned
  * @param { number=12     } size  - the number of items to return per page
  * @param { Boolean=false } force
  *
  * @return { houndPagedRequest }  - MediaHound paged request object for this feed
  *
  */

  fetchContributors(view='full', size=12, force=false){
    var path = this.subendpoint('contributors');
    if( force || this.contributors === null ){
      this.contributors = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: {view}
      });
    }
    return this.contributors;
  }


  /**
  * mhObj.fetchCharacters(mhid,force)
  *
  * @param { string='full' } view - the view needed to depict each MHObject that is returned
  * @param { number=0      } page - the zero indexed page number to return
  * @param { number=12     } size  - the number of items to return per page
  * @param { Boolean=false } force
  *
  * @return { houndPagedRequest }  - MediaHound paged request object for this feed
  *
  */
  fetchCharacters(view='full', size=12, force=false){
    var path = this.subendpoint('characters');
    if( force || this.characters === null ){
      this.characters = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: {view}
      });
    }
    return this.characters;
  }


  /**
  * mhObj.fetchTraits(mhid,force)
  *
  * @param { string='full' } view - the view needed to depict each MHObject that is returned
  * @param { number=0      } page - the zero indexed page number to return
  * @param { number=12     } size  - the number of items to return per page
  * @param { Boolean=false } force
  *
  * @return { houndPagedRequest }  - MediaHound paged request object for this feed
  *
  */
  fetchTraits(view='full', size=12, force=false){
    var path = this.subendpoint('traits');
    if( force || this.traits === null ){
      this.traits = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: {view}
      });
    }
    //console.log(this.feedPagedRequest);
    return this.traits;
  }


  /**
  * mhObj.fetchRelated(mhid,force)
  *
  * @param { string='full' } view - the view needed to depict each MHObject that is returned
  * @param { number=0      } page - the zero indexed page number to return
  * @param { number=12     } size  - the number of items to return per page
  * @param { Boolean=false } force
  *
  * @return { houndPagedRequest }  - MediaHound paged request object for this feed
  *
  */
  fetchRelated(view='full', size=12, force=false){
    var path = this.subendpoint('related');
    if( force || this.related === null ){
      this.related = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: {view}
      });
    }
    return this.related;
  }

  /**
  * mhObj.fetchShortestPath(mhid,force)
  *
  * @param { otherMhid     } otherMhid - the MHID for the object to calculate shortest path
  * 
  * @return { houndRequest }  - MediaHound request object for this shortest path
  *
  */
  fetchShortestPath(otherMhid){
    var path = this.subendpoint('shortestPath/' + otherMhid);
    return houndRequest({
      method: 'GET',
      endpoint: path
    });
  }

  /* TODO?
   * mhMed.fetchTrailers()
   *
   * @return { Promise } - resolves to
   *
   */

}
