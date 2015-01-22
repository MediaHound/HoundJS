
// TODO
//- (SourceMethod*)methodForType:(NSString*)type;

import { MHSourceMethod } from './MHSourceMethod';

// MediaHound SourceMedium Object
export class MHSourceMedium {
  static get TYPES(){
    return [
      'stream',
      'download',
      'deliver',
      'pickup',
      'attend'
    ];
  }

  /** @constructor
   * MHSourceMedium Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *  Required Param Props (all type { Number }
   *    type { string }
   *    methods { Array<MHSourceModel> }
   *
   *  Optional Param Props (all type { Number }
   *
   */
  constructor(args, source=null) {

    console.log(args);
    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceMedium', 'MHSourceMedium.js', 28);
      }
    }

    var type = args.type || null,
        methods = args.methods || null;

    if( type === null || methods === null ){
      throw new TypeError('Type or methods not defined on args in MHSourceMedium');
    }

    // Map methods to MHSourceMethod
    methods = methods.map( v => new MHSourceMethod(v, this) );


    Object.defineProperties(this, {
      'type':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:type
      },
      'methods':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:methods
      },
      'source':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:source
      }
    });

  }

}
