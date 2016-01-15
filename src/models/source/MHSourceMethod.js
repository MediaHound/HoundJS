import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import MHSourceFormat from './MHSourceFormat.js';

// MediaHound SourceMethod Object
export default class MHSourceMethod {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      type: String,
      formats: [MHSourceFormat]
    };
  }

  formatForType(type) {
    return this.formats.filter( format => {
      return format.type === type;
    })[0];
  }

  static get TYPE_PURCHASE()     { return 'purchase'; }
  static get TYPE_RENTAL()       { return 'rental'; }
  static get TYPE_SUBSCRIPTION() { return 'subscription'; }
  static get TYPE_ADSUPPORTED()  { return 'adSupported'; }
}
