import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Movie Series Object
export default class MHMovieSeries extends MHMedia {
  static get mhidPrefix() { return 'mhmvs'; }
}

MHObject.registerConstructor(MHMovieSeries, 'MHMovieSeries');
