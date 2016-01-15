import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHQuality extends MHTrait {
  static get mhidPrefix() { return 'mhqlt'; }
}

MHObject.registerConstructor(MHQuality, 'MHQuality');
