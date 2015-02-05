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
    var connected   = args.connected || null,
        preference  = args.preference || null,
        consumable  = args.consumable || null,
        mediums     = args.mediums  || null,
        position    = args.sorting.position || args.sorting.importance || null;

    if(position){
      Object.defineProperty(this,'position',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        position
      });
      //All MHContexts with a position param do not require other params, so return
      return;
    }

    if(connected){
      Object.defineProperty(this,'connected',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        connected
      });
    }

    if(preference){
      Object.defineProperty(this,'preference',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        preference
      });
    }

    if(consumable){
      Object.defineProperty(this,'consumable',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        consumable
      });
    }

    if(mediums){
      Object.defineProperty(this,'mediums',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mediums
      });
    }

  }

}
