
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Trailer Object
export class MHTrailer extends MHMedia {
  static get mhidPrefix() { return 'mhtrl'; }
}

(function(){
  MHObject.registerConstructor(MHTrailer, 'MHTrailer');
})();
