
import { MHObject } from './MHObject.js';
import { MHContext } from '../meta/MHContext.js';
import { jsonCreateWithArgs } from '../internal/jsonParse.js';

// MediaHound Relational Pair Object
export class MHRelationalPair {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      context: MHContext,
      object: { mapper: MHObject.create }
    };
  }
}
