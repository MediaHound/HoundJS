
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Music Video Object
export class MHMusicVideo extends MHMedia {
  static get mhidPrefix() { return 'mhmsv'; }
}

(function(){
  MHObject.registerConstructor(MHMusicVideo, 'MHMusicVideo');
})();
