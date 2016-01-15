import MHObject from '../base/MHObject.js';
import { MHImageMetadata } from '../meta/MHMetadata.js';

export default class MHImage extends MHObject {
  static get mhidPrefix()   { return 'mhimg'; }
  static get rootEndpoint() { return 'graph/image'; }

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHImageMetadata
    };
  }
}

MHObject.registerConstructor(MHImage, 'MHImage');
