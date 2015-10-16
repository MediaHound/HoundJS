
import { MHObject } from '../base/MHObject.js';
import { MHSourceMetadata } from '../meta/MHMetadata.js';

// MediaHound Source Master Object
export class MHSource extends MHObject {

  static get rootEndpoint() { return 'graph/source'; }
  static get mhidPrefix()   { return 'mhsrc'; }

  get jsonProperties() {
    return Object.assign({}, super.jsonProperties, {
      metadata: MHSourceMetadata,
      subscriptions: [{ mapper: MHObject.create }] // TODO: It would be nicer to be able to just say [MHSubscription]
    });
  }

  static fetchAllSources(view="full", size=100, force=false){
    var path = this.rootSubendpoint('all');
    return this.fetchRootPagedEndpoint(path, {}, view, size, force);
  }
}

(function(){
  MHObject.registerConstructor(MHSource, 'MHSource');
})();
