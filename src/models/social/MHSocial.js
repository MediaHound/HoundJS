

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
   *      mentioners
   *      following
   *      ownedCollections'
   *      userLikes
   *      userDislikes
   *      userFollows
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

    for( var curr of MHSocial.members ){
      //if( typeof args[curr] === 'number' || typeof args[curr] === 'boolean' ){
        Object.defineProperty(this, curr, {
          configurable: false,
          enumerable:   true,
          writable:     false,
          value:        args[curr]
        });
      //}
    }
  }

  // Would be cool if it was 'private' but traceur isn't that smart...yet
  static get members(){
    return [
      'followers',
      'likers',
      'collectors',
      'mentioners',
      'following',
      'ownedCollections',
      'userLikes',
      'userDislikes',
      'userFollows',
      'items'
    ];
  }

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
}

