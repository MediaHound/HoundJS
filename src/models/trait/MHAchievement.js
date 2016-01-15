import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHAchievement extends MHTrait {
  static get mhidPrefix() { return 'mhach'; }
}

MHObject.registerConstructor(MHAchievement, 'MHAchievement');
