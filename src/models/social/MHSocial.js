import { jsonCreateWithArgs } from '../internal/jsonParse.js';

// MediaHound Social Object
export default class MHSocial {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  /**
   * TODO maybe just do a this[prop] === other[prop] check
   * @param {MHSocial} otherObj - another MHSocial object to check against
   * @returns {boolean}
   */
  isEqualToMHSocial(otherObj) {
    for(var prop of Object.keys(this.jsonProperties)) {
      if ( typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop] ) {
        continue;
      } else if ( !this[prop] && !otherObj[prop] ) {
        continue;
      }
      return false;
    }
    return true;
  }

  /**
   * Returns a new social object with the expected change of a given action
   * @private
   * @param action - MHSocial.ACTION to take on this social object
   * @returns {MHSocial} - A new MHSocial object that represents the expected outcome
   */
  newWithAction(action) {
    var newValue, toChange, alsoFlip,
        newArgs = {};

    switch(action) {
      case MHSocial.LIKE:
        toChange = 'likers';
        newValue = this.likers + 1;
        alsoFlip = 'userLikes';
        break;
      case MHSocial.UNLIKE:
        toChange = 'likers';
        newValue = this.likers - 1;
        alsoFlip = 'userLikes';
        break;
      case MHSocial.DISLIKE:
      case MHSocial.UNDISLIKE:
        alsoFlip = 'userDislikes';
        break;
      case MHSocial.FOLLOW:
        toChange = 'followers';
        newValue = this.followers + 1;
        alsoFlip = 'userFollows';
        break;
      case MHSocial.UNFOLLOW:
        toChange = 'followers';
        newValue = this.followers - 1;
        alsoFlip = 'userFollows';
        break;
      case MHSocial.COLLECT:
        toChange = 'collectors';
        newValue = this.collectors + 1;
        break;
      default:
        break;
    }

    for(var prop of Object.keys(this.jsonProperties)) {
      if ( prop === toChange ) {
        newArgs[prop] = newValue;
      } else if ( prop === alsoFlip ) {
        newArgs[prop] = !this[prop];
      } else {
        newArgs[prop] = this[prop];
      }
    }

    return new MHSocial(newArgs);
  }

  /**
   * Social Action Types
   *
   */
  static get LIKE()   { return 'like';   }
  static get UNLIKE() { return 'unlike'; }

  static get DISLIKE()  { return 'dislike';   }
  static get UNDISLIKE() { return 'undislike'; }

  static get FOLLOW()   { return 'follow';   }
  static get UNFOLLOW() { return 'unfollow'; }

  static get SOCIAL_ACTIONS() {
    return [
      MHSocial.LIKE,
      MHSocial.UNLIKE,
      MHSocial.DISLIKE,
      MHSocial.UNDISLIKE,
      MHSocial.FOLLOW,
      MHSocial.UNFOLLOW
    ];
  }

  static get POST()   { return 'post';    }
  static get COLLECT() { return 'collect'; }
  static get COMMENT() { return 'comment'; }

  get jsonProperties() {
    return {
      'likers': Number,
      'followers': Number,
      'collectors': Number,
      'mentioners': Number,
      'following': Number,
      'ownedCollections': Number,
      'items': Number,
      'userLikes': Boolean,
      'userDislikes': Boolean,
      'userFollows': Boolean,
      'isFeatured': Boolean,
      'userConnected': Boolean,
      'userPreference': Boolean,
    };
  }
}
