import { promiseRequest } from '../../request/promise-request';

var responseThen = function(response){
  //log('hound-request: ', response);
  if( !!response ){
    // currently no XML support only JSON text else return status
    if( response.responseText != null && response.responseText !== ''){
      return JSON.parse(response.responseText);
    }
    if( response.response != null && typeof response.response === 'string' && response.response !== '' ){
      return JSON.parse(response.response);
    }
    return response.status;
  }
  return response;
};

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
    return promiseRequest({
      url: 'https://cas.mediahound.com/cas/oauth2.0/accessToken',
      params: {
        client_id: _MHClientId,
        client_secret: _MHClientSecret,
        grant_type: 'client_credentials'
      }
    }).then(responseThen).then(function(response) {
      _MHAccessToken = response.accessToken;
    });
  }

  static get MHAccessToken() {
    return _MHAccessToken;
  }
}
