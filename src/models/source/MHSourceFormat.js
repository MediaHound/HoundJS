import { jsonCreateWithArgs } from '../internal/jsonParse.js';

// MediaHound SourceFormat Object
export default class MHSourceFormat {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      type: String,
      price: String,
      currency: String,
      timePeriod: String,
      launchInfo: Object,
      contentCount: Number
    };
  }

  get displayPrice() {
    return '$' + this.price;
  }
}
