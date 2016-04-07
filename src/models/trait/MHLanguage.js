import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHLanguage extends MHTrait {
  static get mhidPrefix() { return 'mhlng'; }
}

MHObject.registerConstructor(MHLanguage, 'MHLanguage');
