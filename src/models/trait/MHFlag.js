
import { MHObject } from '../base/MHObject.js';
import { MHTrait } from './MHTrait.js';

// MediaHound Trait Object
export class MHFlag extends MHTrait {
  static get mhidPrefix() { return 'mhflg'; }
}

(function(){
  MHObject.registerConstructor(MHFlag, 'MHFlag');
})();
