
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHFictionalGroupContributor extends MHContributor {

  get isIndividual() { return false; }
  get isReal() { return false; }

  static get mhidPrefix() { return 'mhfgc'; }
}

(function(){
  MHObject.registerConstructor(MHFictionalGroupContributor, 'MHFictionalGroupContributor');
}());
