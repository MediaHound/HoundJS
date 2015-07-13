
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Anthology Object
export class MHAnthology extends MHMedia {
  static get mhidPrefix() { return 'mhath'; }
}

(function(){
  MHObject.registerConstructor(MHAnthology, 'MHAnthology');
})();

