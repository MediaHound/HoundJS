
//@property (strong, nonatomic, readonly) NSString<Ignore>* displayName;
// ^^ not needed? don't see implementation in Obj-C version

//- (SourceFormat*)formatForType:(NSString*)type;

import { MHSourceFormat } from './MHSourceFormat';

// MediaHound SourceMethod Object
export class MHSourceMethod {
  static get TYPES(){
    return [
      'purchase',
      'rental',
      'subscription',
      'adSupported'
    ];
  }

  /* MHSourceMethod Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *  Required param props
   *      type {string}
   *      formats {Array<MHSourceFormat>}
   *
   *
   *  Optional Param Props (all type { Number }
   *
   */
  constructor(args, medium=null) {

    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceMethod', 'MHSourceMethod.js', 28);
      }
    }

    var type    = args.type     || null,
        formats = args.formats  || null;

    if( type === null || formats === null ){
      throw new TypeError('Type or formats not defined on args array in MHSourceMethod', 'MHSourceMethod.js', 41);
    }

    // Map formats to be array of MHSourceFormats instead of object array

    formats = formats.map( v => new MHSourceFormat(v, this) );
    //console.log('MHSourceMethods',formats);

    Object.defineProperties(this, {
      'type':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: type
      },
      'formats':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: formats
      },
      'medium':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: medium
      }
    });

  }

}
