
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHRealIndividualContributor extends MHContributor {
  get isIndividual() { return true; }
  get isReal() { return true; }

  static get mhidPrefix() { return 'mhric'; }
}

(function(){
  MHObject.registerConstructor(MHRealIndividualContributor, 'MHRealIndividualContributor');
}());
