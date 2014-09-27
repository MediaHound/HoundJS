

// MediaHound Social Object
export class MHSocial {
  /* MHSocial Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @param args - { Object | JSON String }
   *
   *  Optional Param Props (all type { Number }
   *      followers
   *      likers
   *      collectors
   *      mentioners
   *
   *      following
   *      ownedCollections'
   *
   *      userLikes
   *      userDislikes
   *      userFollows
   *
   *      items
   *
   *  // TODO TYPE ENUMS
   *  // TODO REMOVE DISLIKE?
   *
   */
  constructor(args) {
    if( typeof args === 'string' || args instanceof String ){
      try{
        args = JSON.parse(args);
      } catch(e) {
        throw new TypeError('Args typeof string but not JSON in MHSocial', 'MHSocial.js', 28);
      }
    }

    for( var prop of MHSocial.members ){
      var curr = typeof args[prop] === 'undefined' ? null : args[prop];
      Object.defineProperty(this, prop, {
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        curr
      });
    }
  }

  /**
   * TODO maybe just do a this[prop] === other[prop] check
   * @param {MHSocial} otherObj - another MHSocial object to check against
   * @returns {boolean}
   */
  isEqualToMHSocial(otherObj){
    for( var prop of MHSocial.members ){
      if( typeof this[prop] === 'number' && typeof otherObj[prop] === 'number' && this[prop] === otherObj[prop] ){
        continue;
      } else if( !this[prop] && !otherObj[prop] ){
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
  newWithAction(action){
    var newValue, toChange, alsoFlip,
        newArgs = {};

    switch(action){
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

    for( var prop of MHSocial.members ){
      if( prop === toChange ) {
        newArgs[prop] = newValue;
      } else if( prop === alsoFlip ) {
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
  static get UNDISLIKE(){ return 'undislike'; }

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
  static get COLLECT(){ return 'collect'; }
  static get COMMENT(){ return 'comment'; }

  /**
   * @private
   * @returns {string[]}
   */
  // Would be cool if it was 'private' but traceur isn't that smart...yet
  static get members(){
    return [
      'likers',           // int
      'followers',        // int
      'collectors',       // int
      'mentioners',       // int
      'following',        // int
      'ownedCollections', // int
      'items',            // int
      'userLikes',        // boolean
      'userDislikes',     // boolean
      'userFollows'       // boolean
    ];
  }

}

