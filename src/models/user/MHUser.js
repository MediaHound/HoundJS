/*global System, Blob, File */

import { log } from '../internal/debug-helpers';

import { MHObject, mhidLRU } from '../base/MHObject';
import { MHRelationalPair } from '../base/MHRelationalPair';

import { houndRequest } from '../../request/hound-request';
import { pagedRequest } from '../../request/hound-paged-request';

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
  *      metadata.mhid    - { MediaHound ID string }
  *
  *    Optional Param Props
  *      metadata.name   - { String }
  *      primaryImage    - { MHImage }
  *      metadata.createdDate     - { String | Date }
  *
  * MHUser Param Props
  *    Required
  *      metadata.username        - { String }
  *
  *    Optional
  *      metadata.email           - { String<Email> }
  *      metadata.phonenumber     - { String<phone> | Number? }
  *      metadata.firstName       - { String }
  *      metadata.lastName        - { String }
  *
  */
  constructor(args) {
    args = MHObject.parseArgs(args);

    if( typeof args.metadata.username === 'undefined' || args.metadata.username === null ){
      throw new TypeError('Username is null or undefined', 'MHUser.js', 39);
    }
    // Call Super Constructor
    super(args);

    // Default MHUser unique non-required objects to null
    var username = args.metadata.username,
    email       = args.metadata.email        || null,
    firstname   = args.metadata.firstname    || args.metadata.firstName   || null,
    lastname    = args.metadata.lastname     || args.metadata.lastName    || null;

    if(firstname == null || lastname == null){

      var regex = new RegExp('((?:[a-z][a-z]+))(\\s+)((?:[a-z][a-z]+))',["i"]);
      var test = regex.exec(args.metadata.name);
      if(test != null){
        firstname = test[1];
        lastname = test[3];
      }

    }
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
      'interestFeed':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'ownedCollections':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'followed':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      },
      'suggested':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  static get mhidPrefix() { return 'mhusr'; }

  get isCurrentUser(){
    var currentUser = System.get('../../src/models/user/MHLoginSession').MHLoginSession.currentUser;
    //console.warn('circular dep: (currentUser) ', currentUser);
    return this.isEqualToMHObject(currentUser);
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
      return MHObject.fetchByMhid(parsed.metadata.mhid);
    });
    /*
    .catch(function(error){
    console.error('Error on MHUser.registerNewUser: ', error);
    throw new Error('Problem registring new User');
  });
  */
}

/**
* fetchSettings(mhid)
* @param mhid
* Fetches the settings for the current logged in user.
*/
static fetchSettings(mhid){
  if( !mhid || (typeof mhid !== 'string' && !(mhid instanceof String)) ){
    throw new TypeError('mhid must be type string in MHUser.fetchSettings');
  }
  var path = MHUser.rootEndpoint +'/'+mhid+'/settings/internal';

  return houndRequest({
    method: 'GET',
    endpoint: path
  })
  .then(function(response){
    log('valid settings response: ', response);
    return response.internalSettings;
  })
  .catch(function(error){
    console.log('error in fetchSettings: ', error.error.message);
    console.error(error.error.stack);
    return false;
  });
}

/**
* fetchSourceSettings(mhid)
* @param mhid
* Fetches the settings for the current logged in user.
*/
static fetchSourceSettings(mhid){
  if( !mhid || (typeof mhid !== 'string' && !(mhid instanceof String)) ){
    throw new TypeError('mhid must be type string in MHUser.fetchSourceSettings');
  }
  var path = MHUser.rootEndpoint +'/'+mhid+'/settings/sources';

  return houndRequest({
    method: 'GET',
    endpoint: path
  })
  .then(function(response){
    response = MHRelationalPair.createFromArray(response.content);
    console.log('valid settings response: ', response);
    return response;
  })
  .catch(function(error){
    console.log('error in fetchSourceSettings: ', error.error.message);
    console.error(error.error.stack);
    return false;
  });
}



