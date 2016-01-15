import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Game Series Object
export default class MHGameSeries extends MHMedia {
  static get mhidPrefix() { return 'mhgms'; }
}

MHObject.registerConstructor(MHGameSeries, 'MHGameSeries');
