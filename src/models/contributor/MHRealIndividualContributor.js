
import { MHObject } from '../base/MHObject';
import { MHContributor } from './MHContributor';
import { pagedRequest } from '../../request/hound-paged-request';

// MediaHound Contributor Object
export class MHRealIndividualContributor extends MHContributor {
  /* MHRealIndividualContributor Constructor
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
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);

    Object.defineProperties(this, {
      // Props
      // Promises
      'characters':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }


  get isIndividual(){ return true; }
  get isReal(){ return true; }

  static get mhidPrefix(){ return 'mhric'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /*
   * TODO DocJS
   *  fetchCharacters
   *
   */
  fetchCharacters(view='full', size=12, force=true){
    var path = this.subendpoint('characters');
    if( force || this.characters === null ){
      this.characters = pagedRequest({
        method: 'GET',
        endpoint: path,
        pageSize: size,
        params: { view }
      });
    }
    //console.log(this.feedPagedRequest);
    return this.characters;
  }

}

(function(){
  MHObject.registerConstructor(MHRealIndividualContributor);
}());
