export class MHContext {
  /*  MHContext Constructor
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
  constructor(args){

    // Unique Properties
    var connected   = args.connected,
        preference  = args.preference || null,
        position    = args.position || null;

    Object.defineProperties(this, {
      'connected':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        connected
      },
      'preference':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        preference
      },
      'position':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        position
      }
    });
  }

}
