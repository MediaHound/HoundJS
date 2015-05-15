
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';
import { houndRequest } from '../../request/hound-request.js';

// MediaHound Post Object
export class MHPost extends MHAction {
  /* MHPost Constructor
   *
   * MediaHound Object constructors take a single parameter {Object | JSON String}
   * If the argument is an object properties will be read and placed properly
   *  if a prop doesn't exist and is optional it will be replaced with a null value.
   * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
   *
   *  @constructor
   *    @param args - { Object | JSON String }
   *
   * Inherited from MHObject
   *    Require Param Props
   *      mhid    - { MediaHound ID string }
   *
   *    Optional Param Props
   *      name            - { String }
   *      primaryImage    - { MHImage }
   *      createdDate     - { String | Date }
   *
   * Inherited from MHAction
   *    Optional Param Props
   *      message     - { String }
   *      owners      - { Array }
   *      mentions    - { Array }
   *
   * MHPost Params
   *    No Unique
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // No Unique Props
  }

  static get mhidPrefix() { return 'mhpst'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /**
   *
   * MHPost.createWithMessage(message{String}, mentions{Array<MHObject>}, primaryMention{MHObject})
   *
   * @param {string} message - the message for this new post
   */
  static createWithMessage(message, mentions, primaryMention){
    if( !message ||
        !mentions ||
        !primaryMention ||
        typeof message !== 'string' ||
        !Array.isArray(mentions) ||
        !mentions.every(x => x instanceof MHObject) ||
        !(primaryMention instanceof MHObject) )
    {
      throw new TypeError("Can't create post without message string, mentions array, and primary mention object.");
    }

    var path = MHPost.rootEndpoint + '/new',
        mentionedMhids = mentions.map(m => m.mhid);

    return houndRequest({
        method: 'POST',
        endpoint: path,
        data: {
          'message':message,
          'mentions':mentionedMhids,
          'primaryMention':primaryMention.mhid
        }
      })
      .then(res => {
        // update social counts of mentioned objects
        mentions.forEach(m => m.fetchSocial(true));
        return res;
      });
  }

}

(function(){
  MHObject.registerConstructor(MHPost, 'MHPost');
})();

