import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Anthology Object
export default class MHAnthology extends MHMedia {
  static get mhidPrefix() { return 'mhath'; }
}

MHObject.registerConstructor(MHAnthology, 'MHAnthology');

