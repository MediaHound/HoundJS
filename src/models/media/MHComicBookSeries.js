
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Comic Book Series Object
export class MHComicBookSeries extends MHMedia {
  static get mhidPrefix() { return 'mhcbs'; }
}

(function(){
  MHObject.registerConstructor(MHComicBookSeries, 'MHComicBookSeries');
})();
