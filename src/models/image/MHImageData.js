
export class MHImageData {
  /*  MHImageData Constructor
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
    // Unique Properties
    var url       = (typeof args.url === 'string') ? args.url : null,
        width     = args.width  || null,
        height    = args.height || null;

    Object.defineProperties(this, {
      'url':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        url
      },
      'width':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        width
      },
      'height':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        height
      }
    });
  }
}
