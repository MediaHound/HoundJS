
import { MHObject } from '../base/MHObject';
import { MHMedia } from '../media/MHMedia';
import { houndRequest } from '../../request/hound-request';

// MediaHound Contributor Object
export class MHContributor extends MHObject {
  /* MHContributor Constructor
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
   * TODO
   * MHContributor
   *  STILL IN FLUX
   *
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);

    Object.defineProperties(this, {
      // Props
      // Promises
      'mediaPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'collectionsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  /*
   * TODO DocJS
   */
  get isGroup(){
    return !this.isIndividual;
  }

  /*
   * TODO DocJS
   */
  get isFictional(){
    return !this.isReal;
  }

  /*
   * TODO DocJS
   */
  static get rootEndpoint(){
    if( this.prototype.isFictional && this.prototype.isReal != null ){
      return 'graph/character';
    }
    return 'graph/contributor';
  }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /*
   * TODO DocJS
   */
  fetchMedia(view='ids', force=false){
    var path = this.subendpoint('media');

    if( force || this.mediaPromise === null ){
      this.mediaPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params:{
            'view':view
          }
        })
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.mediaPromise;
  }

  /*
   * mhContributor.fetchCollections(force)
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
        })
        .then(function(ids){
          // TODO, remove? fix? view=full?
          return Promise.all(ids.map(v => MHObject.fetchByMhid(v)));
        });
    }

    return this.collectionsPromise;
  }

}

