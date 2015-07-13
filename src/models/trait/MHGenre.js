
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHGenre extends MHTrait {
  static get mhidPrefix() { return 'mhgnr'; }
}

(function(){
  MHObject.registerConstructor(MHGenre, 'MHGenre');
})();

