
import { MHObject } from '../base/MHObject';
import { houndRequest } from '../../request/hound-request';

// MediaHound Action Object
export class MHAction extends MHObject {
  /* MHAction Constructor
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
   * MHAction Params
   *    Optional Param Props
   *      message     - { String }
   *      owners      - { Array }
   *      mentions    - { Array }
   *
   */
  constructor(args){
    args = MHObject.parseArgs(args);
    // Call Super Constructor
    super(args);

    // Default MHAction unique objects to null
    var message         = args.message        || null,
        primaryOwner    = args.primaryOwner   || null,
        primaryMention  = args.primaryMention || null;

    // Create imutable properties
    //  message, owners, mentions
    Object.defineProperties(this, {
      "message":{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        message
      },
      "primaryOwner":{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        primaryOwner
      },
      "primaryMention":{
        configurable: false,
        enumerable:   true,
        writable:     false,
        value:        primaryMention
      }
    });
  }

  //get displayableType(){ return ''; }

  static get rootEndpoint(){ return 'graph/action'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /** TODO docJS
   *  MHAction.commentWithMessage(message{string}, mentions{Array<MHObject>}, primaryMention{MHObject})
   *  creates a new comment
   */
  commentWithMessage(message, mentions, primaryMention){
    if( !message ||
        !mentions ||
        typeof message !== 'string' ||
        !Array.isArray(mentions) ||
        !mentions.every(x => x instanceof MHObject) )
    {
      throw new TypeError("Can't create comment without message string, and mentions array.");
    }

    var path = this.subendpoint('comment'),
        i = 0, postBody,
        length = mentions.length,
        mentionedMhids = [];

    for( ; i < length ; i++ ){
      mentionedMhids.push(mentions[i].mhid);
    }

    postBody = {
      'message':message,
      'mentions': mentionedMhids
    };
    if( primaryMention && primaryMention instanceof MHObject ){
      postBody.primaryMention = primaryMention.mhid;
    }
    return houndRequest({
        method: 'POST',
        endpoint: path,
        data: postBody
      })
      .then(res => {
        // update social counts of mentioned objects
        mentions.forEach(m => m.fetchSocial(true));
        return res;
      });
  }

  /** TODO docJS
   *
   */
  fetchOwners(force=false){
    var path = this.subendpoint('owners'),
        ownersPromise = this.ownersPromise || null;

    if( force || this.ownersPromise === null ){
      ownersPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(res){
          return Promise.all(res.map(m => MHObject.fetchByMhid(m)));
        });

      if( this.ownersPromise ){
        this.ownersPromise = ownersPromise;
      } else {
        Object.defineProperty(this, 'ownersPromise', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: ownersPromise
        });
      }
    }

    return this.ownersPromise;
  }

  /** TODO docJS
   *
   */
  fetchComments(force=false){
    var path = this.subendpoint('comments'),
        commentsPromise = this.commentsPromise || null;

    if( force || this.commentsPromise === null ){
      commentsPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(res){
          return Promise.all(res.map(m => MHObject.fetchByMhid(m)));
        });

      if( this.commentsPromise ){
        this.commentsPromise = commentsPromise;
      } else {
        Object.defineProperty(this, 'commentsPromise', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: commentsPromise
        });
      }
    }

    return this.commentsPromise;
  }

  /** TODO docJS
   *
   */
  fetchMentions(force=false){
    var path = this.subendpoint('mentions'),
        mentionsPromise = this.mentionsPromise || null;

    if( force || this.mentionsPromise === null ){
      mentionsPromise = houndRequest({
          method: 'GET',
          endpoint: path
        })
        .then(function(res){
          return Promise.all(res.map(m => MHObject.fetchByMhid(m)));
        });

      if( this.mentionsPromise ){
        this.mentionsPromise = mentionsPromise;
      } else {
        Object.defineProperty(this, 'mentionsPromise', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: mentionsPromise
        });
      }
    }

    return this.mentionsPromise;
  }
}