/**
* updateSettings(mhid,updates)
*
* @param updates
* updates must be passed into updateSettings as an object with three required params.
* An example of updating the boolean value of onboarded.
* {
*   "operation":"replace",
*   "property":"onboarded",
*   "value":Boolean
* }
* operation refers to the actions "replace", "add", or "remove"
* property is the property you want to change, i.e. "onboarded", "access", or "tooltips"
* value is either a boolean or string based on context of the request
*
* Another exmaple for updating tooltips:
* {
*   "operation":"add",
*   "property":"tooltips",
*   "value":["webapptooltip1", "webapptooltip2", "webapptooltip3"]
* }
* @returns {Promise}
*/
static updateSettings(mhid,updates){
  if( updates == null || typeof updates === 'string' || Array.isArray(updates) ){
    throw new TypeError('Update data parameter must be of type object');
  }
  if(updates.operation == null || updates.property == null || updates.value == null){
    throw new TypeError('Updates must include operation, property, and value as parameters.');
  }
  var path = MHUser.rootEndpoint +'/'+mhid+'/settings/internal/update';
  console.log(path,updates);
  return houndRequest({
    method          : 'PUT',
    endpoint        : path,
    withCredentials : true,
    data            : updates
  })
  .catch(function(err){
    console.log('error on profile update: ', err);
    throw err;
  });
}

