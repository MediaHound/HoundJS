import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound ShowSeries (Track) Object
export default class MHShowSeries extends MHMedia {
  static get mhidPrefix() { return 'mhsss'; }
}

MHObject.registerConstructor(MHShowSeries, 'MHShowSeries');
