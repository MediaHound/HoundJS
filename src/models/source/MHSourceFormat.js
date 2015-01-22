
// MediaHound SourceFormat Object
export class MHSourceFormat {
  /* MHSourceFormat Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *  Required Param Props
   *      type { string }
   *      price { number }
   *      launchInfo { object }
   *
   *  Optional Param Props (all type { Number }
   *      timeperiod { string }
   *      subscriptionDescription { string }
   *
   */
  constructor(args, method=null) {

    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceFormat', 'MHSourceFormat.js', 28);
      }
    }
    var type        = args.type       || null,
        price       = args.price,
        launchInfo  = args.launchInfo || null,
        timePeriod  = args.timePeriod || null;

    // if( type === null || price === null || launchInfo === null ){
    //   throw new TypeError('Required info not defined on argument map in MHSourceFormat', 'MHSourceFormat.js', 41);
    // }
    // if(price === undefined){
    //   throw new TypeError('Price is undefined.', 'MHSourceFormat.js', 43);
    // }
    Object.defineProperties(this, {
      'type':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: type
      },
      'price':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: price
      },
      'launchInfo':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: launchInfo
      },
      'timePeriod':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: timePeriod
      },
      'method':{
        configurable:false,
        enumerable:true,
        writable:false,
        value: method
      }
    });

  } // end constructor

  get displayPrice(){
    return '$'+this.price;
  }

}
