
import { MHObject, mhidLRU } from '../base/MHObject';
import { MHAction } from './MHAction';
import { houndRequest } from '../../request/hound-request';

// MediaHound Hashtag Object
export class MHHashtag extends MHAction {
  /* MHPost Constructor
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
   * Inherited from MHAction
   *    Optional Param Props
   *      message     - { String }
   *      owners      - { Array }
   *      mentions    - { Array }
   *
   * MHPost Params
   *    No Unique
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // No Unique Props
  }

  static get rootEndpoint(){ return 'graph/hashtag'; }

  static get mhidPrefix() { return 'mhhtg'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /**
  * MHHashtag.fetchByTag(tag,view,force)
  *
  * @param { String } username - Username to fetch info for
  * @param { boolean} force - force fetch to server
  *
  * @return { Promise } - resolves to the MHUser object
  *
  */
  static fetchByTag(tag, view='basic', force=false){
    if( !tag || (typeof tag !== 'string' && !(tag instanceof String)) ){
      throw new TypeError('Hashtag not of type String in fetchByTag');
    }
    if( MHObject.getPrefixFromMhid(tag) != null ){
      throw new TypeError('Passed mhid to fetchByTag, please use MHObject.fetchByMhid for this request.');
    }
    if(view === null || view === undefined) {
      view = 'basic';
    }

    console.log('in fetchByTag, looking for: ' + tag);

    // Check LRU for altId === username
    if( !force && mhidLRU.hasAltId(tag) ){
      return Promise.resolve(mhidLRU.getByAltId(tag));
    }

    var path = MHHashtag.rootEndpoint + '/lookup/' + tag,
    newObj;

    return houndRequest({
      method          : 'GET',
      endpoint        : path,
      withCredentials : true,
      params:{
        view: view
      }
    })
    .then(function(response){
      newObj = MHObject.create(response);
      mhidLRU.putMHObj(newObj);
      return newObj;
    });
  }


}

(function(){
  MHObject.registerConstructor(MHHashtag);
})();
