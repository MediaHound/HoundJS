
import { MHObject } from '../base/MHObject';

export class MHMetaData extends MHObject {
  /*  MHImage Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *  Required Param Props
   *      name            - { String }
   *      mhid            - { MHMediaData }
   *      altid           - { MHMediaData }
   *      createdDate     - { Date }
   *
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    super(args);

    // Unique Properties
    var mhid        = args.mhid  || null,
        altid       = args.altid || null,
        name        = args.name || null,
        description = args.description || null,
        message     = args.message || null,
        mixlist     = args.mixlist || null,
        username    = args.username || null,
        email       = args.email || null,
        phoneNumber = args.phoneNumber || null,
        isDefault   = args.isDefault || null,
        primaryColor = args.primaryColor || null,
        createdDate = new Date(args.createdDate)*1000 || null,
        releaseDate = new Date(args.createdDate)*1000 || null;

    Object.defineProperties(this, {
      'mhid':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mhid
      },
      'altid':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        altid
      },
      'name':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        name
      },
      'description':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        description
      },
      'message':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        message
      },
      'mixlist':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mixlist
      },
      'username':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        username
      },
      'email':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        email
      },
      'phoneNumber':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        phoneNumber
      },
      'isDefault':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        isDefault
      },
      'primaryColor':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        primaryColor
      },
      'createdDate':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        createdDate
      },
      'releaseDate':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        releaseDate
      }
    });
  }

}

(function(){
  MHObject.registerConstructor(MHMetaData);
}());