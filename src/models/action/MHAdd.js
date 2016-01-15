import MHObject from '../base/MHObject.js';
import MHAction from './MHAction.js';

// MediaHound Add Object
export default class MHAdd extends MHAction {
  static get mhidPrefix() { return 'mhadd'; }
}

MHObject.registerConstructor(MHAdd, 'MHAdd');
