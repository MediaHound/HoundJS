
import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export class MHImageData {
  constructor(args){
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
