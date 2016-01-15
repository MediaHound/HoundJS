import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Music Video Object
export default class MHMusicVideo extends MHMedia {
  static get mhidPrefix() { return 'mhmsv'; }
}

MHObject.registerConstructor(MHMusicVideo, 'MHMusicVideo');
