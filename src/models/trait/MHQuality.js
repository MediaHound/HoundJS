
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHQuality extends MHTrait {
  static get mhidPrefix() { return 'mhqlt'; }
}

(function(){
  MHObject.registerConstructor(MHQuality, 'MHQuality');
})();
