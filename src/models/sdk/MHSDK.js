
var _MHAccessToken = null;
var _MHClientId = null;
var _MHClientSecret = null;

var _houndOrigin = 'https://api-v10.mediahound.com/';

export class MHSDK {

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

  static refreshOAuthToken() {
    var houndRequest = System.get('request/hound-request.js').houndRequest;
    return houndRequest({
      endpoint: 'cas/oauth2.0/accessToken',
      params: {
        client_id: _MHClientId,
        client_secret: _MHClientSecret,
        grant_type: 'client_credentials'
      }
    }).then(function(response) {
      _MHAccessToken = response.accessToken;
    });
  }

  static get MHAccessToken() {
    return _MHAccessToken;
  }

  static get origin() {
    return _houndOrigin;
  }
}
