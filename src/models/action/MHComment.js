import MHObject from '../base/MHObject.js';
import MHAction from './MHAction.js';

// MediaHound Comment Object
export default class MHComment extends MHAction {
  static get mhidPrefix() { return 'mhcmt'; }
}

MHObject.registerConstructor(MHComment, 'MHComment');
