
var _MHAccessToken = null;
var _MHClientId = null;
var _MHClientSecret = null;

export class MHSDK {

  /**
   * MHSDK.create(clientId, clientSecret)
   * Configures the MediaHound SDK with an OAuth clientId and clientSecret.
   *
   * @param   clientId <String> - OAuth Client Identifier
   * @param   clientSecret <String> - OAuth Client Secret
   * @returns <Promise> - A promise that resolves when the configuration is complete.
   */
  static configure(clientId, clientSecret) {
    _MHClientId = clientId;
    _MHClientSecret = clientSecret;

    return this.refreshOAuthToken();
  }

  static refreshOAuthToken() {
    var houndRequest = System.get('request/hound-request').houndRequest;
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
}
