
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Novella Object
export class MHNovella extends MHMedia {
  static get mhidPrefix() { return 'mhnov'; }
}

(function(){
  MHObject.registerConstructor(MHNovella, 'MHNovella');
})();
