import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Novella Object
export default class MHNovella extends MHMedia {
  static get mhidPrefix() { return 'mhnov'; }
}

MHObject.registerConstructor(MHNovella, 'MHNovella');
