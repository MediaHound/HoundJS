
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';
import { houndRequest } from '../../request/hound-request.js';

// MediaHound Comment Object
export class MHComment extends MHAction {
  /* MHComment Constructor
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
   * MHComment Parmas
   *    No unique
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // No Unique Props
  }

  static get mhidPrefix() { return 'mhcmt'; }
  get displayableType()   { return 'Commented'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /*
   * TODO docJS
   */
  fetchParentAction(force=false){
    var path = this.subendpoint('parent'),
        parentPromise = this.parentPromise || null;

    if( force || parentPromise === null ){
      parentPromise = houndRequest({
          method: 'GET',
          endpoint: path
        });

      if( this.hasOwnProperty('parentPromise') ){
        this.parentPromise = parentPromise;
      } else {
        Object.defineProperty(this, 'parentPromise', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: parentPromise
        });
      }
    }

    return this.parentPromise;
  }

}

(function(){
  MHObject.registerConstructor(MHComment);
})();

