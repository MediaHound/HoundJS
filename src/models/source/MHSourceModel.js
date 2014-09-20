/*global MHSourceMedium */

import { MHSourceMedium } from './MHSourceMedium.js';

// TODO
//@property (strong, nonatomic, readonly) NSString* logoName;
//@property (strong, nonatomic, readonly) NSString* smallLogoName;
//@property (strong, nonatomic, readonly) UIColor* logoColor;
//@property (strong, nonatomic, readonly) id<AudioPlaybackManager> audioPlaybackManager;
//@property (strong, nonatomic, readonly) id<MHAccount> account;

//- (SourceMedium*)mediumForType:(NSString*)type;
//- (NSComparisonResult)compareDesirability:(SourceModel*)otherSource;
// END TODO

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

    var name = args.name || null,
        consumable = (typeof args.consumable === 'boolean') ? args.consumable : null,
        mediums = args.mediums || null;

    if( name === null || consumable === null || mediums === null ){
      console.warn('errored args: ', args);
      throw new TypeError('Name, consumable, or mediums null in args in MHSourceModel');
    }

    mediums = mediums.map( v => new MHSourceMedium(v, this) );

    Object.defineProperties(this, {
      'name':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:name
      },
      'consumable':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:consumable
      },
      'mediums':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:mediums
      },
      'content':{
        configurable:false,
        enumerable:true,
        writable:false,
        value:content
      }
    });
  }

  getAllFormats(){
    var allFormats = [];
    this.mediums.forEach(function(medium){
      medium.methods.forEach(function(method){
        allFormats = allFormats.concat(method.formats);
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

