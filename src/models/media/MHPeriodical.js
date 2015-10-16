
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Periodical Object
export class MHPeriodical extends MHMedia {
  static get mhidPrefix() { return 'mhpdc'; }
}

(function(){
  MHObject.registerConstructor(MHPeriodical, 'MHPeriodical');
})();
