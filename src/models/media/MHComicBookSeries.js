import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Comic Book Series Object
export default class MHComicBookSeries extends MHMedia {
  static get mhidPrefix() { return 'mhcbs'; }
}

MHObject.registerConstructor(MHComicBookSeries, 'MHComicBookSeries');
