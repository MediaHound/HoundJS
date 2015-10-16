
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHAchievement extends MHTrait {
  static get mhidPrefix() { return 'mhach'; }
}

(function(){
  MHObject.registerConstructor(MHAchievement, 'MHAchievement');
})();

