import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Game (Track) Object
export default class MHGame extends MHMedia {
  static get mhidPrefix() { return 'mhgam'; }
}

MHObject.registerConstructor(MHGame, 'MHGame');
