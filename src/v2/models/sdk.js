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

export const getAuthHeaders = () => _btoa(`${_clientId}:${_clientSecret}`);

const createFormData = (obj) => {
  return Object
    .keys(obj)
    .reduce((formData, key) => {
      formData.append(key, obj[key]);
      return formData;
    }, new _FormData());
};
export const refreshOAuthToken = () => {
  return fetch(`${getOrigin()}${getApiVersion()}/security/oauth/token`, {
    method: 'POST',
    body: createFormData({
      client_id: _clientId,
      client_secret: _clientSecret,
      grant_type: 'client_credentials',
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

export const getAccessToken = () => {
  if (_userAccessToken) {
    return _userAccessToken;
  }
  return _accessToken;
};

export const getClientId = () => _clientId;

export const getClientSecret = () => _clientSecret;

export const getOrigin = () => _houndOrigin;

export const getApiVersion = () => '1.2';

export const setUserAccessToken = (accessToken) => {
  _accessToken = accessToken;
};
