import MHObject from '../base/MHObject.js';
import houndRequest from '../../request/hound-request.js';
import { MHHashtagMetadata } from '../meta/MHMetadata.js';

export default class MHHashtag extends MHObject {

  static get mhidPrefix()   { return 'mhhtg'; }
  static get rootEndpoint() { return 'graph/hashtag'; }

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHHashtagMetadata
    };
  }

  /**
  * MHHashtag.fetchByName(name,view,force)
  *
  * @param { String } username - Username to fetch info for
  * @param { boolean} force - force fetch to server
  *
  * @return { Promise } - resolves to the MHUser object
  *
  */
  static fetchByName(name, view='full' /*, force=false*/) {
    if (!name || (typeof name !== 'string' && !(name instanceof String))) {
      throw new TypeError('Hashtag not of type String in fetchByTag');
    }

    var path = this.rootSubendpoint('/lookup/' + name);

    return houndRequest({
      method: 'GET',
      endpoint: path,
      params: {
        view: view
      }
    })
    .then(function(response) {
      var newObj = MHObject.create(response);
      return newObj;
    });
  }
}

MHObject.registerConstructor(MHHashtag, 'MHHashtag');
