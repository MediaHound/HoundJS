
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Special Series Object
export class MHSpecialSeries extends MHMedia {
  static get mhidPrefix() { return 'mhsps'; }
}

(function(){
  MHObject.registerConstructor(MHSpecialSeries, 'MHSpecialSeries');
})();
