
import { MHObject } from '../base/MHObject.js';
import { pagedRequest } from '../../request/hound-paged-request.js';

// MediaHound Contributor Object
export class MHContributor extends MHObject {
  /*
   * TODO DocJS
   */
  get isGroup(){
    return !this.isIndividual;
  }

  /*
   * TODO DocJS
   */
  get isFictional(){
    return !this.isReal;
  }

  /*
   * TODO DocJS
   */
  static get rootEndpoint(){
    if( this.prototype.isFictional && this.prototype.isReal != null ){
      return 'graph/character';
    }
    return 'graph/contributor';
  }

  /*
   * TODO DocJS
   */
   fetchMedia(view='full', size=12, force=true){
     var path = this.subendpoint('media');
     return this.fetchPagedEndpoint(path, view=view, size=size, force=force);
   }
}
