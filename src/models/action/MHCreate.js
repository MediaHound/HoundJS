
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';

// MediaHound Create Object
export class MHCreate extends MHAction {
  static get mhidPrefix() { return 'mhcrt'; }
}

(function(){
  MHObject.registerConstructor(MHCreate, 'MHCreate');
})();

