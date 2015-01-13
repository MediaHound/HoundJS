
import { log, warn, error } from '../internal/debug-helpers';

// Import Deps
import { houndRequest } from '../../request/hound-request';
import { pagedRequest } from '../../request/hound-paged-request';

import { MHCache } from '../internal/MHCache';
import { MHMetaData } from '../meta/MHMetaData';
import { MHSocial } from '../social/MHSocial';

var childrenConstructors = {};

// Create Cache
export var mhidLRU = new MHCache(1000);
if( window.location.host === 'local.mediahound.com:2014' ){
  window.mhidLRU = mhidLRU;
}

// Symbols for Element hiding
var lastSocialRequestIdSym = Symbol('lastSocialRequestId'),
    socialSym = Symbol('social');

// TODO: editable primary and secondary image properties using Symbols

// Base MediaHound Object
export class MHObject {
  /** MHObject Constructor
   *  @constructor
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *  Optional Param Props
   *      name            - { String }
   *      altId           - { String }
   *      primaryImage    - { MHImage }
   *      secondaryImage  - { MHImage }
   *      createdDate     - { Date }
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);

    if( typeof args.metadata.mhid === 'undefined' || args.metadata.mhid === null ){
      throw new TypeError('mhid is null or undefined', 'MHObject.js', 89);
    }

    var metadata        = new MHMetaData(args.metadata) || null,
        mhid            = args.metadata.mhid || null,
        altId           = args.metadata.altId || null,
        name            = args.metadata.name || null,
        // Optional (nullable) values
        primaryImage    = (args.primaryImage != null)   ? MHObject.create(args.primaryImage)    : null,
        secondaryImage  = (args.secondaryImage != null) ? MHObject.create(args.secondaryImage)  : null,
        social          = args.social || null,
        createdDate     = new Date(args.metadata.createdDate);

    // if invalid date reset to original value or null
    if( isNaN(createdDate) ){
      createdDate = args.metadata.createdDate || null;
    }
    if(social !==null){
      social = new MHSocial(args.social);
    }

    // Create imutable properties
    //  mhid, name, primaryImage, createdDate, etc...
    Object.defineProperties(this, {
      'mhid':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        mhid
      },
      'altId':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        altId
      },
      'name':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        name
      },
      'metadata':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        metadata
      },
      'primaryImage':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        primaryImage
      },
      'secondaryImage':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        secondaryImage
      },
      'social':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        social
      },
      // Promises
      'feedPagedRequest':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  /** @property {MHSocial} social */
  get social(){
    return this[socialSym] || null;
  }
  set social(newSocial){
    if( newSocial instanceof MHSocial ){
      this[socialSym] = newSocial;
    }
    return this.social;
  }

