
import { log } from '../internal/debug-helpers';

import { MHObject, mhidLRU } from '../base/MHObject';
import { MHUser } from './MHUser';

import { houndRequest } from '../../request/hound-request';

/* taken from iOS
 *
 *  NSString* const MHLoginSessionUserProfileImageDidChange = @"LoginSessionUserProfileImageDidChange";
 *
 */

var makeEvent = function(name, options){
  var evt;
  options.bubbles     = options.bubbles     || false;
  options.cancelable  = options.cancelable  || false;
  options.detail      = options.detail      || (void 0);

  try{

    evt = new CustomEvent(name, options);

  } catch (err) {

    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent( name, options.bubbles, options.cancelable, options.detail );

  }
  return evt;
};

/**
 *
 * Class Events
 *  mhUserLogin
 *  mhUserLogout
 *  mhSessionUserProfileImageChange
 *
 *  currently can't extend built in classes or else this would be:
 *    'MHUserLoginEvent extends CustomEvent'
 *
 */
class MHUserLoginEvent {
  static create(mhUserObj){
    return makeEvent('mhUserLogin', {
      bubbles:    false,
      cancelable: false,
      detail: {
        mhUser: mhUserObj
      }
    });
  }
}

class MHUserLogoutEvent {
  static create(mhUserObj){
    return makeEvent('mhUserLogout', {
      bubbles:    false,
      cancelable: false,
      detail: {
        mhUser: mhUserObj
      }
    });
  }
}

class MHSessionUserProfileImageChange {
  static create(mhUserObj){
    return makeEvent('mhSessionUserProfileImageChange', {
      bubbles:    false,
      cancelable: false,
      detail: {
        mhUser: mhUserObj
      }
    });
  }
}

// Singleton Containers
var loggedInUser  = null,
    onboarded     = false,
    access        = false;

// MediaHound Login Session Singleton
/** @class MHLoginSession */
export class MHLoginSession {

  /**
   * The Currently logged in MHUser object
   * @property {MHUser}
   * @static
   */
  static get currentUser(){
    return loggedInUser;
  }

  /**
   * True or False, is there an open session?
   * @property {Boolean}
   * @static
   */
  static get openSession(){
    return loggedInUser instanceof MHUser;
  }

  /**
   * If the currently logged in user has gone through the onboarding process.
   * @property {Boolean|null} onboarded
   */
  static get onboarded(){
    return onboarded;
  }

  /**
   * If the currently logged in user has access to the application.
   * @property {Boolean|null} access
   */
  static get access(){
    return access;
  }

  /**
   * When A user updates their profile picture this will fire the event
   * and update the currentUser property.
   * @param  {MHUser} updatedUser
   * @returns {Boolean}
   */
  static updatedProfileImage(updatedUser){
    log('updatedUploadImage: ', updatedUser);
    if( !(updatedUser instanceof MHUser) || !updatedUser.hasMhid(loggedInUser.mhid) ){
      throw new TypeError("Updated Profile Image must be passed a new MHUser Object that equals the currently logged in user");
    }

    loggedInUser = updatedUser;
    loggedInUser.fetchSocial();
    loggedInUser.fetchOwnedCollections();

    // dispatch profile image changed event: 'mhUserProfileImageChanged'
    window.dispatchEvent(MHSessionUserProfileImageChange.create(loggedInUser));

    return true;
  }

  static completedOnboarding(){
    var path = MHUser.rootEndpoint + '/onboard';
    return houndRequest({
        method            : 'POST',
        endpoint          : path,
        'withCredentials' : true
      })
      .then(loginMap => {
        access    = loginMap.access;
        onboarded = loginMap.onboarded;
        return loginMap;
      });
  }

  /**
   *  MHLoginSession.login(username, password)
   *
   *  @param {string} username - the username for the user logging in
   *  @param {string} password - the password for the user logging in
   *
   *  @return {Promise<MHUser>} - resolves to MHUser object of logged in user
   */
  static login(username, password){
    if( typeof username !== 'string' && !(username instanceof String) ){
      throw new TypeError('Username not of type string in MHUser.login');
    }

    if( typeof password !== 'string' && !(password instanceof String) ){
      throw new TypeError('Password not of type string in MHUser.login');
    }

    var path = MHUser.rootEndpoint + '/login',
        data = {
          'username':username,
          'password':password
        };

    return houndRequest({
        method          : 'POST',
        endpoint        : path,
        'data'          : data,
        withCredentials : true,
        headers: {}
      })
      .then(loginMap => {
        access    = loginMap.access;
        onboarded = loginMap.onboarded;
        return MHObject.fetchByMhid(loginMap.mhid);
      })
      .then(mhUserLoggedIn => {
        loggedInUser = mhUserLoggedIn;

        // pre-fetch some user content
        //loggedInUser.fetchOwnedCollections();
        //loggedInUser.fetchSocial();

        // dispatch logged in event: 'mhUserLogin'
        window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));

        return loggedInUser;
      })
      .catch(function(error){
        //console.error('Error on MHLoginSession.login', error.error, 'xhr: ', error.xhr);
        throw new Error('Problem during login: '+error.error.message, 'MHLoginSession.js');
      });
  }

  /**
   * MHLoginSession.logout()
   *
   * @returns {Promise} - resolves to user that just logged out.
   */
  static logout(){
    var currentCookies = document.cookie.split('; ').map(c => {
      var keyVal = c.split('=');
      return {
        'key':  keyVal[0],
        'value':keyVal[1]
      };
    });

    currentCookies.forEach(cookie => {
      if( cookie.key === 'JSESSIONID' ){
        var expires = (new Date(0)).toGMTString();
        document.cookie = `${cookie.key}=${cookie.value}; expires=${expires}; domain=.mediahound.com`;
      }
    });

    // Dispatch logout event
    window.dispatchEvent(MHUserLogoutEvent.create(loggedInUser));

    mhidLRU.removeAll();

    return Promise.resolve(loggedInUser)
      .then(function(mhUser){
        loggedInUser  = null;
        access        = false;
        onboarded     = false;
        return mhUser;
      });
  }

  /**
   * @returns {Promise} - resolves to the user that has an open session.
   */
  static validateOpenSession(){
    var path = MHUser.rootEndpoint + '/validateSession';

    return houndRequest({
        method: 'POST',
        endpoint: path,
        withCredentials : true
      })
      .then(function(loginMap){
        access    = loginMap.access;
        onboarded = loginMap.onboarded;
        return MHObject.fetchByMhid(loginMap.mhid);
      })
      .then(function(mhUserLoggedIn){
        loggedInUser = mhUserLoggedIn;
        window.dispatchEvent(MHUserLoginEvent.create(loggedInUser));
        return loggedInUser;
      })
      .catch(function(error){
        if( error.xhr.status === 401 ){
          console.log('No open MediaHound session');
        }
        return error;
      });
  }
}