/** TODO: refactor after new auth system
*
*/
static validateUsername(username){
  if( !username || (typeof username !== 'string' && !(username instanceof String)) ){
    throw new TypeError('Username must be type string in MHUser.validateUsername');
  }
  var path = MHUser.rootEndpoint + '/validate/username/' + encodeURIComponent(username);

  // returns 200 for acceptable user name
  // returns 406 for taken user name
  return houndRequest({
    method: 'GET',
    endpoint: path
  })
  .then(function(response){
      return response;
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
    return response;
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
/* TODO: change endpoint to CamelCase and to use mhid?
* mhUser.forgotUsernameWithEmail()
*
* @return { Promise }
*
*/
static forgotUsernameWithEmail(email){
  if( !email || (typeof email !== 'string' && !(email instanceof String)) ){
    throw new TypeError('Email must be type string in MHUser.forgotUsernameWithEmail');
  }
  var path = MHUser.rootEndpoint + '/forgotusername',
  data = {};

  data.email = email;

  // returns 200 for acceptable user name
  // returns 406 for taken user name
  return houndRequest({
    method          : 'POST',
    endpoint        : path,
    withCredentials : false,
    data            : data
  })
  .then(function(response){
  //  console.log('valid forgotUsernameWithEmail: ', response);
    return response;
  })
  .catch(function(error){
    if( error.xhr.status === 400 ){
      console.error('The email ' + email + ' is missing or an invalid argument.');
    }
    else if( error.xhr.status === 404 ){
      console.error('The user with the email address ' + email + ' was not found.');
    } else {
      console.log('error in new forgotUsernameWithEmail: ', error.error.message);
      console.error(error.error.stack);
    }
    return false;
  });
}
/* TODO: change endpoint to CamelCase and to use mhid?
* mhUser.forgotPasswordWithEmail()
*
* @return { Promise }
*
*/
static forgotPasswordWithEmail(email){
  if( !email || (typeof email !== 'string' && !(email instanceof String)) ){
    throw new TypeError('Email must be type string in MHUser.forgotPasswordWithEmail');
  }
  var path = MHUser.rootEndpoint + '/forgotpassword',
  data = {};

  data.email = email;

  return houndRequest({
    method          : 'POST',
    endpoint        : path,
    withCredentials : false,
    data            : data
  })
  .then(function(response){
    console.log('valid forgotPasswordWithEmail: ', response);
    return response;
  })
  .catch(function(error){
    if( error.xhr.status === 400 ){
      console.error('The email ' + email + ' is missing or an invalid argument.');
    }
    else if( error.xhr.status === 404 ){
      console.error('The user with the email address ' + email + ' was not found.');
    } else {
      console.log('error in new forgotPasswordWithEmail: ', error.error.message);
      console.error(error.error.stack);
    }
    return false;
  });
}
/* TODO: change endpoint to CamelCase and to use mhid?
* mhUser.forgotPasswordWithEmail()
*
* @return { Promise }
*
*/
static forgotPasswordWithUsername(username){
  if( !username || (typeof username !== 'string' && !(username instanceof String)) ){
    throw new TypeError('username must be type string in MHUser.forgotPasswordWithUsername');
  }
  var path = MHUser.rootEndpoint + '/forgotpassword',
  data = {};

  data.username = username;

  return houndRequest({
    method          : 'POST',
    endpoint        : path,
    withCredentials : false,
    data            : data
  })
  .then(function(response){
    console.log('valid forgotPasswordWithUsername: ', response);
    return response;
  })
  .catch(function(error){
    if( error.xhr.status === 400 ){
      console.error('The username ' + username + ' is missing or an invalid argument.');
    }
    else if( error.xhr.status === 404 ){
      console.error('The user ' + username + ' was not found.');
    } else {
      console.log('error in forgotPasswordWithUsername: ', error.error.message);
      console.error(error.error.stack);
    }
    return false;
  });
}
/* TODO: change endpoint to CamelCase and to use mhid?
* mhUser.newPassword()
*
* @return { Promise }
*
*/
static newPassword(password,ticket){

  if( !password || (typeof password !== 'string' && !(password instanceof String)) ){
    throw new TypeError('password must be type string in MHUser.newPassword');
  }
  if( !ticket || (typeof ticket !== 'string' && !(ticket instanceof String)) ){
    throw new TypeError('ticket must be type string in MHUser.newPassword');
  }
  var path = MHUser.rootEndpoint + '/forgotpassword/finish',
  data = {};

  data.newPassword = password;
  data.ticket = ticket;

  return houndRequest({
    method          : 'POST',
    endpoint        : path,
    withCredentials : false,
    data            : data
  })
  .then(function(response){
    console.log('valid newPassword: ', response);
    return response;
  })
  .catch(function(error){
    if( error.xhr.status === 400 ){
      console.error('The password ' + password + ' is an invalid password.');
    }
    else if( error.xhr.status === 404 ){
      console.error('The ticket ' + ticket + ' was not found.');
    } else {
      console.log('error in newPassword: ', error.error.message);
      console.error(error.error.stack);
    }
    return false;
  });
}

/* TODO: change endpoint to CamelCase and to use mhid?
* mhUser.setPassword()
*
* @return { Promise }
*
*/
setPassword(password,newPassword){

  if( !password || (typeof password !== 'string' && !(password instanceof String)) ){
    throw new TypeError('password must be type string in MHUser.newPassword');
  }
  if( !newPassword || (typeof newPassword !== 'string' && !(newPassword instanceof String)) ){
    throw new TypeError('newPassword must be type string in MHUser.newPassword');
  }
  var path = this.subendpoint('updatePassword'),
  data = {};

  data.oldPassword = password;
  data.newPassword = newPassword;

  return houndRequest({
    method          : 'PUT',
    endpoint        : path,
    withCredentials : true,
    data            : data
  })
  .then(function(response){
    console.log('valid password: ', response);
    return response;
  })
  .catch(function(error){
    if( error.xhr.status === 400 ){
      console.error('The password ' + password + ' is an invalid password.');
    }
    else if( error.xhr.status === 404 ){
      console.error('The newPassword ' + newPassword + ' was not found.');
    } else {
      console.log('error in setPassword: ', error.error.message);
      console.error(error.error.stack);
    }
    return false;
  });
}
/* TODO: docJS
*
* mhUser.setProfileImage(image);
*
*/
setProfileImage(image){
  log('in setProfileImage with image: ', image);
  if( !image ){
    throw new TypeError('No Image passed to setProfileImage');
    //return Promise.resolve(null);
  }
  if( !(image instanceof Blob || image instanceof File) ){
    throw new TypeError('Image was not of type Blob or File.');
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
    var MHLoginSession = System.get('../../src/models/user/MHLoginSession').MHLoginSession;
    //console.warn('circular dep: ', MHLoginSession);
    MHLoginSession.updatedProfileImage(MHObject.create(userWithImage));
    return userWithImage;
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
static fetchByUsername(username, view='full', force=false){
  if( !username || (typeof username !== 'string' && !(username instanceof String)) ){
    throw new TypeError('Username not of type String in fetchByUsername');
  }
  if( MHObject.getPrefixFromMhid(username) != null ){
    throw new TypeError('Passed mhid to fetchByUsername, please use MHObject.fetchByMhid for this request.');
  }
  if(view === null || view === undefined) {
    view = 'full';
  }

  log('in fetchByUsername, looking for: ' + username);

  // Check LRU for altId === username
  if( !force && mhidLRU.hasAltId(username) ){
    return Promise.resolve(mhidLRU.getByAltId(username));
  }

  var path = MHUser.rootEndpoint + '/lookup/' + username,
  newObj;

  return houndRequest({
    method          : 'GET',
    endpoint        : path,
    withCredentials : true,
    params:{
      view: view
    }
  })
  .then(function(response){
    newObj = MHObject.create(response);
    mhidLRU.putMHObj(newObj);
    return newObj;
  });
}

/* TODO: Refactor to api 1.0 specs
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
fetchInterestFeed(view='full', size=12, force=false){
  var path = this.subendpoint('interestFeed');

  if( force || this.interestFeed === null ){
    this.interestFeed = pagedRequest({
      method          : 'GET',
      endpoint        : path,
      pageSize        : size,
      params:{ view }
    });
  }
  return this.interestFeed;
}

/* TODO: remove console.log debug stuffs
* mhUsr.fetchOwnedCollections()
*
* @return { Promise }
*
*/

fetchOwnedCollections(view='full', size=12, force=true){
  var path = this.subendpoint('ownedCollections');
  if( force || this.ownedCollections === null ){
    this.ownedCollections = pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: { view }
    });
  }
  //console.log(this.feedPagedRequest);
  return this.ownedCollections;
}

/**
* mhObj.fetchSuggested(mhid,force)
*
* @param { string='full' } view - the view needed to depict each MHObject that is returned
* @param { number=12     } size  - the number of items to return per page
* @param { Boolean=false } force
*
* @return { houndPagedRequest }  - MediaHound paged request object for this feed
*
*/
fetchSuggested(view='full', size=12, force=false){
  var path = this.subendpoint('suggested');
  if( force || this.suggested === null || this.suggested.numberOfElements !== size ){
    this.suggested = pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: {view}
    });
  }
  //console.log(this.feedPagedRequest);
  return this.suggested;
}

/**
* mhUser.fetchFollowed()
* @param force {boolean=false}
* @returns {Promise}
*/
fetchFollowed(view='full', size=12, force=false){
  var path = this.subendpoint('following');
  if( force || this.following === null ){
    this.following = pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: {view}
    });
  }
  console.log(this.following);
  return this.following;
}

