import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHAudience extends MHTrait {
  static get mhidPrefix() { return 'mhaud'; }
}

MHObject.registerConstructor(MHAudience, 'MHAudience');

