
import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import { MHObject } from '../base/MHObject.js';
import { MHSourceMedium } from '../source/MHSourceMedium.js';

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

export class MHContext {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      consumable: Boolean,
      sorting: MHSorting,
      relationships: [MHRelationship],
      mediums: [MHSourceMedium]
    };
  }
}
