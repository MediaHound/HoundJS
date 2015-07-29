
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHRealGroupContributor extends MHContributor {
  get isIndividual(){ return false; }
  get isReal(){ return true; }

  static get mhidPrefix(){ return 'mhrgc'; }

  fetchCharacters(view='full', size=20, force=false){
    var path = this.subendpoint('characters');
    return this.fetchPagedEndpoint(path, view, size, force);
  }
}

(function(){
  MHObject.registerConstructor(MHRealGroupContributor, 'MHRealGroupContributor');
}());
