import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Movie Object
export default class MHMovie extends MHMedia {
  static get mhidPrefix() { return 'mhmov'; }
}

MHObject.registerConstructor(MHMovie, 'MHMovie');
