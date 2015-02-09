export class MHMetaData {
  /*  MHMetaData Constructor
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

    // Unique Properties
    var mhid        = args.mhid  || null,
        altid       = args.altid || null,
        name        = args.name || null,
        description = args.description || null,
        message     = args.message || null,
        mixlist     = args.mixlist || null,
        username    = args.username || null,
        email       = args.email || null,
        isDefault   = args.isDefault || null,
        averageColor = args.averageColor || null,
        createdDate = new Date(args.createdDate*1000),
        releaseDate = new Date(args.releaseDate*1000);


    if(name){
      Object.defineProperty(this,'name',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        name
      });
    }

    if(altid){
      Object.defineProperty(this,'altId',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        altid
      });
    }

    if(username){
      Object.defineProperty(this,'username',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        username
      });
    }

    if(email){
      Object.defineProperty(this,'email',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        email
      });
    }

    if(description){
      Object.defineProperty(this,'description',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        description
      });
    }

    if(message){
      Object.defineProperty(this,'message',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        message
      });
    }

    if(mixlist){
      Object.defineProperty(this,'mixlist',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mixlist
      });
    }

    if(averageColor){
      Object.defineProperty(this,'averageColor',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        averageColor
      });
    }

    if(isDefault){
      Object.defineProperty(this,'isDefault',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        isDefault
      });
    }

    if(args.releaseDate){
      if( isNaN(releaseDate) ){
        releaseDate = null;
      }
      else if(releaseDate === 'Invalid Date'){
        releaseDate = null;
      }
      else{
        releaseDate = new Date(releaseDate.valueOf() + releaseDate.getTimezoneOffset() * 60000);
      }

      Object.defineProperty(this,'releaseDate',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        releaseDate
      });

    }

    if(args.createdDate){
      if( isNaN(createdDate) ){
        createdDate = null;
      }
      else if(createdDate === 'Invalid Date'){
        createdDate = null;
      }
      else{
        createdDate = new Date(createdDate.valueOf() + createdDate.getTimezoneOffset() );
      }

      Object.defineProperty(this,'createdDate',{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        createdDate
      });
    }

    Object.defineProperty(this, 'mhid', {
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mhid
    });
  }

}
