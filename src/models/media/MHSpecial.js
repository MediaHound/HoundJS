
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Special Media Object
// TV Special is the most common use case
export class MHSpecial extends MHMedia {
  static get mhidPrefix() { return 'mhspc'; }
}

(function(){
  MHObject.registerConstructor(MHSpecial, 'MHSpecial');
})();
