import MHObject from '../base/MHObject.js';
import { MHContributorMetadata } from '../meta/MHMetadata.js';

// MediaHound Contributor Object
export default class MHContributor extends MHObject {

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHContributorMetadata
    };
  }

  /*
   * TODO DocJS
   */
  get isGroup() {
    return !this.isIndividual;
  }

  /*
   * TODO DocJS
   */
  get isFictional() {
    return !this.isReal;
  }

  static get rootEndpoint() { return 'graph/contributor'; }

  /*
   * TODO DocJS
   */
   fetchMedia(view='full', size=12, force=false) {
     const path = this.subendpoint('media');
     return this.fetchPagedEndpoint(path, view, size, force);
   }
}
