import { jsonCreateWithArgs } from '../internal/jsonParse.js';

import MHRelationalPair from '../container/MHRelationalPair.js';

// MediaHound User Social Object
export default class MHUserSocial {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      'userLikes': Boolean,
      'userDislikes': Boolean,
      'userFollows': Boolean,
      'userConnected': Boolean,
      'userPreference': Boolean,
      'userDefaultCollections': [MHRelationalPair],
    };
  }
}
