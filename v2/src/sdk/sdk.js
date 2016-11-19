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

let _FormData;
if (typeof window !== 'undefined') {
  _FormData = window.FormData;
}
else if (typeof FormData === 'function') {
  _FormData = FormData;
}
else if (typeof window === 'undefined') {
  _FormData = require('form-data');
}

let _accessToken = null;
let _userAccessToken = null;
let _clientId = null;
let _clientSecret = null;
let _houndOrigin = null;

const getAccessToken = () => _userAccessToken ? _userAccessToken : _accessToken;
const getClientId = () => _clientId;
const getClientSecret = () => _clientSecret;
const getOrigin = () => _houndOrigin;
const getApiVersion = () => '1.2';
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

const createFormData = (obj) => {
  return Object
    .keys(obj)
    .reduce((formData, key) => {
      formData.append(key, obj[key]);
      return formData;
    }, new _FormData());
};

const refreshOAuthToken = () => {
  return fetch(`${getRootEndpoint()}/security/oauth/token`, {
    method: 'POST',
    body: createFormData({
      'client_id': getClientId(),
      'client_secret': getClientSecret(),
      'grant_type': 'client_credentials',
      scope: 'public_profile'
    }),
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${getAuthHeaders()}`
    }
  })
  .then(res => res.json())
  .then(json => {
    _accessToken = json.access_token;
  });
};

export const configure = ({ clientId, clientSecret, origin = 'https://api.mediahound.com/' }) => {
  _clientId = clientId;
  _clientSecret = clientSecret;
  _houndOrigin = origin;

  return refreshOAuthToken();
};

export const getLoginDialogURL = ({ redirectUrl, scope }) => {
  return `${getRootEndpoint()}/security/oauth/authorize?client_id=${getClientId()}&client_secret=${getClientSecret}&scope=${scope}&response_type=token&redirect_uri=${redirectUrl}`;
};

export const loginWithAccessToken = ({ accessToken }) => {
  return fetch(`${getRootEndpoint()}/security/oauth/check_token`, {
      method: 'POST',
      body: createFormData({
        token: accessToken
      }),
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${getAuthHeaders()}`
      }
    })
    .then(res => res.json())
    .then(json => {
      _accessToken = accessToken;

      return json.user_name;
    });
};

export const loginWithCredentials = ({ username, password, scope }) => {
  return fetch(`${getRootEndpoint()}/security/oauth/token`, {
      method: 'POST',
      body: createFormData({
        username,
        password,
        scope,
        'grant_type': 'password',
        'client_id': getClientId(),
        'client_secret': getClientSecret()
      }),
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${getAuthHeaders()}`
      }
    })
    .then(res => res.json())
    .then(json => {
      const accessToken = json.access_token;

      if (accessToken) {
        return loginWithAccessToken(accessToken);
      }
      else {
        const err = new Error('houndjs Invalid Credentials');
        err.json = json;
        throw err;
      }
    });
};
