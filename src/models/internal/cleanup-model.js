
import { MHObject } from '../base/MHObject.js';

// Remove register constructor
delete MHObject.registerConstructor;

// Rebuild Cache from localStorage
//mhidLRU.restoreFromLocalStorage();

// Save LRU cache when window is closed
/* Disabled
window.addEventListener('unload', function(evt){
  mhidLRU.saveToLocalStorage();
});
*/
