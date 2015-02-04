
import { MHObject } from '../base/MHObject';
import { pagedRequest } from '../../request/hound-paged-request';

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
      'media':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'collections':{
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
   fetchMedia(view='full', size=12, force=true){
     var path = this.subendpoint('media');
     if( force || this.media === null ){
       this.media = pagedRequest({
         method: 'GET',
         endpoint: path,
         pageSize: size,
         params: { view }
       });
     }
     //console.log(this.feedPagedRequest);
     return this.media;
   }

  /*
   * mhContributor.fetchCollections(force)
   *
   * @return { Promise }  - resolves to server response of collections for this MediaHound object
   *
   */
   fetchCollections(view='full', size=12, force=true){
     var path = this.subendpoint('collections');
     if( force || this.collections === null ){
       this.collections = pagedRequest({
         method: 'GET',
         endpoint: path,
         pageSize: size,
         params: { view }
       });
     }
     return this.collections;
   }

}
