
import { MHObject, mhidLRU } from '../base/MHObject.js';
import { houndRequest } from '../../request/hound-request.js';

export class MHHashtag extends MHObject {

  static get mhidPrefix()   { return 'mhhtg'; }
  static get rootEndpoint() { return 'graph/hashtag'; }

  /**
  * MHHashtag.fetchByTag(tag,view,force)
  *
  * @param { String } username - Username to fetch info for
  * @param { boolean} force - force fetch to server
  *
  * @return { Promise } - resolves to the MHUser object
  *
  */
  static fetchByTag(tag, view='basic', force=false){
    if( !tag || (typeof tag !== 'string' && !(tag instanceof String)) ){
      throw new TypeError('Hashtag not of type String in fetchByTag');
    }
    if( MHObject.getPrefixFromMhid(tag) != null ){
      throw new TypeError('Passed mhid to fetchByTag, please use MHObject.fetchByMhid for this request.');
    }
    if(view === null || view === undefined) {
      view = 'basic';
    }

    console.log('in fetchByTag, looking for: ' + tag);

    // Check LRU for altId === username
    if( !force && mhidLRU.hasAltId(tag) ){
      return Promise.resolve(mhidLRU.getByAltId(tag));
    }

    var path = MHHashtag.rootEndpoint + '/lookup/' + tag,
    newObj;

    return houndRequest({
      method          : 'GET',
      endpoint        : path,
      withCredentials : true
    })
    .then(function(response){
      newObj = MHObject.create(response);
      mhidLRU.putMHObj(newObj);
      return newObj;
    });
  }
}

(function(){
  MHObject.registerConstructor(MHHashtag, 'MHHashtag');
})();
