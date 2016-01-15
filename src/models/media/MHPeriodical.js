import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Periodical Object
export default class MHPeriodical extends MHMedia {
  static get mhidPrefix() { return 'mhpdc'; }
}

MHObject.registerConstructor(MHPeriodical, 'MHPeriodical');
