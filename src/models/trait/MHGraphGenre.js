
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHGraphGenre extends MHTrait {
  static get mhidPrefix() { return 'mhgrg'; }
}

(function(){
  MHObject.registerConstructor(MHGraphGenre, 'MHGraphGenre');
})();
