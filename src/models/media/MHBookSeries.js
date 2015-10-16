
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Book Series Object
export class MHBookSeries extends MHMedia {
  static get mhidPrefix() { return 'mhbks'; }
}

(function(){
  MHObject.registerConstructor(MHBookSeries, 'MHBookSeries');
})();
