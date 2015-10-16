import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export class MHSorting {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      importance: Number,
      position: Number
    };
  }
}
