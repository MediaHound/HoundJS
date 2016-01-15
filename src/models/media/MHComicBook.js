import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Comic Book Object
export default class MHComicBook extends MHMedia {
  static get mhidPrefix() { return 'mhcbk'; }
}

MHObject.registerConstructor(MHComicBook, 'MHComicBook');
