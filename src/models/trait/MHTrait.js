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

  static CompositionType = {
    exact: 'exact',
    subset: 'subset',
    superset: 'superset'
  };

  static fetchComposition(traits, types=null, view='full', size=10) {
    const path = this.rootSubendpoint('composition');
    const params = { trait: traits };
    if (types) {
      params.type = types;
    }
    return this.fetchRootBucketedEndpoint(path, view, size, null, params);
  }
}
