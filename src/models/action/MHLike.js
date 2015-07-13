
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';

// MediaHound Like Object
export class MHLike extends MHAction {
  static get mhidPrefix() { return 'mhlke'; }
}

(function(){
  MHObject.registerConstructor(MHLike, 'MHLike');
})();

