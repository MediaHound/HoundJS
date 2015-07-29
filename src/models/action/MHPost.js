
import { MHObject } from '../base/MHObject.js';
import { MHAction } from './MHAction.js';
import { houndRequest } from '../../request/hound-request.js';

// MediaHound Post Object
export class MHPost extends MHAction {

  static get mhidPrefix() { return 'mhpst'; }

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

    var path = this.rootSubendpoint('new'),
        mentionedMhids = mentions.map(m => m.metadata.mhid);

    return houndRequest({
        method: 'POST',
        endpoint: path,
        data: {
          'message': message,
          'mentions': mentionedMhids,
          'primaryMention': primaryMention.metadata.mhid
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
