
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Graphic Novel Series Object
export class MHGraphicNovelSeries extends MHMedia {
  static get mhidPrefix() { return 'mhgns'; }
}

(function(){
  MHObject.registerConstructor(MHGraphicNovelSeries, 'MHGraphicNovelSeries');
})();
