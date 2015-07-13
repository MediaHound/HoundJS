
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHEra extends MHTrait {
  static get mhidPrefix() { return 'mhera'; }
}

(function(){
  MHObject.registerConstructor(MHEra, 'MHEra');
})();
