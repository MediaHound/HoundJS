
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHStoryElement extends MHTrait {
  static get mhidPrefix() { return 'mhstr'; }
}

(function(){
  MHObject.registerConstructor(MHStoryElement, 'MHStoryElement');
})();
