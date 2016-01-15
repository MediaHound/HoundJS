import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export default class MHPagingInfo {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      next: String
    };
  }
}
