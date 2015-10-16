
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound ShowEpisode Object
export class MHShowEpisode extends MHMedia {
  static get mhidPrefix() { return 'mhsep'; }
}

(function(){
  MHObject.registerConstructor(MHShowEpisode, 'MHShowEpisode');
})();
