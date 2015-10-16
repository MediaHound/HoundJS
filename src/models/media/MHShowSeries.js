
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound ShowSeries (Track) Object
export class MHShowSeries extends MHMedia {
  static get mhidPrefix() { return 'mhsss'; }
}

(function(){
  MHObject.registerConstructor(MHShowSeries, 'MHShowSeries');
})();
