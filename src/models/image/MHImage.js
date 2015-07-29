
import { MHObject } from '../base/MHObject.js';
import { MHImageMetadata } from '../meta/MHMetadata.js';

export class MHImage extends MHObject {
  static get mhidPrefix()   { return 'mhimg'; }
  static get rootEndpoint() { return 'graph/image'; }

  get jsonProperties() {
    return Object.assign({}, super.jsonProperties, {
      metadata: MHImageMetadata
    });
  }
}

(function(){
  MHObject.registerConstructor(MHImage, 'MHImage');
}());
