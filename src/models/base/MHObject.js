
import { log, warn, error } from '../internal/debug-helpers.js';
import { jsonCreateWithArgs, jsonMergeWithArgs } from '../internal/jsonParse.js';

import { houndRequest } from '../../request/hound-request.js';

import { MHCache } from '../internal/MHCache.js';
import { MHMetadata } from '../meta/MHMetadata.js';
import { MHSocial } from '../social/MHSocial.js';

var MHPagedResponse = System.get('../container/MHPagedResponse.js');

var childrenConstructors = {};
var __cachedRootResponses = {};

// Create Cache
export var mhidLRU = new MHCache(1000);

if(typeof window !== 'undefined'){
  if( window.location.host === 'local.mediahound.com:2014' ){
    window.mhidLRU = mhidLRU;
  }
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
    jsonCreateWithArgs(args, this);

    this.cachedResponses = {};
  }

  get jsonProperties() {
    return {
      metadata: MHMetadata,
      primaryImage: { mapper: MHObject.create },
      secondaryImage: { mapper: MHObject.create },
      social: MHSocial
    };
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
   * MHObject.create(args)
   *
   * @param   { Object | JSON<String> | Array{Objects | JSON<Strings>} } - Array or, single Object or JSON of MediaHound Object definition(s).
   * @returns { <MHObject> } - Specific MediaHound Type. ex: MHMovie, MHAlbum, MHTrack, MHContributor, etc.
   *
   * returns null if can't find associated class
   */
  static create(args, saveToLRU=true){
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

      if(args.mhid && args.metadata === undefined) {
        args.metadata = {
          "mhid": args.mhid,
          "altId": args.altId,
          "name": args.name
        };
      }

      //log(args.metadata.mhid)
      var mhid = args.metadata.mhid || args.mhid || undefined;
      var mhObj;
      //console.log('at start of creating... ',mhid,args);

      if( mhid !== 'undefined' && mhid !== null && args instanceof Object){
        args.mhid = mhid;
        // check cache
        //log('in create function trying to parseArgs: \n\n' , args);

        if( mhidLRU.has(args.metadata.mhid) || mhidLRU.has(args.mhid) ){
          log('getting from cache in create: ' + args.metadata.mhid);
          var foundObject = mhidLRU.get(args.metadata.mhid);
          if (foundObject) {
            foundObject.mergeWithData(args);
          }
          return foundObject;
        }

        var prefix = MHObject.getPrefixFromMhid(mhid);
        log(prefix,new childrenConstructors[prefix](args));
        mhObj = new childrenConstructors[prefix](args);

        // if( prefix === 'mhimg' ){
        //   // bypass cache
        // } else {
        //   log('putting from create');
        //   mhidLRU.putMHObj(mhObj);
        // }
        //console.log('creating... ',prefix,': ', mhObj);
        if (saveToLRU) {
          mhidLRU.putMHObj(mhObj);
        }
        return mhObj;
      }
      else{
        mhObj = args;
        //log('creating without a prefix...', mhObj);
        return mhObj;
      }

    } catch (err) {
      //log(err);
      console.log(err);
      console.log(err.stack);
      if( err instanceof TypeError ) {
        if( err.message === 'undefined is not a function' ) {
          warn('Unknown mhid prefix, see args object: ', args);
        }
        if( err.message === 'Args was object without mhid!'){
          //warn('Incomplete Object passed to create function: ', args);
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
  static registerConstructor(mhClass, mhName){
    // Add class name if function.name is not native
    // if( mhClass.name === undefined ){
    //   mhClass.name = mhClass.toString().match(/function (MH[A-Za-z]*)\(args\)/)[1];
    //   log('shimmed mhClass.name to: ' + mhClass.name);
    // }
    mhClass.mhName = mhName;
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
      return childrenConstructors[pfx].mhName;
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
    return toCheck instanceof System.get('../../src/models/media/MHMedia.js').MHMedia;
  }

  static isContributor(toCheck){
    return toCheck instanceof System.get('../../src/models/contributor/MHContributor.js').MHContributor;
  }

  static isAction(toCheck){
    return toCheck instanceof System.get('../../src/models/action/MHAction.js').MHAction;
  }

  static isUser(toCheck){
    return toCheck instanceof System.get('../../src/models/user/MHUser.js').MHUser;
  }

  static isCollection(toCheck){
    return toCheck instanceof System.get('../../src/models/collection/MHCollection.js').MHCollection;
  }

  static isImage(toCheck){
    return toCheck instanceof System.get('../../src/models/image/MHImage.js').MHImage;
  }

  static isTrait(toCheck){
    return toCheck instanceof System.get('../../src/models/trait/MHTrait.js').MHTrait;
  }

  static isSource(toCheck){
    return toCheck instanceof System.get('../../src/models/source/MHSource.js').MHSource;
  }


  static isType(obj){
    var type = '';

    if( MHObject.isAction(obj) ){
      type = 'MHAction';
    }
    else if( MHObject.isMedia(obj) ){
      type = 'MHMedia';
    }
    else if( MHObject.isImage(obj) ){
      type = 'MHImage';
    }
    else if( MHObject.isCollection(obj) ){
      type = 'MHCollection';
    }
    else if( MHObject.isUser(obj) ){
      type = 'MHUser';
    }
    else if( MHObject.isContributor(obj) ){
      type = 'MHContributor';
    }
    else if( MHObject.isSource(obj) ){
      type = 'MHSource';
    }
    else if( MHObject.isTrait(obj) ){
      type = 'MHTrait';
    }
    else{
      type = null;
    }

    return type;
  }

  get type(){
    return MHObject.isType(this);
  }

  /**
   * This uses the function.name feature which is shimmed if it doesn't exist during the child constructor registration process.
   * @property {string} className - the string class name for this object, ie: MHUser, MHMovie, MHPost, etc.
   */
  get className(){
    return this.constructor.mhName;
  }

  /**
   * mhObj.isEqualToMHObject(otherObj)
   *
   * @param { <MHObject> }  - MediaHound Type to check against
   * @return { Boolean }    - True or False if mhids match
   *
   */
  isEqualToMHObject(otherObj){
    if( otherObj && otherObj.metadata.mhid ){
      return this.metadata.mhid === otherObj.metadata.mhid;
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
    return this.className + " with mhid " + this.metadata.mhid + " and name " + this.mhName;
  }

  mergeWithData(args) {
    jsonMergeWithArgs(args, this);
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

    log('in fetchByMhid, looking for: ', mhid, 'with view = ',view);

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

    //console.log('fetching:', mhClass.rootEndpoint + '/' + mhid);

    return houndRequest({
        method: 'GET',
        endpoint: mhClass.rootEndpoint + '/' + mhid,
        params:{
          view: view
        }
      })
      .then(function(response){
        newObj = MHObject.create(response);
        return newObj;
      });
  }

  /**
   * Children override
   *
   */
  static get rootEndpoint() { return null; }

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
    return this.constructor.rootEndpoint + '/' + this.metadata.mhid;
  }

  /**
   * mhObj.subendpoint(sub)
   *
   * @param   { String } - subendpoint to be added onto this.endpoint
   * @returns { String } - example with ('like'): 'graph/media/mhmov1000009260/like'
   *
   */
  subendpoint(sub){
    if( typeof sub !== 'string' && !(sub instanceof String) ){
      throw new TypeError('Sub not of type string or undefined in (MHObject).subendpoint.');
    }
    return this.endpoint + '/' + sub;
  }

  static rootSubendpoint(sub) {
    if( typeof sub !== 'string' && !(sub instanceof String) ){
      throw new TypeError('Sub not of type string or undefined in (MHObject).rootSubendpoint.');
    }
    return this.rootEndpoint + '/' + sub;
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
      .then( (parsed => this.social = new MHSocial(parsed)).bind(this) )
      .catch(function(err){
        console.warn('fetchSocial:',err);
      });
  }

  /** TODO: Move to Objects that actually use it, i.e. not MHAction
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
  fetchFeed(view='full', size=12, force=false){
    var path = this.subendpoint('feed');
    return this.fetchPagedEndpoint(path, view, size, force);
  }

  /* TODO: DocJS
  * mhMed.fetchImages()
  *
  * @param force { Boolean } - force refetch of content
  * @return { Promise } - resolves to
  *
  */

  fetchImages(view='full', size=20, force=false){
    var path = this.subendpoint('images');
    return this.fetchPagedEndpoint(path, view, size, force);
  }

  /*
   * mhContributor.fetchCollections(force)
   *
   * @return { Promise }  - resolves to server response of collections for this MediaHound object
   *
   */
   fetchCollections(view='full', size=12, force=true){
     var path = this.subendpoint('collections');
     return this.fetchPagedEndpoint(path, view, size, force);
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
        var newSocial = new MHSocial(socialRes.social);

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

  responseCacheKeyForPath(path) {
    return "__cached_" + path;
  }

  cachedResponseForPath(path) {
    var cacheKey = this.responseCacheKeyForPath(path);
    return this.cachedResponses[cacheKey];
  }

  setCachedResponse(response, path) {
    var cacheKey = this.responseCacheKeyForPath(path);
    this.cachedResponses[cacheKey] = response;
  }

  static rootResponseCacheKeyForPath(path) {
    return "___root_cached_" + path;
  }

  static cachedRootResponseForPath(path) {
    var cacheKey = this.rootResponseCacheKeyForPath(path);
    return __cachedRootResponses[cacheKey];
  }

  static setCachedRootResponse(response, path) {
    var cacheKey = this.rootResponseCacheKeyForPath(path);
    __cachedRootResponses[cacheKey] = response;
  }

  fetchPagedEndpoint(path, view, size, force, next=null) {
    if (!force && !next) {
      var cached = this.cachedResponseForPath(path);
      if (cached) {
        return cached;
      }
    }

    var promise;

    if (next) {
      promise = houndRequest({
        method: 'GET',
        url: next,
      });
    }
    else {
      promise = houndRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: {
          view: view
        }
      });
    }

    promise.then(function(response) {
      var pagedResponse = new MHPagedResponse(response);

      pagedResponse.fetchNextOperation = (newNext => {
        return this.fetchPagedEndpoint(path, view, size, force, newNext);
      });

      return pagedResponse;
    });

    if (!next) {
      this.setCachedResponse(promise, path);
    }

    return promise;
  }

  static fetchRootPagedEndpoint(path, params, view, size, force, next=null) {
    if (!force && !next) {
      var cached = this.cachedRootResponseForPath(path);
      if (cached) {
        return cached;
      }
    }

    var promise;
    if (next) {
      promise = houndRequest({
        method: 'GET',
        url: next,
      });
    }
    else {
      params.view = view;

      promise = houndRequest({
        method  : 'GET',
        endpoint: path,
        pageSize: size,
        params: params
      });
    }

    promise.then(function(response) {
      var pagedResponse = new MHPagedResponse(response);

      pagedResponse.fetchNextOperation = (newNext => {
        return this.fetchRootPagedEndpoint(path, params, view, size, force, newNext);
      });

      return pagedResponse;
    });

    if (!next) {
      this.setCachedRootResponse(promise, path);
    }

    return promise;
  }
}
