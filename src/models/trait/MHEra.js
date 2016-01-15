import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHEra extends MHTrait {
  static get mhidPrefix() { return 'mhera'; }
}

MHObject.registerConstructor(MHEra, 'MHEra');
