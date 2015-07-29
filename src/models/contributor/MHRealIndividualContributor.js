
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHRealIndividualContributor extends MHContributor {
  get isIndividual(){ return true; }
  get isReal(){ return true; }

  static get mhidPrefix(){ return 'mhric'; }

  fetchCharacters(view='full', size=12, force=true){
    var path = this.subendpoint('characters');
    return this.fetchPagedEndpoint(path, view, size, force);
  }
}

(function(){
  MHObject.registerConstructor(MHRealIndividualContributor, 'MHRealIndividualContributor');
}());
