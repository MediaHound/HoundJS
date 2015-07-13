
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHAudience extends MHTrait {
  static get mhidPrefix() { return 'mhaud'; }
}

(function(){
  MHObject.registerConstructor(MHAudience, 'MHAudience');
})();

