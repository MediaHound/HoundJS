
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Book (Track) Object
export class MHBook extends MHMedia {
  static get mhidPrefix() { return 'mhbok'; }
}

(function(){
  MHObject.registerConstructor(MHBook, 'MHBook');
})();
