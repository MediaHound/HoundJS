import { jsonCreateWithArgs } from '../internal/jsonParse.js';

// MediaHound Social Metrics Object
export default class MHSocialMetrics {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      'likers': Object,
      'followers': Object,
      'mentioners': Object,
      'collections': Object,
      'liking': Object,
      'following': Object,
      'ownedCollections': Object,
      'content': Object
    };
  }
}
