
import { MHObject } from '../base/MHObject.js';

export class MHImage extends MHObject {
  static get mhidPrefix()   { return 'mhimg'; }
  static get rootEndpoint() { return 'graph/image'; }
}

(function(){
  MHObject.registerConstructor(MHImage, 'MHImage');
}());
