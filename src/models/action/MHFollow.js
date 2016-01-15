import MHObject from '../base/MHObject.js';
import MHAction from './MHAction.js';

// MediaHound Follow Object
export default class MHFollow extends MHAction {
  static get mhidPrefix() { return 'mhflw'; }
}

MHObject.registerConstructor(MHFollow, 'MHFollow');
