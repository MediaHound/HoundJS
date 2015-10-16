
import { MHObject } from '../base/MHObject.js';
import { MHMedia } from './MHMedia.js';

// MediaHound Track Object
export class MHTrack extends MHMedia {
  static get mhidPrefix() { return 'mhsng'; }
}

(function(){
  MHObject.registerConstructor(MHTrack, 'MHTrack');
})();

