
// Logging Helper
var debug = {
  log:    true,
  warn:   true, //( (/(local\.mediahound\.com:2014)|(stag-www\.mediahound\.com)/).test(window.location.host) ),
  error:  true  //( (/(local\.mediahound\.com:2014)|(stag-www\.mediahound\.com)/).test(window.location.host) )
};

var isDevAndDebug = function(){
  return window.mhDebug && (window.location.host === 'local.mediahound.com:2014');
};

// TODO change so that log takes override and returns console function so that console shows correct line number
export var log = function(override, ...args){
  if( typeof override !== 'boolean' ){
    args.unshift(override);
    override = false;
  }
  if( console && console.log && (override || debug.log || isDevAndDebug()) ){
    console.log.apply(console, arguments);
  }
};

/*
export var log = function(...args){
  if( typeof args[0] !== 'boolean' ){
    return log(false);
  }
  if( console && console.log && ( args[0] || debug.log || isDevAndDebug() ) ){
    return console.log.bind(console);
  }
};
 */

export var warn = function(override, ...args){
  if( typeof override !== 'boolean' ){
    args.unshift(override);
    override = false;
  }
  if( console && console.warn && (override || debug.warn || isDevAndDebug()) ){
    console.warn.apply(console, args);
  }
};

export var error = function(override, ...args){
  if( typeof override !== 'boolean' ){
    args.unshift(override);
    override = false;
  }
  if( console && console.error && (override || debug.error || isDevAndDebug()) ){
    console.error.apply(console, args);
  }
};
