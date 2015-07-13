
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHTheme extends MHTrait {
  static get mhidPrefix() { return 'mhthm'; }
}

(function(){
  MHObject.registerConstructor(MHTheme, 'MHTheme');
})();
