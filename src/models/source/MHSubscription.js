
import { MHObject } from '../base/MHObject.js';

// MediaHound Source Master Object
export class MHSubscription extends MHObject {
  /* MHGSourceMaster Constructor
  *
  * MediaHound Object constructors take a single parameter {Object | JSON String}
  * If the argument is an object properties will be read and placed properly
  * if a prop doesn't exist and is optional it will be replaced with a null value.
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
  *
  */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);

    var mediums = (args.metadata.mediums) ? args.metadata.mediums : null;

    Object.defineProperties(this, {
      'mediums':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mediums
      }
    });
  }

  static get mhidPrefix() { return 'mhsubtemp'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /* TODO
  *
  * Fetching Stuff
  *  fetchAvailableSources
  *  fetchDesiredSource
  *
  */

}

(function(){
  MHObject.registerConstructor(MHSubscription, 'MHSubscription');
})();
