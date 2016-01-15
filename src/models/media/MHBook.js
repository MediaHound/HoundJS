import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Book (Track) Object
export default class MHBook extends MHMedia {
  static get mhidPrefix() { return 'mhbok'; }
}

MHObject.registerConstructor(MHBook, 'MHBook');
