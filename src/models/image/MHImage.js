
import { MHObject } from '../base/MHObject';

export class MHImage extends MHObject {
  /*  MHImage Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   * Inherited from MHObject
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *  Optional Param Props
   *      name            - { String }
   *      primaryImage    - { MHImage }
   *      secondaryImage  - { MHImage }
   *      createdDate     - { Date }
   *
   *  Unique MHImage Props
   *      url     { String } - The url this image points to
   *      width   { Number } - the length of the width
   *      height  { Number } - I think you get it
   *
   *  Possible others
   *    originalImageUrl
   *    primaryColor
   *    blurable
   *    etc.
   *
   */
  constructor(args){

    args = MHObject.parseArgs(args);
    super(args);
  }

  static get mhidPrefix(){
    return 'mhimg';
  }

  static get rootEndpoint(){
    return 'graph/image';
  }
}

(function(){
  MHObject.registerConstructor(MHImage, 'MHImage');
}());
