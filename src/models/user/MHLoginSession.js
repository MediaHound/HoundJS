import MHObject, { mhidLRU } from '../base/MHObject.js';
import MHUser from './MHUser.js';
import MHSDK from '../sdk/MHSDK.js';

import houndRequest from '../../request/hound-request.js';

// Singleton Containers
let loggedInUser  = null;

export default class MHLoginSession {

  static loginDialogURLWithRedirectURL(redirectUrl) {
    return MHSDK.origin + MHSDK.apiVersion + `/security/oauth/authorize?client_id=${MHSDK.clientId}&client_secret=${MHSDK.clientSecret}&scope=public_profile&response_type=token&redirect_uri=${redirectUrl}`;
  }

  static loginWithAccessToken(accessToken) {
    return houndRequest({
        method: 'POST',
        useForms: true,
        endpoint: 'security/oauth/check_token',
        data: {
          token: accessToken
        },
        withCredentials : true,
        headers: {
          Authorization: `Basic ${MHSDK.authHeaders()}`
        }
      })
      .then(response => {
        MHSDK._setUserAccessToken(accessToken);

        return MHUser.fetchByUsername(response.user_name);
      })
      .then(user => {
        loggedInUser = user;
        return loggedInUser;
      });
  }

  /**
   * The Currently logged in MHUser object
   * @property {MHUser}
   * @static
   */
  static get currentUser() {
    return loggedInUser;
  }

  /**
   * MHLoginSession.logout()
   */
  static logout() {
    mhidLRU.removeAll();

    loggedInUser  = null;
  }
}
