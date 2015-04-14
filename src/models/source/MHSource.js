
import { MHObject } from '../base/MHObject';

// MediaHound Source Master Object
export class MHSource extends MHObject {
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

        var mediums = (args.allMediums) ? args.allMediums : null,
            subscriptions = (args.subscriptions) ? args.subscriptions : null;

        if(subscriptions !== null){
          subscriptions = subscriptions.map( v => MHObject.create(v) );
        }

        Object.defineProperties(this, {
          'mediums':{
            configurable: false,
            enumerable:   true,
            writable:     false,
            value:        mediums
          },
          'subscriptions':{
            configurable: false,
            enumerable:   true,
            writable:     false,
            value:        subscriptions
          }
        });
  }

  static get mhidPrefix() { return 'mhsrc'; }

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
  MHObject.registerConstructor(MHSource, 'MHSource');
})();
