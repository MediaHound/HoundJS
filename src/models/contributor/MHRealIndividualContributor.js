
import { MHContributor } from './MHContributor.js';
import { houndRequest } from '../../request/hound-request.js';

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
      'charactersPromise':{
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
  fetchCharacters(view='ids', force=false){
    var path = this.subendpoint('characters');

    if( force || this.charactersPromise === null ){
      this.charactersPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params:{
            'view':view
          }
        })
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.charactersPromise;
  }

}

(function(){
  MHObject.registerConstructor(MHRealIndividualContributor);
}());
