import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import { MHObject } from '../base/MHObject.js';

export class MHRelationship {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      contribution: String,
      role: String,
      object: { mapper: MHObject.create }
    };
  }
}
