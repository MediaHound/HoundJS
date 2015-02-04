// DEPRECATED
// // MediaHound Embedded Object
// export class MHEmbeddedObject {
//   /* MHEmbeddedObject Constructor
//    *
//    * MediaHound Object constructors take a single parameter {Object | JSON String}
//    * If the argument is an object properties will be read and placed properly
//    *  if a prop doesn't exist and is optional it will be replaced with a null value.
//    * If the argument is a string it will be passed through JSON.parse and then the constructor will continue as normal.
//    *
//    *  @param args - { Object | JSON String }
//    *
//    *
//    */
//   constructor(args) {
//     if( args == null ){
//       throw new TypeError('Args is null or undefined in MHEmbeddedObject constructor.');
//     }
//     if( typeof args === 'string' || args instanceof String ){
//       try{
//         args = JSON.parse(args);
//       } catch(e) {
//         throw new TypeError('Args typeof string but not JSON in MHEmbeddedObject', 'MHEmbeddedObject.js', 24);
//       }
//     }
//
//     if( args.mhid == null ){
//       throw new TypeError('mhid is null or undefined in MHEmbeddedObject constructor', 'MHEmbeddedObject.js', 29);
//     }
//
//     var mhid = args.mhid,
//         name = (args.name != null) ? args.name : null;
//
//
//     Object.defineProperties(this, {
//       'mhid':{
//         configurable: false,
//         enumerable: true,
//         writable: false,
//         value: mhid
//       },
//       'name':{
//         configurable: false,
//         enumerable: true,
//         writable: false,
//         value: name
//       }
//     });
//   }
//
//
// }
