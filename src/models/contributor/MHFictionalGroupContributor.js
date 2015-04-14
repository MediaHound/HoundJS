
import { MHObject } from '../base/MHObject';
import { MHContributor } from './MHContributor';
import { houndRequest } from '../../request/hound-request';

// MediaHound Contributor Object
export class MHFictionalGroupContributor extends MHContributor {
  /* MHFictionalGroupContributor Constructor
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
      'contributorsPromise':{
        configurable: false,
        enumerable:   false,
        writable:     true,
        value:        null
      }
    });
  }

  get isIndividual(){ return false; }
  get isReal(){ return false; }

  static get mhidPrefix(){ return 'mhfgc'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

  /*
   * TODO DocJS
   *
   */
  fetchContributors(view='ids', force=false){
    var path = this.subendpoint('contributors');

    if( force || this.contributorsPromise === null ){
      this.contributorsPromise = houndRequest({
          method: 'GET',
          endpoint: path,
          params:{
            'view':view
          }
        })
        .catch( (err => { this.contributorsPromise = null; throw err; }).bind(this) )
        .then(function(parsed){
          if( view === 'full' && Array.isArray(parsed) ){
            parsed = MHObject.create(parsed);
          }
          return parsed;
        });
    }

    return this.contributorsPromise;
  }

}

(function(){
  MHObject.registerConstructor(MHFictionalGroupContributor, 'MHFictionalGroupContributor');
}());
