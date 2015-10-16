
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Comic Book Object
export class MHComicBook extends MHMedia {
  static get mhidPrefix() { return 'mhcbk'; }
}

(function(){
  MHObject.registerConstructor(MHComicBook, 'MHComicBook');
})();