/*
* mhUser.linkService()
*
* @return { Promise }
*
*/
static linkService(serv,succ,fail){

  var service = serv || null,
  success = succ || 'https://www.mediahound.com/',
  failure = fail || 'https://www.mediahound.com/';

  if(service === null){
    console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
    return false;
  }

  return houndRequest({
    method            : 'GET',
    endpoint          : MHUser.rootEndpoint + '/account/'+service+'/link?successRedirectUrl='+success+'&failureRedirectUrl='+failure,
    withCredentials: true,
    //data   : { 'successRedirectUrl' : 'http://www.mediahound.com',  'failureRedirectUrl' : 'http://www.mediahound.com'},
    headers: {
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  }).then(function(response){
    console.log(response);
    return response;
  });
}
/*
* mhUser.unlinkService()
*
* @return { Promise }
*
*/
static unlinkService(serv){
  var service = serv || null;

  if(service === null){
    console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
    return false;
  }

  return houndRequest({
    method            : 'GET',
    endpoint          : MHUser.rootEndpoint + '/account/'+service+'/unlink',
    withCredentials: true,
    headers: {
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  }).then(function(response){
    console.log(response);
    return response;
  });
}

/*
* mhUser.fetchServiceSettings()
*
* @return { Promise }
*
*/
fetchServiceSettings(serv){

  var service = serv || null;
  var path = this.subendpoint('settings');

  if(service === null){
    console.warn("No service provided, aborting. First argument must include service name i.e. 'facebook' or 'twitter'.");
    return false;
  }

  return houndRequest({
    method            : 'GET',
    endpoint          : path+'/'+service,
    withCredentials: true,
    //data   : { 'successRedirectUrl' : 'http://www.mediahound.com',  'failureRedirectUrl' : 'http://www.mediahound.com'},
    headers: {
      'Accept':'application/json',
      'Content-Type':'application/json'
    }
  }).catch(function(response){
    console.error(response.error);
  })
  .then(function(response){
    console.log(response);
    return response;
  });
}

/*
* mhUser.fetchTwitterFollowers()
*
* @return { PagedRequest }
*
*/
fetchTwitterFollowers(view='full', size=12, force=false){

  var path = this.subendpoint('settings')+'/twitter/friends';
  if( force || this.twitterFollowers === null ){
    this.twitterFollowers = pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: {view}
    });
  }
  return this.twitterFollowers;

}


/*
* mhUser.fetchFacebookFriends()
*
* @return { PagedRequest }
*
*/
fetchFacebookFriends(view='full', size=12, force=false){

  var path = this.subendpoint('settings')+'/facebook/friends';
  if( force || this.facebookFriends === null ){
    this.facebookFriends = pagedRequest({
      method: 'GET',
      endpoint: path,
      pageSize: size,
      params: {view}
    });
  }
  return this.facebookFriends;

}



// Could change as needed
toString(){
  return super.toString() + ' and username ' + this.username;
}
}

(function(){
  MHObject.registerConstructor(MHUser);
})();
