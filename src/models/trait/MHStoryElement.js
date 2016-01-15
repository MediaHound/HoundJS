import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHStoryElement extends MHTrait {
  static get mhidPrefix() { return 'mhstr'; }
}

MHObject.registerConstructor(MHStoryElement, 'MHStoryElement');
