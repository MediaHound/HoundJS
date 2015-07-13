
import { MHObject } from '../base/MHObject.js';
import { MHSourceModel } from '../source/MHSourceModel.js';

import { MHRelationalPair } from '../base/MHRelationalPair.js';
//import { MHEmbeddedRelation } from '../base/MHEmbeddedRelation.js';

import { houndRequest } from '../../request/hound-request.js';
import { pagedRequest } from '../../request/hound-paged-request.js';

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

    super(args);

    // Default MHMedia unique objects to null
    var keyContributors   = (!!args.keyContributors) ? MHRelationalPair.createFromArray(args.keyContributors) : null;

    self.initializeProperty('keyContributors', keyContributors);
  }

  /*
   * MHMedia.rootEndpoint
   *
   * @return { String } - endpoint for this MHObject Type
   */
  static get rootEndpoint() { return 'graph/media'; }

  mergeWithData(parsedArgs) {
    super.mergeWithData(parsedArgs);

    if (!this.keyContributors && parsedArgs.keyContributors) {
      var keyContributors = MHRelationalPair.createFromArray(parsedArgs.keyContributors);
      if (keyContributors) {
        this.keyContributors = keyContributors;
      }
    }
  }

  /* TODO: DocJS
  * mhMed.fetchContent()
  *
  * @param force { Boolean } - force refetch of content
  * @return { Promise } - resolves to
  *
  */

  fetchContent(view='full', size=20, force=false){
    var path = this.subendpoint('content');
    return this.fetchPagedEndpoint(path, view=view, size=size, force=force);
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
    return this.fetchPagedEndpoint(path, view=view, size=size, force=force);
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
    return this.fetchPagedEndpoint(path, view=view, size=size, force=force);
  }

  static fetchRelatedTo(medias, view='full', size=12){
    var mhids = medias.map( m => m.metadata.mhid );
    var path = this.rootSubendpoint('related');
    return pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: {
        view: view,
        ids: mhids
      }
    });
  }

  /**
  * mhObj.fetchShortestDistance(otherMhid)
  *
  * @param { otherMhid } otherMhid - the MHID for the object to calculate shortest path.
  *
  * @return { Number }  - Returns the shortest distance between the two objects.
  *                       If there is no path between the two objects, returns `null`.
  *
  */
  fetchShortestDistance(otherMhid){
    var path = this.subendpoint('shortestPath/' + otherMhid);
    return houndRequest({
      method: 'GET',
      endpoint: path
    }).then(function(response) {
      // This method returns an array of shortest paths.
      // Since we only care about the length, we can look at the first
      // shortest path and calculate its length.
      // The path includes both the start and mhid.
      // We do not count the start as a 'step', so we subtract one.
      return response.paths[0].path.length - 1;
    }).catch(function(err) {
      if (err.xhr.status === 404) {
        // A 404 indicates there is no path between the two nodes.
        return null;
      }
      else {
        throw err;
      }
    });
  }
}
