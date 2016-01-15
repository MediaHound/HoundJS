import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import MHRelationship from './MHRelationship.js';
import MHSorting from './MHSorting.js';
import MHSourceMedium from '../source/MHSourceMedium.js';

export default class MHContext {
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
