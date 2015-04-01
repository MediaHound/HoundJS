
import { MHObject } from '../base/MHObject';
import { MHSourceMedium } from './MHSourceMedium';
import { houndRequest } from '../../request/hound-request';

// TODO
//@property (strong, nonatomic, readonly) NSString* logoName;
//@property (strong, nonatomic, readonly) NSString* smallLogoName;
//@property (strong, nonatomic, readonly) UIColor* logoColor;
//@property (strong, nonatomic, readonly) id<AudioPlaybackManager> audioPlaybackManager;
//@property (strong, nonatomic, readonly) id<MHAccount> account;

//- (SourceMedium*)mediumForType:(NSString*)type;
//- (NSComparisonResult)compareDesirability:(SourceModel*)otherSource;
// END TODO

var sources;

// MediaHound SourceModel Object
export class MHSourceModel {
  /**
   * @constructor
   * MHSourceModel Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param {Object|JSON} args - the main argument map
   *  @param {string} args.name
   *  @param {boolean} args.consumable
   *  @param {Array<MHSourceMedium>} args.mediums
   *  @param {MHMedia} content
   *
   *  Required Param Props
   *    name { string }
   *    consumable { Boolean }
   *    mediums { Array<MHSourceMedium> }
   *
   *
   *  Optional Param Props
   *
   */
  constructor(args, content=null) {


    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHSourceModel', 'MHSourceModel.js', 28);
      }
    }

    var name        = args.object.metadata.name     || null,
        //logo        = args.logo     || null, // not created as MHImage because it has a different set of possible properties
        mediums     = args.context.mediums  || null;
        //consumable  = (typeof args.context.consumable === 'boolean') ? args.context.consumable : null; //DEPRECATED

    // Required Props Check
    if( name === null ){
      console.warn('errored args: ', args);
      throw new TypeError('Name, consumable, or mediums null in args in MHSourceModel');
    }


    // Transform logo.url
    // if( typeof logo.url === 'string' ){
    //   logo.url = logo.url.replace(/http:|https:/gi, '');
    // }

    // Create MHSourceMediums
    if(mediums!=null){
      mediums = mediums.map( v => new MHSourceMedium(v, this) );
    }

    //console.log('MHSourceModel',mediums);

    Object.defineProperties(this, {
      'name':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        name
      },
      'mediums':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mediums
      },
      // 'logo':{
      //   configurable: false,
      //   enumerable:   true,
      //   writable:     false,
      //   value:        logo
      // },
      'content':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        content
      }
    });
  }

  static fetchAllSources(view="full",force=false){
    var path = 'graph/source/all';

    if( force || this.sourcesPromise === null ){
      this.sourcesPromise = houndRequest({
        method  : 'GET',
        endpoint: path,
        params: {view}
      })
      //.catch( err => { self.sourcesPromise = null; throw err; } )
      .then(function(parsed){
        var content = parsed.content;
        return content.map( v => MHObject.create(v.object) );
      })
      .then(function(arr){
        var obj = {};
        arr.forEach(function(source){
          var name = source.metadata.name;
          obj[name] = source;
        });
        sources = obj;
        return obj;
      });
    }

    return this.sourcesPromise;
  }

  static get sources(){
    return sources;
  }

  getAllFormats(){
    var allFormats = [];
    this.mediums.forEach(function(medium){
      medium.methods.forEach(function(method){
        allFormats = allFormats.concat(method.formats);
        console.log(allFormats);
        /*
        method.formats.forEach(function(format){
          allFormats.push(format);
        });
        */
      });
    });
    return allFormats;
  }
}
