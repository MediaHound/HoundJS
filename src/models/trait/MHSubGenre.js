import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHSubGenre extends MHTrait {
  static get mhidPrefix() { return 'mhsgn'; }
}

MHObject.registerConstructor(MHSubGenre, 'MHSubGenre');
