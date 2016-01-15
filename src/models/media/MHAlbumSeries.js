import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Album Object
export default class MHAlbumSeries extends MHMedia {
  static get mhidPrefix() { return 'mhals'; }
}

MHObject.registerConstructor(MHAlbumSeries, 'MHAlbumSeries');
