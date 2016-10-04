import MHObject, { mhidLRU } from '../base/MHObject.js';
import MHUser from './MHUser.js';
import MHSDK from '../sdk/MHSDK.js';

import houndRequest from '../../request/hound-request.js';

// Singleton Containers
let loggedInUser  = null;

export default class MHLoginSession {

  static loginDialogURLWithRedirectURL(redirectUrl, scope='public_profile') {
    return `${MHSDK.origin}${MHSDK.apiVersion}/security/oauth/authorize?client_id=${MHSDK.clientId}&client_secret=${MHSDK.clientSecret}&scope=${scope}&response_type=token&redirect_uri=${redirectUrl}`;
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

        // We need to fetch a forced update here because if the user
        // was previously fetched it won't have proper view of the user.
        // Things like `email` are only sent down with the logged-in user context
        return MHUser.fetchByUsername(response.user_name, 'full', true);
      })
      .then(user => {
        loggedInUser = user;
        return loggedInUser;
      });
  }

  static loginWithCredentials(username, password, scope='public_profile') {
    return houndRequest({
        method: 'POST',
        useForms: true,
        endpoint: 'security/oauth/token',
        data: {
          username,
          password,
          scope,
          grant_type: 'password',
          client_id: MHSDK.clientId,
          client_secret: MHSDK.clientSecret
        },
        headers: {
          Authorization: `Basic ${MHSDK.authHeaders()}`
        }
      }).then(response => {
        const accessToken = response.access_token;

        if (accessToken) {
          return this.loginWithAccessToken(accessToken);
        }
        else {
          throw new Error('MHLoginSessionInvalidCredentialsError');
        }
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
