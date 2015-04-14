
import { MHObject } from '../base/MHObject';
import { MHMedia } from './MHMedia';

// MediaHound Game (Track) Object
export class MHGame extends MHMedia {
  /* MHGame Constructor
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
   * Inherited from MHMedia
   *    Optional Param Props
   *      releaseDate     - { String | Date }
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);
    // No Unique Members
  }

  static get mhidPrefix() { return 'mhgam'; }

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
  MHObject.registerConstructor(MHGame, 'MHGame');
})();

