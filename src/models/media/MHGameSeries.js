
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Game Series Object
export class MHGameSeries extends MHMedia {
  static get mhidPrefix() { return 'mhgms'; }
}

(function(){
  MHObject.registerConstructor(MHGameSeries, 'MHGameSeries');
})();
