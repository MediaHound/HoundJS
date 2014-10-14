
import { MHObject } from '../base/MHObject';
import { MHMedia } from './MHMedia';

// MediaHound Song (Track) Object
export class MHSong extends MHMedia {
  /* MHSong Constructor
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
   *
   * Added Properties, NON STANDARD
   *  only found from media/mhid/tracks endpoint
   *
   *  entityNumber
   *  volumeNumber
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);
    // No Unique Members
  }

  static get mhidPrefix() { return 'mhsng'; }

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
  MHObject.registerConstructor(MHSong);
})();

