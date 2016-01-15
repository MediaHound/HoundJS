import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export default class MHImageData {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      url: String,
      width: Number,
      height: Number
    };
  }
}
