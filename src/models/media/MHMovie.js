
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Movie Object
export class MHMovie extends MHMedia {
  static get mhidPrefix() { return 'mhmov'; }
}

(function(){
  MHObject.registerConstructor(MHMovie, 'MHMovie');
})();
