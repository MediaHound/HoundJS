
import { MHObject } from '../base/MHObject.js';
import { MHSubscriptionMetadata } from '../meta/MHMetadata.js';

// MediaHound Subscription Object
export class MHSubscription extends MHObject {
  get jsonProperties() {
    return Object.assign({}, super.jsonProperties, {
      metadata: MHSubscriptionMetadata
    });
  }

  static get mhidPrefix()   { return 'mhsub'; }
  static get rootEndpoint() { return 'graph/subscription'; }
}

(function(){
  MHObject.registerConstructor(MHSubscription, 'MHSubscription');
})();
