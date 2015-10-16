
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Album Object
export class MHAlbum extends MHMedia {
  static get mhidPrefix() { return 'mhalb'; }
}

(function(){
  MHObject.registerConstructor(MHAlbum, 'MHAlbum');
})();