  /**
   * TODO: PRIVATE?
   * MHObject.parseArgs(args)
   * Parses Constructor Arguments
   *
   * @param  { Object | JSON } - JSON or Argument Map for MediaHound Type object creation.
   * @return { Object }        - Object map of arguments for MediaHound Type creation.
   *
   */
  static parseArgs(args){
    var type = typeof args;

    // If object with mhid return
    if( type === 'object' && !(args instanceof String) && args.metadata.mhid ){
      return args;
    }
    // if type string, parse
    if( type === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
        return args;
      } catch(e) {
        error('JSON.parse failed at MHObject.parseArgs:170. Exception to follow.');
        throw e;
      }
    }
    // if undefined or null throw TypeError
    if( type === 'undefined' || args === null ){
      throw new TypeError('Args is undefined!', 'MHObject.js', 176);
    }
    // if type Array, throw TypeError
    if ( args instanceof Array ){
      throw new TypeError('MHObject arguments cannot be of type Array. Must be JSON String or Object of named parameters.', 'MHObject.js', 180);
    }
    // if type error, rethrow
    if( args instanceof Error || args.Error || args.error ){
      throw (args.error || args.Error || args);
    }
    // Shound never get here
    //warn('how did you do that? args: ', args);
    throw new TypeError('Args was object without mhid!', 'MHObject.js', 189);
  }

  /**
   * MHObject.create(args)
   *
   * @param   { Object | JSON<String> | Array{Objects | JSON<Strings>} } - Array or, single Object or JSON of MediaHound Object definition(s).
   * @returns { <MHObject> } - Specific MediaHound Type. ex: MHMovie, MHAlbum, MHSong, MHContributor, etc.
   *
   * returns null if can't find associated class
   */
  static create(args){
    if( args instanceof Array ){
      log('trying to create MHObject that is new: ' + args);
      //return args.map(MHObject.create); // <-- should probably be this once all MHObjs are done
      return args.map(function(value){
        try{
          return MHObject.create(value);
        } catch(e) {
          error(e);
          return value;
        }
      });
    }
    try{

      args = MHObject.parseArgs(args);
      //log(args.metadata.mhid)
      var mhid = args.metadata.mhid || undefined;
      var mhObj;

      //log('at start of creating... ',mhid,args);

      if( mhid !== 'undefined' && mhid !== null){
        args.mhid = mhid;
        // check cache
        //log('in create function trying to parseArgs: \n\n' , args);

        // if( mhidLRU.has(args.metadata.mhid) ){
        //   log('getting from cache in create: ' + args.metadata.mhid);
        //   return mhidLRU.get(args.metadata.mhid);
        // }

        var prefix = MHObject.getPrefixFromMhid(mhid);
        log(prefix,new childrenConstructors[prefix](args));
        mhObj = new childrenConstructors[prefix](args);



        // if( prefix === 'mhimg' ){
        //   // bypass cache
        // } else {
        //   log('putting from create');
        //   mhidLRU.putMHObj(mhObj);
        // }
        //log('creating... ',prefix,': ', mhObj);
        return mhObj;
      }
      else{
        mhObj = args;
        //log('creating without a prefix...', mhObj);
        return mhObj;
      }
    } catch (err) {
      //log(err);
      if( err instanceof TypeError ) {
        if( err.message === 'undefined is not a function' ) {
          warn('Unknown mhid prefix, see args object: ', args);
        }
        if( err.message === 'Args was object without mhid!'){
          warn('Incomplete Object passed to create function: ', args);
        }
      }
      //error(err.stack); // turning off this error because it is really annoying!
      return null;
    }
    return null;
  }

  /***
   * Register Child Constructors
   *
   * MHObject.registerConstructor(mhClass)
   *
   * @param  { Function } mhClass - MediaHound Object constructor to be used within MHObject.create and other methods
   * @return { Boolean }                - Success(true) or Fail(false)
   *
   */
  static registerConstructor(mhClass){
    // Add class name if function.name is not native
    if( mhClass.name === undefined ){
      mhClass.name = mhClass.toString().match(/function (MH[A-Za-z]*)\(args\)/)[1];
      log('shimmed mhClass.name to: ' + mhClass.name);
    }
    //log('registering constructor: ' + mhClass.name);

    var prefix = mhClass.mhidPrefix;
    if( typeof prefix !== 'undefined' && prefix !== null && !(prefix in childrenConstructors) ){
      Object.defineProperty(childrenConstructors, prefix, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mhClass
      });
      return true;
    }
    return false;
  }

  /**
   * MHObject.prefixes
   *
   * @return { Array } - A list of MediaHound ID prefixes
   *
   * Note: This list contains only prefixes of types known to the MHObject.create method
   */
  // List of prefixes known to MHObject through registerConstructor
  static get prefixes(){
    return Object.keys(childrenConstructors);
  }

  /**
   * MHObject.getPrefixFromMhid(mhid)
   *
   * @param  { String } mhid - a valid MediaHound ID
   * @return { String } - a valid MediaHound ID prefix
   *
   */
  static getPrefixFromMhid(mhid){
    for( var pfx in childrenConstructors ){
      if( childrenConstructors.hasOwnProperty(pfx) && (new RegExp('^' + pfx)).test(mhid) ){
        return pfx;
      }
    }
    return null;
  }

  /**
   * MHObject.getClassNameFromMhid(mhid)
   *
   * @param  { String } mhid - a valid MediaHound ID
   * @return { String } - the class name associated with the prefix
   *
   */
  static getClassNameFromMhid(mhid){
    var pfx = MHObject.getPrefixFromMhid(mhid);
    if( childrenConstructors[pfx] ){
      return childrenConstructors[pfx].name;
    }
    return null;
  }

  /**
   * mhObj.mhidPrefix
   *
   * @return { String } - the MediaHound ID prefix associated with this MHObject.
   *
   * Note: Override at child level
   */
  static get mhidPrefix(){
    return null;
  }

  // Type Checking
  // TODO: Update these checks for cross site scripting cases
  // case:
  //    instanceof only works if the object being checked was created
  //    in the same global scope as the constructor function it is being checked against
  static isMedia(toCheck){
    return toCheck instanceof System.get('../../src/models/media/MHMedia').MHMedia;
  }
  get isMedia(){
    return MHObject.isMedia(this);
  }

  static isContributor(toCheck){
    return toCheck instanceof System.get('../../src/models/contributor/MHContributor').MHContributor;
  }
  get isContributor(){
    return MHObject.isContributor(this);
  }

  static isAction(toCheck){
    return toCheck instanceof System.get('../../src/models/action/MHAction').MHAction;
  }
  get isAction(){
    return MHObject.isAction(this);
  }

  static isUser(toCheck){
    return toCheck instanceof System.get('../../src/models/user/MHUser').MHUser;
  }
  get isUser(){
    return MHObject.isUser(this);
  }

  static isCollection(toCheck){
    return toCheck instanceof System.get('../../src/models/collection/MHCollection').MHCollection;
  }
  get isCollection(){
    return MHObject.isCollection(this);
  }

  static isImage(toCheck){
    return toCheck instanceof System.get('../../src/models/image/MHImage').MHImage;
  }
  get isImage(){
    return MHObject.isImage(this);
  }

  static isTrait(toCheck){
    return toCheck instanceof System.get('../../src/models/trait/MHTrait').MHTrait;
  }
  get isTrait(){
    return MHObject.isTrait(this);
  }

  /**
   * This uses the function.name feature which is shimmed if it doesn't exist during the child constructor registration process.
   * @property {string} className - the string class name for this object, ie: MHUser, MHMovie, MHPost, etc.
   */
  get className(){
    return this.constructor.name;
  }

  /**
   * mhObj.isEqualToMHObject(otherObj)
   *
   * @param { <MHObject> }  - MediaHound Type to check against
   * @return { Boolean }    - True or False if mhids match
   *
   */
  isEqualToMHObject(otherObj){
    if( otherObj && otherObj.mhid ){
      return this.metadata.mhid === otherObj.mhid;
    }
    return false;
  }
  // TODO Add deep equality check?
  // might be useful for checking for changes in cache'd objects

  /**
   * mhObj.hasMhid(mhid)
   *
   * @param {string} mhid - a string mhid to check against this object
   * @returns {boolean}
   */
  hasMhid(mhid){
    if( typeof mhid === 'string' || mhid instanceof String ){
      return this.metadata.mhid === mhid;
    }
    return false;
  }

  // TODO Could change as needed
  toString(){
    return this.className + " with mhid " + this.mhid + " and name " + this.name;
  }

  /**
   * MHObject.fetchByMhid(mhid)
   *
   * @param   { String        } mhid  - valid MediaHound ID
   * @param   { String        } view  - set to basic, basic_social, extended, extended_social, full, defaults to basic.
   * @param   { boolean=false } force - set to true to re-request for the given mhid
   * @return  { Promise       } - resloves to specific MHObject sub class
   *
   */
  static fetchByMhid(mhid, view='full', force=false){

    if( typeof mhid !== 'string' && !(mhid instanceof String) ){
      throw TypeError('MHObject.fetchByMhid argument must be type string.');
    }

    if(view === null || view === undefined) {
      view = 'full';
    }

    //log('in fetchByMhid, looking for: ', mhid, 'with view = ',view);

    // Check LRU for mhid
    if( !force && mhidLRU.has(mhid) ){
      return Promise.resolve(mhidLRU.get(mhid));
    }
    // Check LRU for altId
    if( !force && mhidLRU.hasAltId(mhid) ){
      return Promise.resolve(mhidLRU.getByAltId(mhid));
    }

    var prefix  = MHObject.getPrefixFromMhid(mhid),
        mhClass = childrenConstructors[prefix],
        newObj;

    if( prefix === null || typeof mhClass === 'undefined' ){
      warn('Error in MHObject.fetchByMhid', mhid, prefix, mhClass);
      throw Error('Could not find correct class, unknown mhid: ' + mhid);
    }

    return houndRequest({
        method: 'GET',
        endpoint: mhClass.rootEndpoint + '/' + mhid + '?view=' + view
      })
      .then(function(response){
        newObj = MHObject.create(response);
        //newObj = response;
        log('fetched: ', newObj, 'with response: ', response);
        // if( prefix === 'mhimg' ){
        //   // bypass cache
        // } else {
        //   mhidLRU.putMHObj(newObj);
        // }
        return newObj;
      });
  }

  /**
   * MHObject.fetchByMhids(mhids)
   *
   * @param   { [String]  } mhids - array of MediaHound IDs
   * @return  { [Promise] } - array of Promises that resolve to specific MHObject sub classes
   *
   */
  // Should this return a single Promise?
  //  Could be done through a second flag argument
    static fetchByMhids(mhids,view="basic"){
    if( mhids.map ){
      return mhids.map(MHObject.fetchByMhid);
    } else if( mhids.length > 0 ){
      var i, mhObjs = [];
      for( i = 0 ; i < mhids.length ; i++ ){
        //log(mhids[i],view);
        mhObjs.push(MHObject.fetchByMhid(mhids[i],view));
      }
      return mhObjs;
    }
    warn('Reached fallback return statement in MHObject.fetchByMhids', mhids);
    return mhids || null;
  }

  /**
   * Children override
   *
   */
  static get rootEndpoint(){ return null; }

  /**
   * MHObject.rootEndpointForMhid(mhid)
   *
   * @param   { String } mhid - a valid MediaHound ID
   * @return  { String } - the endpoint for MediaHound Type of mhid
   *
   */
  static rootEndpointForMhid(mhid){
    if( typeof mhid !== 'string' && !(mhid instanceof String) ){
      throw new TypeError('Mhid not of type string or undefined in rootEndpointForMhid');
    }

    var prefix  = MHObject.getPrefixFromMhid(mhid),
        mhClass = childrenConstructors[prefix];

    if( prefix === null || typeof mhClass === 'undefined' ){
      warn('Error in MHObject.rootEndpointForMhid', mhid, prefix, mhClass);
      throw new Error('Could not find correct class, unknown mhid: ' + mhid);
    }

    return mhClass.rootEndpoint;
  }

  /**
   * mhObj.endpoint
   *
   * @return { String } - ex: 'graph/media/mhmov1000009260'
   *
   */
  get endpoint(){
    return this.constructor.rootEndpoint + '/' + this.mhid;
  }

  /**
   * mhObj.subendpoint(sub)
   *
   * @param   { String } - subendpoint to be added onto this.endpoint
   * @returns { String } - example with ('like'): 'graph/media/mhmov1000009260/like'
   *
   */
  subendpoint(sub){
    //log(typeof sub);
    if( typeof sub !== 'string' && !(sub instanceof String) ){
      throw new TypeError('Sub not of type string or undefined in (MHObject).subendpoint.');
    }
    return this.endpoint + '/' + sub;
  }

  /**
   * mhObj.fetchSocial()
   * Calls server for new social stats
   * @param {boolean} force - Forces an http request if set to true
   * @return  { Promise }  - Resolves to Social stats as returned by the server
   *
   */
  fetchSocial(force=false){
    var path = this.subendpoint('social');

    if( !force && this.social instanceof MHSocial ){
      return Promise.resolve(this.social);
    }
    return houndRequest({
        method: 'GET',
        endpoint: path
      })
      .then( (parsed => this.social = new MHSocial(parsed)).bind(this) );
  }

  /**
   * mhObj.fetchFeed(view, page, size)
   *
   * @param { string=full   } view - the view param
   * @param { number=0      } page - the zero indexed page number to return
   * @param { number=12     } size  - the number of items to return per page
   * @param { Boolean=false } force
   *
   * @return { houndPagedRequest }  - MediaHound paged request object for this feed
   *
   */
  fetchFeed(view='full', page=0, size=12, force=false){
    var path = this.subendpoint('feed');
    if( force || this.feedPagedRequest === null || this.feedPagedRequest.numberOfElements !== size ){
      this.feedPagedRequest = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        startingPage: page,
        params: { view }
      });
    } else if( this.feedPagedRequest.page !== page ){
      this.feedPagedRequest.jumpTo(page);
    }
    //console.log(this.feedPagedRequest);
    return this.feedPagedRequest;
  }

  /** TODO: TEST
   * TODO: set defaults to those on possible existing feedPagedRequest
   * mhObj.fetchFeedPage(view, page, size)
   *
   * @param page { Number (0)  } - the zero indexed page number to return
   * @param size { Number (12) } - the number of items to return per page
   *
   * @return { Promise }  - resolves to server response of feed info for this MediaHound object
   *
   */
  fetchFeedPage(view='full', page=0, size=12, force=false){
    return this.fetchFeed(view, page, size, force).currentPromise;
  }

  /**
   *
   * mhObj.takeAction(action)
   *
   * @param   { string } action - The action to take, should be accessed from MHSocial.LIKE, MHSocial.FOLLOW, etc.
   *
   * @return  { Promise } - resolves to server response of action call
   *
   */
  takeAction(action){
    if( typeof action !== 'string' && !(action instanceof String) ){
      throw new TypeError('Action not of type String or undefined');
    }
    if( !MHSocial.SOCIAL_ACTIONS.some( a => action === a ) ){
      throw new TypeError('Action is not of an accepted type in mhObj.takeAction');
    }

    log(`in takeAction, action: ${action}, obj: ${this.toString()}`);

    var path      = this.subendpoint(action),
        requestId = Math.random(),
        original  = this.social,
        self      = this;

    // Expected outcome
    if( this.social instanceof MHSocial ){
      this.social = this.social.newWithAction(action);
    }

    // Save request id to check against later
    this[lastSocialRequestIdSym] = requestId;

    // Return promise to new Social as returned from the server
    return houndRequest({
        method: 'PUT',
        endpoint: path
      })
      .then(socialRes => {
        var newSocial = new MHSocial(socialRes);

        // only update if this is the last request returning
        if( this[lastSocialRequestIdSym] === requestId ){
          self.social = newSocial;
        }

        //log('in take action response, newSocial: ', newSocial);
        return newSocial;
      })
      .catch(err => {
        if( this[lastSocialRequestIdSym] === requestId ){
          self.social = original;
        }
        throw err;
      });
  }
}
