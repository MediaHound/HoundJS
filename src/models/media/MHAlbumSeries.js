
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Album Object
export class MHAlbumSeries extends MHMedia {
  static get mhidPrefix() { return 'mhals'; }
}

(function(){
  MHObject.registerConstructor(MHAlbumSeries, 'MHAlbumSeries');
})();
