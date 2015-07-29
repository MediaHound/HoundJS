
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';

// MediaHound Comment Object
export class MHComment extends MHAction {
  static get mhidPrefix() { return 'mhcmt'; }
}

(function(){
  MHObject.registerConstructor(MHComment, 'MHComment');
})();

