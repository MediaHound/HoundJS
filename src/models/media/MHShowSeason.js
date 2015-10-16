
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound ShowSeason (Track) Object
export class MHShowSeason extends MHMedia {
  static get mhidPrefix() { return 'mhssn'; }
}

(function(){
  MHObject.registerConstructor(MHShowSeason, 'MHShowSeason');
})();
