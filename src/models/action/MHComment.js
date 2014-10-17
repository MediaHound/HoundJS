
import { MHObject } from '../base/MHObject';
import { MHAction } from './MHAction';
import { houndRequest } from '../../request/hound-request';

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

    Object.defineProperties(this, {
     // Promises
     'parentPromise': {
       configurable:  false,
       enumerable:    false,
       writable:      true,
       value:         null
     }
    });

  }

  static get mhidPrefix() { return 'mhcmt'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /*
   * TODO docJS
   */
  fetchParentAction(force=false){
    var path = this.subendpoint('parent');

    if( force || this.parentPromise === null ){
      this.parentPromise = houndRequest({
          method: 'GET',
          endpoint: path
        }).catch( (err => { this.parentPromise = null; throw err; }).bind(this) );

    }

    return this.parentPromise;
  }

}

(function(){
  MHObject.registerConstructor(MHComment);
})();

