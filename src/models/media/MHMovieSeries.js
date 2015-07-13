
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Movie Series Object
export class MHMovieSeries extends MHMedia {
  static get mhidPrefix() { return 'mhmvs'; }
}

(function(){
  MHObject.registerConstructor(MHMovieSeries, 'MHMovieSeries');
})();
