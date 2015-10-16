
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHSubGenre extends MHTrait {
  static get mhidPrefix() { return 'mhsgn'; }
}

(function(){
  MHObject.registerConstructor(MHSubGenre, 'MHSubGenre');
})();
