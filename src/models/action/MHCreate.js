import MHObject from '../base/MHObject.js';
import MHAction from './MHAction.js';

// MediaHound Create Object
export default class MHCreate extends MHAction {
  static get mhidPrefix() { return 'mhcrt'; }
}

MHObject.registerConstructor(MHCreate, 'MHCreate');
