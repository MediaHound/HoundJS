import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHTheme extends MHTrait {
  static get mhidPrefix() { return 'mhthm'; }
}

MHObject.registerConstructor(MHTheme, 'MHTheme');
