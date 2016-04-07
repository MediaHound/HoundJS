import MHObject from '../base/MHObject.js';
import MHTrait from './MHTrait.js';

// MediaHound Trait Object
export default class MHAudioTrait extends MHTrait {
  static get mhidPrefix() { return 'mhado'; }
}

MHObject.registerConstructor(MHAudioTrait, 'MHAudioTrait');
