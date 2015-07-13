
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';

// MediaHound Add Object
export class MHAdd extends MHAction {
  static get mhidPrefix() { return 'mhadd'; }
}

(function(){
  MHObject.registerConstructor(MHAdd, 'MHAdd');
})();
