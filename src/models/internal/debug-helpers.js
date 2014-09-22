(function(){

  // Logging Helper
  var debug = false;
  var log = function(){
    if( console && (debug || window.mhDebug) ){
      console.log.apply(console, arguments);
    }
  };

  export default log;
})();
