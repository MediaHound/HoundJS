import basicRequest from '../request/basic-request.js';

// Use btoa from a browser or shim it in Node with base64.
let _btoa;
if (typeof window !== 'undefined') {
  _btoa = window.btoa;
}
else if (typeof btoa === 'function') {
  _btoa = btoa;
}
else if (typeof window === 'undefined') {
  _btoa = require('base-64').encode;
}

let _accessToken = null;
let _userAccessToken = null;
let _clientId = null;
let _clientSecret = null;
let _houndOrigin = 'https://api.mediahound.com/';
let _locale = null;

const getAccessToken = () => _userAccessToken ? _userAccessToken : _accessToken;
const getClientId = () => _clientId;
const getClientSecret = () => _clientSecret;
const getOrigin = () => _houndOrigin;
const getApiVersion = () => '1.3';
const getAuthHeaders = () => _btoa(`${_clientId}:${_clientSecret}`);
const getRootEndpoint = () => `${getOrigin()}${getApiVersion()}`;

export const details = {
  getAccessToken,
  getClientId,
  getClientSecret,
  getOrigin,
  getApiVersion,
  getAuthHeaders,
  getRootEndpoint
};

const refreshOAuthToken = () => {
  return basicRequest({
      method: 'POST',
      url: `${getRootEndpoint()}/security/oauth/token`,
      params: {
        'client_id': getClientId(),
        'client_secret': getClientSecret(),
        'grant_type': 'client_credentials',
        scope: 'public_profile'
      },
      authorization: `Basic ${getAuthHeaders()}`,
      useForms: true
    })
    .then(json => {
      const accessToken = json.access_token;

      // Save the access to use globally.
      _accessToken = accessToken;

      return { accessToken };
    });
};

/**
 * Authenticates with the Mediahound API using a Client Id/Secret.
 * You must invoke this function before calling any other houndjs api.
 * @param origin Optional url to the MediaHound API. By default this is
 *   'https://api.mediahound.com/'. You typically should omit this parameter.
 *
 * @return A promise that resolves when configuration is complete.
 *   Any houndjs api calls must be invoked after this promise resolves.
 *   The promise resolves with { accessToken }.
 */
export const configure = ({ clientId, clientSecret, origin }) => {
  _clientId = clientId;
  _clientSecret = clientSecret;
  if (origin) {
    _houndOrigin = origin;
  }

  return refreshOAuthToken();
};

export const setLocale = (locale) => {
  _locale = locale;
};

export const getLocale = () => _locale;

export const getLoginDialogURL = ({ redirectUrl, scope }) => {
  return `${getRootEndpoint()}/security/oauth/authorize?client_id=${getClientId()}&client_secret=${getClientSecret()}&scope=${scope}&response_type=token&redirect_uri=${redirectUrl}`;
};

export const loginWithAccessToken = ({ accessToken }) => {
  return basicRequest({
      method: 'POST',
      url: `${getRootEndpoint()}/security/oauth/check_token`,
      params: {
        token: accessToken
      },
      authorization: `Basic ${getAuthHeaders()}`,
      useForms: true
    })
    .then(json => {
      _accessToken = accessToken;

      return json.user_name;
    });
};

export const loginWithCredentials = ({ username, password, scope }) => {
  return basicRequest({
      method: 'POST',
      url: `${getRootEndpoint()}/security/oauth/token`,
      params: {
        username,
        password,
        scope,
        'grant_type': 'password',
        'client_id': getClientId(),
        'client_secret': getClientSecret()
      },
      authorization: `Basic ${getAuthHeaders()}`,
      useForms: true
    })
    .then(json => {
      const accessToken = json.access_token;

      if (accessToken) {
        return loginWithAccessToken({ accessToken });
      }
      else {
        const err = new Error('houndjs Invalid Credentials');
        err.json = json;
        throw err;
      }
    });
};
