
import { MHObject, mhidLRU } from './MHObject';

// MediaHound Relational Pair Object
export class MHRelationalPair {
  /* MHRelationalPair Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   */
  constructor(args){
    if( args == null ){
      throw new TypeError('Args is null or undefined in MHRelationalPair constructor.');
    }
    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not valid JSON in MHRelationalPair', 'MHRelationalPair.js', 15);
      }
    }

    var position  = args.context.sorting.position || null,
        context   = args.context || null,
        object    = mhidLRU.has(args.object.mhid) ? mhidLRU.get(args.object.mhid) : MHObject.create(args.object) || null;

    if( position == null || object == null ){
      throw new TypeError('Either position or object was not defined in MHRelationalPair', 'MHRelationalPair.js', 23);
    }

    Object.defineProperties(this, {
      'position':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        position
      },
      'context':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        context
      },
      'object':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        object
      }
    });
  }

  toString(){
    return this.object.name + ' at position ' + this.position;
  }

  static createFromArray(arr){
    if( Array.isArray(arr) ){
      return arr.map( v => {
        try{
          return new MHRelationalPair(v);
        } catch(e) {
          return v;
        }
      });
    } else if( arr && arr.length > 0 ){
      var i = 0, len = arr.length,
          newArry = [];
      for( ; i < len ; i++ ){
        newArry.push( new MHRelationalPair(arr[i]) );
      }
      return newArry;
    }
    return arr;
  }
}
