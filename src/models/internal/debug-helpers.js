
// Logging Helper
var debug = {
  log:    false,
  warn:   (window.location.host === 'local.mediahound.com:2014'),
  error:  (window.location.host === 'local.mediahound.com:2014')
};

var isDevAndDebug = function(){
  return window.mhDebug && (window.location.host === 'local.mediahound.com:2014');
};

export var log = function(override, ...args){
  if( typeof override !== 'boolean' ){
    args.unshift(override);
    override = false;
  }
  if( console && console.log && (override || debug.log || isDevAndDebug()) ){
    console.log.apply(console, arguments);
  }
};

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
