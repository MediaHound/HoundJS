
import { MHObject } from '../base/MHObject';
import { MHAction } from './MHAction';

// MediaHound Like Object
export class MHLike extends MHAction {
  /* MHLike Constructor
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
   * MHLike Params
   *    No Unique
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // No Unique Props
  }

  static get mhidPrefix() { return 'mhlke'; }
  get displayableType()   { return 'Liked'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

}

(function(){
  MHObject.registerConstructor(MHLike);
})();

