import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Trailer Object
export default class MHTrailer extends MHMedia {
  static get mhidPrefix() { return 'mhtrl'; }
}

MHObject.registerConstructor(MHTrailer, 'MHTrailer');
