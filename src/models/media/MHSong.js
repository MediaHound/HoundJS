
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Song (Track) Object
export class MHSong extends MHMedia {
  static get mhidPrefix() { return 'mhsng'; }
}

(function(){
  MHObject.registerConstructor(MHSong, 'MHSong');
})();

