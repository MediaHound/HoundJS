
import { MHMedia } from '../media/MHMedia.js';
import { MHLoginSession } from '../user/MHLoginSession.js';

import { houndRequest } from '../../request/hound-request.js';

/**
 * @classdesc Mediahound Collection Object (MHCollection) inherits from MHObject
 */
export class MHCollection extends MHObject {
  /**
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   * @constructor
   * @param {Object|JSON} args - Object map that describes a MediaHound Collection Object
   * @param {MHID} args.mhid - A valid MediaHound Collection ID
   * @param {string} [args.name=null] - The name of this collection
   * @param {MHImage} [args.primaryImage=null] - the primary image url of this MHCollection object
   * @param {Date} [args.createdDate=null] - The date this MHCollection was created
   * @param {string} [args.description=null] - A description for this MHCollection
   * @returns {MHCollection} The MHCollection described by args
   *
   * Inherited from MHObject
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *    Optional Param Props
   *      name            - { String }
   *      primaryImage    - { MHImage }
   *      createdDate     - { String | Date }
   *
   * MHCollection
   *    Optional Param Props
   *      description     - { String }
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);

    // mixlist = 'none', 'partial', 'full'

    var mixlist = (typeof args.mixlist === 'string') ? args.mixlist.toLowerCase() : null,
        description = args.description || null;

    switch(mixlist){
      case 'none':
           mixlist = MHCollection.MIXLIST_TYPE_NONE;
           break;
      case 'partial':
           mixlist = MHCollection.MIXLIST_TYPE_PARTIAL;
           break;
      case 'full':
           mixlist = MHCollection.MIXLIST_TYPE_FULL;
           break;
      default:
           mixlist = MHCollection.MIXLIST_TYPE_NONE;
           break;
    }

    Object.defineProperties(this, {
      'mixlist':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mixlist
      },
      'description':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        description
      }
      //TODO add promises
    });
  }

  // Static Mixlist enums
  static get MIXLIST_TYPE_NONE()   { return 0; }
  static get MIXLIST_TYPE_PARTIAL(){ return 1; }
  static get MIXLIST_TYPE_FULL()   { return 2; }

  get mixlistTypeString(){
    switch(this.mixlist){
      case MHCollection.MIXLIST_TYPE_NONE:
        return 'none';
      case MHCollection.MIXLIST_TYPE_PARTIAL:
        return 'partial';
      case MHCollection.MIXLIST_TYPE_FULL:
        return 'full';
      default:
        return 'none';
    }
    return '';
  }

  /** @property {string} - the prefix for MHCollection mhids */
  static get mhidPrefix() { return 'mhcol'; }

  /** @property {string} - a view friendly name for the MHCollection class */
  get displayableType() { return 'Collection'; }

  /**
   * @property {string} - the api endpoint for the MHCollection class
   * @static
   */
  static get rootEndpoint(){ return 'graph/collection'; }

  // Could change as needed
  /**
   * @function toString
   * @returns {string}
   */
  toString(){
    return super.toString() + ' and description ' + this.description;
  }

  /**
   * @param {string} name - the name of the new collection for the currently logged in user.
   * @returns {Promise<MHCollection>} - a Promise that resolves to the newly created MHCollection
   * @static
   */
  static createWithName(name){
    var path = MHCollection.rootEndpoint + '/new';
    return houndRequest({
        method: 'POST',
        endpoint: path,
        data: { name }
      })
      .then(function(response){
        return MHObject.fetchByMhid(response.mhid);
      })
      .then(function(newCollection){
        if( MHLoginSession.openSession ){
          MHLoginSession.currentUser.fetchOwnedCollections(true);
        }
        return newCollection;
      });
  }

