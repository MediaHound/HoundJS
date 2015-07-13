
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHMood extends MHTrait {
  static get mhidPrefix() { return 'mhmod'; }
}

(function(){
  MHObject.registerConstructor(MHMood, 'MHMood');
})();
