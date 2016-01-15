import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Special Series Object
export default class MHSpecialSeries extends MHMedia {
  static get mhidPrefix() { return 'mhsps'; }
}

MHObject.registerConstructor(MHSpecialSeries, 'MHSpecialSeries');
