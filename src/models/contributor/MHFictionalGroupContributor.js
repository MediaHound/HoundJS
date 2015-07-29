
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHFictionalGroupContributor extends MHContributor {

  get isIndividual(){ return false; }
  get isReal(){ return false; }

  static get mhidPrefix(){ return 'mhfgc'; }

  fetchContributors(view='full', size=20, force=false){
    var path = this.subendpoint('contributors');
    return this.fetchPagedEndpoint(path, view, size, force);
  }
}

(function(){
  MHObject.registerConstructor(MHFictionalGroupContributor, 'MHFictionalGroupContributor');
}());
