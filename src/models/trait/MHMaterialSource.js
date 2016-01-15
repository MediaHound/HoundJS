import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHMaterialSource extends MHTrait {
  static get mhidPrefix() { return 'mhmts'; }
}

MHObject.registerConstructor(MHMaterialSource, 'MHMaterialSource');
