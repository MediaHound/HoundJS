import MHObject from '../base/MHObject.js';
import MHAction from './MHAction.js';

// MediaHound Like Object
export default class MHLike extends MHAction {
  static get mhidPrefix() { return 'mhlke'; }
}

MHObject.registerConstructor(MHLike, 'MHLike');
