
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Game (Track) Object
export class MHGame extends MHMedia {
  static get mhidPrefix() { return 'mhgam'; }
}

(function(){
  MHObject.registerConstructor(MHGame, 'MHGame');
})();
