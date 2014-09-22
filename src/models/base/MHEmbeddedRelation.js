
import { MHEmbeddedObject } from './MHEmbeddedObject';

// MediaHound Embedded Object
export class MHEmbeddedRelation extends MHEmbeddedObject {
  /* MHEmbeddedRelation Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *
   */
  constructor(args) {
    if( args == null ){
      throw new TypeError('Args is null or undefined in MHEmbeddedRelation constructor.');
    }
    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHEmbeddedRelation', 'MHEmbeddedRelation.js', 24);
      }
    }

    super(args);

    var position  = args.position || null;


    Object.defineProperties(this, {
      'position':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        position
      }
    });
  }

  static createFromArray(arr){
    if( Array.isArray(arr) ){
      return arr.map( v => new MHEmbeddedRelation(v) );
    } else if( arr && arr.length > 0 ){
      var i = 0, len = arr.length,
          newArry = [];
      for( ; i < len ; i++ ){
        newArry.push( new MHEmbeddedRelation(arr[i]) );
      }
      return newArry;
    }
    return arr;
  }
}

