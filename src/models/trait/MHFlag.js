import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHFlag extends MHTrait {
  static get mhidPrefix() { return 'mhflg'; }
}

MHObject.registerConstructor(MHFlag, 'MHFlag');
