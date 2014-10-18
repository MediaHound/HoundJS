
import { MHObject } from '../base/MHObject';
import { MHTrait } from './MHTrait';

// MediaHound Trait Object
export class MHGenre extends MHTrait {
  /* MHMedia Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   * TODO UPDATE
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
   *      secondaryImage  - { MHImage }
   *      createdDate     - { String | Date }
   *
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);
    // No Unique items

    var description = args.description || null;

    Object.defineProperties(this, {
      'description':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        description
      }
    });
  }

  static get mhidPrefix() { return 'mhgnr'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

}

(function(){
  MHObject.registerConstructor(MHGenre);
})();

