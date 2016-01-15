import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export default class MHSorting {
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
