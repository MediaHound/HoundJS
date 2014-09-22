
import { MHObject } from '../base/MHObject';
import { MHMedia } from './MHMedia';

// MediaHound Album Object
export class MHAlbumSeries extends MHMedia {
  /* MHAlbum Constructor
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
    // No Unique Values
  }

  /** @property {string} mhidPrefix - the mhid prefix for this class **/
  static get mhidPrefix() { return 'mhals'; }
  get displayableType()   { return 'Album Series'; }


  // Could change as needed
  toString(){
    return super.toString();
  }

}

(function(){
  MHObject.registerConstructor(MHAlbumSeries);
})();

