import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Book Series Object
export default class MHBookSeries extends MHMedia {
  static get mhidPrefix() { return 'mhbks'; }
}

MHObject.registerConstructor(MHBookSeries, 'MHBookSeries');
