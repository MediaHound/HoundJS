
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Graphic Novel Object
export class MHGraphicNovel extends MHMedia {
  static get mhidPrefix() { return 'mhgnl'; }
}

(function(){
  MHObject.registerConstructor(MHGraphicNovel, 'MHGraphicNovel');
})();
