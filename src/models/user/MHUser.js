/*global File */

import { log } from '../internal/debug-helpers.js';

import { MHObject, mhidLRU } from '../base/MHObject.js';
import { MHLoginSession } from './MHLoginSession.js';

import { houndRequest } from '../../request/hound-request.js';
import { pagedRequest } from '../../request/hound-paged-request.js';

// MediaHound User Object
export class MHUser extends MHObject {
  /* MHUser Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   * Inherited From MHObject
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *    Optional Param Props
   *      name            - { String }
   *      primaryImage    - { MHImage }
   *      createdDate     - { String | Date }
   *
   * MHUser Param Props
   *    Required
   *      username        - { String }
   *
   *    Optional
   *      email           - { String<Email> }
   *      phonenumber     - { String<phone> | Number? }
   *      firstName       - { String }
   *      lastName        - { String }
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    if( typeof args.username === 'undefined' || args.username === null ){
      throw new TypeError('Username is null or undefined', 'MHUser.js', 39);
    }
    // Call Super Constructor
    super(args);

    // Default MHUser unique non-required objects to null
    var username    = args.username,
        email       = args.email        || null,
        phonenumber = args.phonenumber  || args.phoneNumber || null,
        firstname   = args.firstname    || args.firstName   || null,
        lastname    = args.lastname     || args.lastName    || null;

    // Create imutable properties
    //  username, email, phonenumber, firstname, lastname
    Object.defineProperties(this, {
      'username':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        username
      },
      'email':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        email
      },
      'phonenumber':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        phonenumber
      },
      'firstName':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        firstname
      },
      'lastName':{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        lastname
      },
      // Promises
      'interestFeedPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'ownedCollectionsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'followedPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'followedCollectionsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  static get mhidPrefix() { return 'mhusr'; }
  get displayableType()   { return 'User';  }

  get isCurrentUser(){
    return this.isEqualToMHObject(MHLoginSession.currentUser);
  }

  /**
   * MHUser.rootEndpoint
   *
   * @static
   * @property
   * @return { String } - the endpoint for User info, ex: 'graph/user'
   *
   */
  static get rootEndpoint(){ return 'graph/user'; }

  /*
   * Register New User on MediaHound
   *  Required Params
   *    username          { String }
   *    password          { String }
   *    email             { String }
   *    firstName         { String }
   *    lastName          { String }
   *
   *  Optional Params
   *    role              { Integer }
   *    phoneNumber       { String }
   *    description       { String }
   *    onboarded         { boolean}
   *    facebookToken     { String }
   *    spotifyToken      { String }
   *    spotifyUsername   { String }
   *    rdioToken         { String }
   *    rdioAccessToken   { String }
   *
   * Returns Promise that resolves to a MHUser object.
   *
   */
  static registerNewUser(username, password, email, firstName, lastName, optional){
    var path = MHUser.rootEndpoint + '/new',
        data = (optional && typeof optional === 'object' && !(optional instanceof Array || optional instanceof String)) ? optional : {},
        notString = function(obj){
          return ( typeof obj !== 'string' && !(obj instanceof String) );
        };

    // Check for required params
    if( notString(username) ){
      throw new TypeError('Username not of type string in MHUser.registerNewUser');
    }

    if( notString(password) ){
      throw new TypeError('Password not of type string in MHUser.registerNewUser');
    }

    if( notString(email) ){
      throw new TypeError('Email not of type string in MHUser.registerNewUser');
    }

    if( notString(firstName) ){
      throw new TypeError('First name not of type string in MHUser.registerNewUser');
    }

    if( notString(lastName) ){
      throw new TypeError('Last name not of type string in MHUser.registerNewUser');
    }

    data.username   = username;
    data.password   = password;
    data.email      = email;
    data.firstName  = firstName;
    data.lastName   = lastName;

    // TODO: call validate username and email before register?
    return houndRequest({
        method          : 'POST',
        endpoint        : path,
        'data'          : data,
        withCredentials : true,
        headers: {
          //'Accept':'application/json',
          //'Content-Type':'application/json'
        }
      })
      .then(function(parsed){
        return MHObject.fetchByMhid(parsed.mhid);
      });
      /*
      .catch(function(error){
        console.error('Error on MHUser.registerNewUser: ', error);
        throw new Error('Problem registring new User');
      });
      */
  }

