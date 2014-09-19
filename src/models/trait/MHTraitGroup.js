/*global MHObject */
// MediaHound Trait Group Object

export class MHTraitGroup extends MHObject {
  /* MHMedia Constructor
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
   *      secondaryImage  - { MHImage }
   *      createdDate     - { String | Date }
   *
   */
  constructor(args) {
    args = MHObject.parseArgs(args);
    super(args);
    // No Unique items
    // TODO add trait group props
  }

  static get mhidPrefix() { return 'mhtrg'; }
  get displayableType()   { return 'Trait Group'; }

  // Could change as needed
  toString(){
    return super.toString();
  }

}

(function(){
  MHObject.registerConstructor(MHTraitGroup);
})();

