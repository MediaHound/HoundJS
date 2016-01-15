import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Graphic Novel Series Object
export default class MHGraphicNovelSeries extends MHMedia {
  static get mhidPrefix() { return 'mhgns'; }
}

MHObject.registerConstructor(MHGraphicNovelSeries, 'MHGraphicNovelSeries');
