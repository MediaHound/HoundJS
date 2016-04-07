import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHSuitability extends MHTrait {
  static get mhidPrefix() { return 'mhstb'; }
}

MHObject.registerConstructor(MHSuitability, 'MHSuitability');
