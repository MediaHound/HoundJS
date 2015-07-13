
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Periodical Series Object
export class MHPeriodicalSeries extends MHMedia {
  static get mhidPrefix() { return 'mhpds'; }
}

(function(){
  MHObject.registerConstructor(MHPeriodicalSeries, 'MHPeriodicalSeries');
})();
