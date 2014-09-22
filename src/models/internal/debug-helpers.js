
// Logging Helper
var debug = false;
export var log = function(){
  if( console && (debug || window.mhDebug) ){
    console.log.apply(console, arguments);
  }
};

