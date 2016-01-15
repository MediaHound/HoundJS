import MHObject from '../base/MHObject.js';
import { MHSubscriptionMetadata } from '../meta/MHMetadata.js';

// MediaHound Subscription Object
export default class MHSubscription extends MHObject {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHSubscriptionMetadata
    };
  }

  static get mhidPrefix()   { return 'mhsub'; }
  static get rootEndpoint() { return 'graph/subscription'; }
}

MHObject.registerConstructor(MHSubscription, 'MHSubscription');
