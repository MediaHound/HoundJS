
import { MHObject } from '../base/MHObject';
import { MHMedia } from './MHMedia';

// MediaHound Special Series Object
export class MHSpecialSeries extends MHMedia {
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
   *      secondaryImage  - { MHImage }
   *      createdDate     - { String | Date }
   *
   * Inherited from MHMedia
   *    Optional Param Props
   *      releaseDate     - { String | Date }
   *      length
   *      keyContributors
   *      primaryGroup
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);
    // No Unique items
  }

  static get mhidPrefix() { return 'mhsps'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

}

(function(){
  MHObject.registerConstructor(MHSpecialSeries);
})();

