
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';

// MediaHound Follow Object
export class MHFollow extends MHAction {
  static get mhidPrefix() { return 'mhflw'; }
}

(function(){
  MHObject.registerConstructor(MHFollow, 'MHFollow');
})();

