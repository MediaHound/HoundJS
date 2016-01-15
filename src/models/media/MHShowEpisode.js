import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound ShowEpisode Object
export default class MHShowEpisode extends MHMedia {
  static get mhidPrefix() { return 'mhsep'; }
}

MHObject.registerConstructor(MHShowEpisode, 'MHShowEpisode');
