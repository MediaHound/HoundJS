
import { MHObject/*, mhidLRU*/ } from '../base/MHObject';
import { MHUser } from './MHUser';

import { houndRequest } from '../../request/hound-request';

/* taken from iOS
 *
 *  NSString* const MHLoginSessionUserProfileImageDidChange = @"LoginSessionUserProfileImageDidChange";
 *
 */

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
    return new CustomEvent('mhUserLogin', {
      bubbles: false,
      cancelable: false,
      detail: {
        mhUser: mhUserObj
      }
    });
  }
}

class MHUserLogoutEvent {
  static create(mhUserObj){
    return new CustomEvent('mhUserLogout', {
      bubbles: false,
      cancelable: false,
      detail: {
        mhUser: mhUserObj
      }
    });
  }
}

class MHSessionUserProfileImageChange {
  static create(mhUserObj){
    return new CustomEvent('mhSessionUserProfileImageChange', {
      bubbles: false,
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
   * @property {boolean}
   * @static
   */
  static get openSession(){
    return loggedInUser instanceof MHUser;
  }

  /**
   *
   * @returns {boolean|null}
   */
  static get onboarded(){
    return onboarded;
  }

  /**
   *
   * @returns {boolean|null}
   */
  static get access(){
    return access;
  }

  /**
   * When A user updates their profile picture this will fire the event
   * and update the currentUser property.
   * @param  {MHUser} updatedUser
   * @returns {boolean}
   */
  static updatedProfileImage(updatedUser){
    console.log('updatedUploadImage: ', updatedUser);
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
      .then(function(loginMap){
        access    = loginMap.access;
        onboarded = loginMap.onboarded;
        return MHObject.fetchByMhid(loginMap.mhid);
      })
      .then(function(mhUserLoggedIn){
        loggedInUser = mhUserLoggedIn;
        //mhidLRU.putMHObj(loggedInUser);

        // pre-fetch some user content
        loggedInUser.fetchOwnedCollections();
        loggedInUser.fetchSocial();

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
    var currentCookieKeys = document.cookie.split('; ').map(v => v.split('=')[0]);

    // Clear cookies for now, with oAuth will invalidate token?
    currentCookieKeys.filter(v => (v === 'AWSELB' || v === 'JSESSIONID')).forEach(function(v){
      var newValue = v + '=""; expires=' + (new Date(0)).toGMTString() + '; domain=mediahound.com';
      //console.log('current cookie: ', v, newValue);
      document.cookie = newValue;
    });

    // Dispatch logout event
    window.dispatchEvent(MHUserLogoutEvent.create(loggedInUser));

    return Promise.resolve(loggedInUser)
      .then(function(mhUser){
        loggedInUser = null;
        return mhUser;
      });
  }

  /**
   * TODO set endpoint when avaliable
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
        console.log('Problem validating open session');
        //console.error(error.error.stack);
        return error;
      });
  }
}

