
import { MHObject } from '../base/MHObject.js';
import { MHContributor } from './MHContributor.js';

// MediaHound Contributor Object
export class MHFictionalIndividualContributor extends MHContributor {

  get isIndividual() { return true; }
  get isReal() { return false; }

  static get mhidPrefix() { return 'mhfic'; }
}

(function(){
  MHObject.registerConstructor(MHFictionalIndividualContributor, 'MHFictionalIndividualContributor');
}());
