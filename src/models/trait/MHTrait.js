import MHObject from '../base/MHObject.js';
import { MHTraitMetadata } from '../meta/MHMetadata.js';

export default class MHTrait extends MHObject {
  static get rootEndpoint() { return 'graph/trait'; }

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHTraitMetadata
    };
  }

  fetchContent(view='full', size=12, force=false) {
    var path = this.subendpoint('content');
    return this.fetchPagedEndpoint(path, view, size, force);
  }
}
