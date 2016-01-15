import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Periodical Series Object
export default class MHPeriodicalSeries extends MHMedia {
  static get mhidPrefix() { return 'mhpds'; }
}

MHObject.registerConstructor(MHPeriodicalSeries, 'MHPeriodicalSeries');
