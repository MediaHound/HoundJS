import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Track Object
export default class MHTrack extends MHMedia {
  static get mhidPrefix() { return 'mhsng'; }
}

MHObject.registerConstructor(MHTrack, 'MHTrack');

