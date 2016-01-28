
var _MHAccessToken = null;
var _MHUserAccessToken = null;
var _MHClientId = null;
var _MHClientSecret = null;

var _houndOrigin = 'https://api.mediahound.com/';

// Use btoa from a browser or shim it in Ndoe with base64.
var _btoa;
if (typeof window !== 'undefined') {
  _btoa = window.btoa;
}
else if (typeof window === 'undefined') {
  _btoa = require('base-64').encode;
}

export default class MHSDK {

  /**
   * MHSDK.create(clientId, clientSecret)
   * Configures the MediaHound SDK with an OAuth clientId and clientSecret.
   *
   * @param   clientId <String> - OAuth Client Identifier
   * @param   clientSecret <String> - OAuth Client Secret
   * @param   origin <String> - (Optional) MediaHound network origin.
   * @returns <Promise> - A promise that resolves when the configuration is complete.
   */
  static configure(clientId, clientSecret, origin) {
    _MHClientId = clientId;
    _MHClientSecret = clientSecret;
    if (origin) {
      _houndOrigin = origin;
    }

    return this.refreshOAuthToken();
  }

  static configureWithAccessToken(accessToken, origin) {
    _MHClientId = null;
    _MHClientSecret = null;
    if (origin) {
      _houndOrigin = origin;
    }

    _MHAccessToken = accessToken;
  }

  static authHeaders() {
    return _btoa(_MHClientId + ':' + _MHClientSecret);
  }

  static refreshOAuthToken() {
    const houndRequest = require('../../request/hound-request.js').default;

    const auth = this.authHeaders();

    return houndRequest({
      method: 'POST',
      useForms: true,
      endpoint: 'security/oauth/token',
      data: {
        client_id: _MHClientId,
        client_secret: _MHClientSecret,
        grant_type: 'client_credentials',
        scope: 'public_profile'
      },
      headers: {
        Authorization: `Basic ${auth}`
      }
    }).then(function(response) {
      _MHAccessToken = response.access_token;
    });
  }

  static get MHAccessToken() {
    if (_MHUserAccessToken) {
      return _MHUserAccessToken;
    }
    return _MHAccessToken;
  }

  static get clientId() {
    return _MHClientId;
  }

  static get clientSecret() {
    return _MHClientSecret;
  }

  static get origin() {
    return _houndOrigin;
  }

  static get apiVersion() {
    return '1.2';
  }

  static _setUserAccessToken(accessToken) {
    _MHUserAccessToken = accessToken;
  }
}
