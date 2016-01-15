import MHObject from '../base/MHObject.js';
import MHActionMetadata from '../meta/MHMetadata.js';

// MediaHound Action Object
export default class MHAction extends MHObject {

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHActionMetadata,
      primaryOwner: { mapper: MHObject.create },
      primaryMention: { mapper: MHObject.create }
    };
  }

  static get rootEndpoint() { return 'graph/action'; }
}
