import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHType extends MHTrait {
  static get mhidPrefix() { return 'mhtyp'; }
}

MHObject.registerConstructor(MHType, 'MHType');
