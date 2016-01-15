import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHGenre extends MHTrait {
  static get mhidPrefix() { return 'mhgnr'; }
}

MHObject.registerConstructor(MHGenre, 'MHGenre');
