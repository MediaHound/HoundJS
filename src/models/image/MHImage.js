
import { MHObject } from '../base/MHObject';
import { MHImageData } from './MHImageData';

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

    // Unique Properties
    var isDefault = (typeof args.isDefault === 'boolean') ? args.isDefault : null,
        original  = (args.original != null) ? new MHImageData(args.original) : null,
        thumbnail = (args.thumbnail != null) ? new MHImageData(args.thumbnail) : null,
        small     = (args.small != null) ? new MHImageData(args.small) : null,
        medium    = (args.medium != null) ? new MHImageData(args.medium) : null,
        large     = (args.large != null) ? new MHImageData(args.large) : null;

    Object.defineProperties(this, {
      'isDefault':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        isDefault
      },
      'original':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        original
      },
      'thumbnail':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        thumbnail
      },
      'small':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        small
      },
      'medium':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        medium
      },
      'large':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        large
      }
    });

  }

  static get mhidPrefix(){
    return 'mhimg';
  }

  static get rootEndpoint(){
    return 'graph/image';
  }
}

(function(){
  MHObject.registerConstructor(MHImage);
}());
