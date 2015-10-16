
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHMaterialSource extends MHTrait {
  static get mhidPrefix() { return 'mhmts'; }
}

(function(){
  MHObject.registerConstructor(MHMaterialSource, 'MHMaterialSource');
})();
