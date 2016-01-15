import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound ShowSeason (Track) Object
export default class MHShowSeason extends MHMedia {
  static get mhidPrefix() { return 'mhssn'; }
}

MHObject.registerConstructor(MHShowSeason, 'MHShowSeason');
