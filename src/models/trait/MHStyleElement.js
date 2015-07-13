
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHStyleElement extends MHTrait {
  static get mhidPrefix() { return 'mhsty'; }
}

(function(){
  MHObject.registerConstructor(MHStyleElement, 'MHStyleElement');
})();
