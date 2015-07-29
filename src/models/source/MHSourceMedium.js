
import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import { MHSourceMethod } from './MHSourceMethod.js';

// MediaHound SourceMedium Object
export class MHSourceMedium {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      type: String,
      methods: [MHSourceMethod]
    };
  }

  methodForType(type) {
    return this.methods.filter( method => {
      return method.type === type;
    })[0];
  }

  static get TYPE_STREAM()   { return 'stream'; }
  static get TYPE_DOWNLOAD() { return 'download'; }
  static get TYPE_DELIVER()  { return 'deliver'; }
  static get TYPE_PICKUP()   { return 'pickup'; }
  static get TYPE_ATTEND()   { return 'attend'; }
}
