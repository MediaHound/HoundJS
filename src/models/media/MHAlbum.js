import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Album Object
export default class MHAlbum extends MHMedia {
  static get mhidPrefix() { return 'mhalb'; }
}

MHObject.registerConstructor(MHAlbum, 'MHAlbum');
