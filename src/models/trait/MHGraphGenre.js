import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHGraphGenre extends MHTrait {
  static get mhidPrefix() { return 'mhgrg'; }
}

MHObject.registerConstructor(MHGraphGenre, 'MHGraphGenre');
