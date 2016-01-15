import MHObject from '../base/MHObject.js';
import MHMedia from './MHMedia.js';

// MediaHound Graphic Novel Object
export default class MHGraphicNovel extends MHMedia {
  static get mhidPrefix() { return 'mhgnl'; }
}

MHObject.registerConstructor(MHGraphicNovel, 'MHGraphicNovel');
