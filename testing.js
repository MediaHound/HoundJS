/**
 * Created by Ryan Bogle on 9/22/14.
 */


var traceur = require('traceur'),
    fs = require('fs');

var options = {
  out:'build/test/compiled.js',
  modules:'amd'
};

console.log(traceur);

var houndApi = fs.readFileSync('./src/hound-api.js').toString();


var ret = traceur.compile(houndApi, options);

console.log(ret);