  /** TODO: refactor after new auth system
   *
   */
  static validateUsername(username){
    if( !username || (typeof username !== 'string' && !(username instanceof String)) ){
      throw new TypeError('Username must be type string in MHUser.validateUsername');
    }
    var path = MHUser.rootEndpoint + '/validate/' + encodeURIComponent(username);

    // returns 200 for acceptable user name
    // returns 406 for taken user name
    return houndRequest({
        method: 'GET',
        endpoint: path
      })
      .then(function(response){
        //console.log('valid username response: ', response, response === 200);
        return response === 200;
      })
      .catch(function(error){
        if( error.xhr.status === 406 ){
          console.error('The username ' + username + ' is already taken.');
        } else {
          console.log('error in validate username: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
  }

  /** TODO: refactor after new auth system
   *
   */
  static validateEmail(email){
    if( !email || (typeof email !== 'string' && !(email instanceof String)) ){
      throw new TypeError('Email must be type string in MHUser.validateEmail');
    }
    var path = MHUser.rootEndpoint + '/validate/email/' + encodeURIComponent(email);

    // returns 200 for acceptable user name
    // returns 406 for taken user name
    return houndRequest({
        method: 'GET',
        endpoint: path
      })
      .then(function(response){
        //console.log('valid email response: ', response);
        return response === 200;
      })
      .catch(function(error){
        if( error.xhr.status === 406 ){
          console.error('The email ' + email + ' is already registered.');
        } else {
          console.log('error in validate username: ', error.error.message);
          console.error(error.error.stack);
        }
        return false;
      });
  }

  /* TODO: docJS
   *
   * mhUsr.setProfileImage(image);
   *
  */
  setProfileImage(image){
    log('in setProfileImage with image: ', image);
    if( !image ){
      throw new TypeError('No Image passed to setProfileImage');
      //return Promise.resolve(null);
    }
    if( !(image instanceof File) ){
      throw new TypeError('Image was not of type File');
    }

    // If not current user throw error
    if( !this.isCurrentUser ){
      //throw new NoMHSessionError('No valid user session. Please log in to change profile picture');
      throw (function(){
        var NoMHSessionError = function(message){
          this.name = 'NoMHSessionError';
          this.message = message || '';
        };
        NoMHSessionError.prototype = Object.create(Error.prototype);
        NoMHSessionError.constructor = NoMHSessionError;
        return new NoMHSessionError('No valid user session. Please log in to change profile picture');
      })();
    }

    var path = MHUser.rootEndpoint + '/uploadImage',
        form = new FormData();

    form.append('data', image);

    //console.log('image: ', image, 'form: ', form);

    // send form or file?
    return houndRequest({
        method          : 'POST',
        endpoint        : path,
        withCredentials : true,
        data            : form
      })
      .then(function(userWithImage){
        MHLoginSession.updatedProfileImage(MHObject.create(userWithImage));
        return userWithImage;
      });
  }

  /**
   * TODO should this be static?
   * Update single profile value
   * @param key
   * @param value
   * @returns {Promise}
   */
  updateProfile(key, value){
    var data = {};
    data[key] = value;
    return this.updateProfileData(data);
  }

  /**
   * TODO updateCurrent user in MHLoginSession, test
   * TODO should this be static?
   * @param updates
   * @returns {Promise}
   */
  updateProfileData(updates){
    if( updates == null || typeof updates === 'string' || Array.isArray(updates) ){
      throw new TypeError('Update profile data parameter must be of type object');
    }
    var path = MHUser.rootEndpoint + '/update';

    return houndRequest({
        method          : 'POST',
        endpoint        : path,
        withCredentials : true,
        data            : updates
      })
      .catch(function(err){
        console.log('error on profile update: ', err);
        throw err;
      });
  }

  /**
   * MHUser.fetchByUsername(username)
   *
   * @param { String } username - Username to fetch info for
   * @param { boolean} force - force fetch to server
   *
   * @return { Promise } - resolves to the MHUser object
   *
   */
  static fetchByUsername(username, force=false){
    if( !username || (typeof username !== 'string' && !(username instanceof String)) ){
      throw new TypeError('Username not of type String in fetchByUsername');
    }
    if( MHObject.getPrefixFromMhid(username) != null ){
      throw new TypeError('Passed mhid to fetchByUsername, please use MHObject.fetchByMhid for this request.');
    }

    log('in fetchByUsername, looking for: ' + username);

    // Check LRU for altId === username
    if( !force && mhidLRU.hasAltId(username) ){
      return Promise.resolve(mhidLRU.getByAltId(username));
    }

    var path = MHUser.rootEndpoint + '/lookup/' + username;
    return houndRequest({
        method          : 'GET',
        endpoint        : path,
        withCredentials : true
      })
      .then(function(response){
        var mhUsr = new MHUser(response);
        mhidLRU.putMHObj(mhUsr);
        return mhUsr;
      });
  }

  /*
   * MHUser.fetchFeaturedUsers()
   *
   * @return { Promise } - resloves to an array of featured users of type MHUser
   *
   */
  static fetchFeaturedUsers(){
    var path = MHUser.rootEndpoint + '/featured';
    return houndRequest({
        method  : 'GET',
        endpoint: path
      })
      .then(function(response){
        return Promise.all(MHObject.fetchByMhids(response));
      });
  }

  /* TODO: add local cache
   * mhUsr.fetchInterestFeed(view, page, size)
   *
   * @param view { String } - the view type query parameter
   * @param page { Number } - the page number query parameter
   * @param size { Number } - the number of items per page
   *
   * @return { pagedRequest } - resolves to paged response from server, res.content contains array of data
   *
   */
  fetchInterestFeed(view='full', page=0, size=12, force=false){
    var path = this.subendpoint('interestFeed');

    if( force || this.interestFeedPromise === null ){
      this.interestFeedPromise = pagedRequest({
          method          : 'GET',
          endpoint        : path,
          withCredentials : true, //?
          startingPage    : page,
          pageSize        : size,
          params: {
            'view':view
          }
        });
    }

    return this.interestFeedPromise;
  }

  /* TODO: remove console.log debug stuffs
   * mhUsr.fetchOwnedCollections()
   *
   * @return { Promise }
   *
   */
  fetchOwnedCollections(force=false){
    var path = this.subendpoint('ownedCollections');

    if( force || this.ownedCollectionsPromise === null ){
      //console.log('force: '+force, 'ownedCollectionsPromise: ', ownedCollectionsPromise);
      this.ownedCollectionsPromise = houndRequest({
        method          : 'GET',
        endpoint        : path,
        withCredentials : true
      });
    }

    return this.ownedCollectionsPromise;
  }


  /**
   *
   * @param force {boolean=false}
   * @returns {Promise}
   */
  fetchFollowed(force=false){
    var path = this.subendpoint('following');

    if( force || this.followedPromise === null ){
      this.followedPromise = houndRequest({
          method          : 'GET',
          endpoint        : path,
          withCredentials : true
        });
    }

    return this.followedPromise;
  }

  /* TODO: remove console.log debug stuffs
   * mhUsr.fetchFollowedCollections()
   *
   * @return { Promise }
   *
   */
  fetchFollowedCollections(force=false){
    var path = this.subendpoint('following');

    if( force || this.followedCollectionsPromise === null ){
      //console.log('force: '+force, 'followedCollectionsPromise: ', followedCollectionsPromise);
      this.followedCollectionsPromise = houndRequest({
        method          : 'GET',
        endpoint        : path,
        withCredentials : true,
        params : {
          type : 'collection'
        }
      });
    }

    return this.followedCollectionsPromise;
  }

  // Could change as needed
  toString(){
    return super.toString() + ' and username ' + this.username;
  }
}

(function(){
  MHObject.registerConstructor(MHUser);
})();

