import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHGraphTrait extends MHTrait {
  static get mhidPrefix() { return 'mhgrg'; }
}

MHObject.registerConstructor(MHGraphTrait, 'MHGraphTrait');