  /**
   * @param {MHMedia} - a MHMedia object to add to this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  addContent(content){
    return this.addContents([content]);
  }

  /**
   * @param {Array<MHMedia>} - an Array of MHMedia objects to add to this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  addContents(contents){
    return this.changeContents(contents, 'add');
  }

  /**
   * @param {MHMedia} - a MHMedia object to remove from this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  removeContent(content){
    return this.removeContents([content]);
  }

  /**
   * @param {Array<MHMedia>} - an Array of MHMedia objects to remove from this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  removeContents(contents){
    return this.changeContents(contents, 'remove');
  }

  /**
   * @private
   * @param {Array<MHMedia>} - an Array of MHMedia objects to add or remove from this collection
   * @param {string} sub - the subendpoint string, 'add' or 'remove'
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  changeContents(contents, sub){
    if( !Array.isArray(contents) ){
      throw new TypeError('Contents must be an array in changeContents');
    }
    if( typeof sub !== 'string' || (sub !== 'add' && sub !== 'remove') ){
      throw new TypeError('Subendpoint must be add or remove');
    }

    var path = this.subendpoint(sub),
        contentPromise,
        mhids = contents.map(function(v,i,a){

          if( v instanceof MHObject ){
            return v.mhid;
          } else if ( typeof v === 'string' && MHObject.prefixes.indexOf(MHObject.getPrefixFromMhid(v)) > -1 ){
            // TODO double check this if statement
            return v;
          }
          return null;
        }).filter(v => v !== null);


    console.log(mhids);
    contentPromise = houndRequest({
        method: 'POST',
        endpoint: path,
        data: {
          'content': mhids
        }
      }).then(function(response){
        // fetch social for original passed in mhobjs
        contents.forEach(v => v.fetchSocial());
        return response;
      });

    if( this.hasOwnProperty('contentPromise') ){
      this.contentPromise = contentPromise;
    } else {
      Object.defineProperty(this, 'contentPromise', {
        configurable: false,
        enumerable: true,
        writable: true,
        value: contentPromise
      });
    }

    // invalidate mixlistPromise
    if( this.hasOwnProperty('mixlistPromise') ){
      this.mixlistPromise = null;
    }
    return this.contentPromise;
  }


  /**
   * @param {boolean} force - whether to force a call to the server instead of using the cached ownersPromise
   * @returns {Promise} - a promise that resolves to the owners for this MHCollection
   */
  fetchOwners(force=false){
    var path = this.subendpoint('owners'),
        ownersPromise = this.ownersPromise || null;

    if( force || ownersPromise === null ){
      ownersPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(response){
          return Promise.all(response.map(v => MHObject.fetchByMhid(v)));
        });

      if( this.hasOwnProperty('ownersPromise') ){
        this.ownersPromise = ownersPromise;
      } else {
        Object.defineProperty(this, 'ownersPromise', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: ownersPromise
        });
      }
    }

    return this.ownersPromise;
  }

  /**
   * @param {boolean} force - whether to force a call to the server instead of using the cached contentPromise
   * @returns {Promise} - a promise that resolves to the list of content for this MHCollection
   */
  fetchContent(force=false){
    var path = this.subendpoint('content'),
        contentPromise = this.contentPromise || null;

    if( force || contentPromise === null ){
      contentPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(response){
          return Promise.all(response.map(v => MHObject.fetchByMhid(v)));
        });

      if( this.hasOwnProperty('contentPromise') ){
        this.contentPromise = contentPromise;
      } else {
        Object.defineProperty(this, 'contentPromise', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: contentPromise
        });
      }
    }

    return this.contentPromise;
  }

  /**
   * @param {boolean} force - whether to force a call to the server instead of using the cached mixlistPromise
   * @returns {Promise} - a promise that resolves to the list of mixlist content for this MHCollection
   */
  fetchMixlist(force=false){
    var path = this.subendpoint('mixlist'),
        mixlistPromise = this.mixlistPromise || null;

    if( force || mixlistPromise === null ){
      mixlistPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(response){
          return Promise.all(response.map(v => MHObject.fetchByMhid(v)));
        });

      if( this.hasOwnProperty('mixlistPromise') ){
        this.mixlistPromise = mixlistPromise;
      } else {
        Object.defineProperty(this, 'mixlistPromise', {
          configurable: false,
          enumerable: true,
          writable: true,
          value: mixlistPromise
        });
      }
    }

    return this.mixlistPromise;
  }

  /**
   * @static
   * @returns {Promise} - a promise that resolves to the list of the featured collections
   */
  static fetchFeaturedCollections(){
    var path = MHCollection.rootEndpoint + '/featured';
    return houndRequest({
        method: 'GET',
        endpoint: path
      })
      .then(function(response){
        return Promise.all(response.map(v => MHObject.fetchByMhid(v)));
      });
  }

}

(function(){
  MHObject.registerConstructor(MHCollection);
})();

