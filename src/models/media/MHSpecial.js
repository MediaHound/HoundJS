import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Special Media Object
// TV Special is the most common use case
export default class MHSpecial extends MHMedia {
  static get mhidPrefix() { return 'mhspc'; }
}

MHObject.registerConstructor(MHSpecial, 'MHSpecial');
