import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHStyleElement extends MHTrait {
  static get mhidPrefix() { return 'mhsty'; }
}

MHObject.registerConstructor(MHStyleElement, 'MHStyleElement');
