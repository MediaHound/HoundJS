import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHSubMood extends MHTrait {
  static get mhidPrefix() { return 'mhsmd'; }
}

MHObject.registerConstructor(MHSubMood, 'MHSubMood');
