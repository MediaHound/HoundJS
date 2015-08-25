
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHRealGroupContributor extends MHContributor {
  get isIndividual() { return false; }
  get isReal() { return true; }

  static get mhidPrefix() { return 'mhrgc'; }
}

(function(){
  MHObject.registerConstructor(MHRealGroupContributor, 'MHRealGroupContributor');
}());
