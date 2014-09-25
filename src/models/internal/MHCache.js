/*global System */

import { log } from './debug-helpers';
/**
 * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
 * recently used items while discarding least recently used items when its limit
 * is reached.
 *
 * Implementation inspired by:
 *    Rasmus Andersson <http://hunch.se/>
 *    https://github.com/rsms/js-lru
 *
 * Licensed under MIT. Copyright (c) 2014 MediaHound Inc. <http://mediahound.com/>
 *
 * Items are added to the end of the list, that means that the tail is the newest item
 * and the head is the oldest item.
 *
 * head(oldest) --.newer--> entry --.newer--> tail(newest)
 *    and
 * head(oldest) <--older.-- entry <--older.-- tail(newest)
 *
 */
export class MHCache {
  constructor(limit){
    // Current size of the cache.
    this.size = 0;

    // Maximum number of items this cache can hold.
    this.limit = limit;
    this._keymap = {};
  }

  /**
   * Put <value> into the cache associated with <key>. Returns the entry which was
   * removed to make room for the new entry. Otherwise undefined is returned
   * (i.e. if there was enough room already).
   *
   * TODO: Bug if put same value can get multiple instances of entry in list
   */
  put(key, value, altId) {
    var entry = {key:key, value:value, altId:altId};
    log('putting: ', entry);
    // Note: No protection against replacing, and thus orphan entries. By design.
    this._keymap[key] = entry;
    if (this.tail) {
      // link previous tail to the new tail (entry)
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      // we're first in -- yay
      this.head = entry;
    }
    // add new entry to the end of the linked list -- it's now the freshest entry.
    this.tail = entry;
    if (this.size === this.limit) {
      // we hit the limit -- remove the head
      return this.shift();
    } else {
      // increase the size counter
      this.size++;
    }
  }

  // convenience for putting an MHObject
  putMHObj(mhObj){
    if( mhObj && mhObj.mhid && mhObj.username ){
      return this.put(mhObj.mhid, mhObj, mhObj.username);
    }
    if( mhObj && mhObj.mhid ){
      return this.put(mhObj.mhid, mhObj, mhObj.altId);
    }
  }

  /**
   * Purge the least recently used (oldest) entry from the cache. Returns the
   * removed entry or undefined if the cache was empty.
   *
   * If you need to perform any form of finalization of purged items, this is a
   * good place to do it. Simply override/replace this function:
   *
   *   var c = new MHCache(123);
   *   c.shift = function() {
   *     var entry = MHCache.prototype.shift.call(this);
   *     doSomethingWith(entry);
   *     return entry;
   *   }
   */
  shift(){
    // todo: handle special case when limit == 1
    var entry = this.head;
    if (entry) {
      if (this.head.newer) {
        this.head = this.head.newer;
        this.head.older = undefined;
      } else {
        this.head = undefined;
      }
      // Remove last strong reference to <entry> and remove links from the purged
      // entry being returned:
      entry.newer = entry.older = undefined;
      // delete is slow, but we need to do this to avoid uncontrollable growth:
      delete this._keymap[entry.key];
    }
    return entry;
  }


  /**
   * Get and register recent use of <key>. Returns the value associated with <key>
   * or undefined if not in cache.
   */
  get(key){
    // First, find our cache entry
    var entry = this._keymap[key];
    if (entry === undefined) { return; } // Not cached. Sorry.
    // As <key> was found in the cache, register it as being requested recently
    if (entry === this.tail) {
      // Already the most recently used entry, so no need to update the list
      log('getting from cache (is tail): ', entry);
      return entry.value;
    }
    // HEAD--------------TAIL
    //   <.older   .newer>
    //  <--- add direction --
    //   A  B  C  <D>  E
    if (entry.newer) {
      if (entry === this.head) {
        this.head = entry.newer;
      }
      entry.newer.older = entry.older; // C <-- E.
    }
    if (entry.older) {
      entry.older.newer = entry.newer; // C. --> E
    }
    entry.newer = undefined; // D --x
    entry.older = this.tail; // D. --> E
    if (this.tail){
      this.tail.newer = entry; // E. <-- D
    }
    this.tail = entry;
    log('getting from cache: ', entry);
    return entry.value;
  }

  /**
   *
   * @param altId
   * @returns {MHObject|undefined}
   */
  getByAltId(altId){
    var entry = this.tail;
    while(entry){
      if( entry.altId === altId){
        log('found altId ' + altId + ', getting from cache');
        return this.get(entry.key);
      }
      entry = entry.older;
    }
  }

  /**
   * Check if <key> is in the cache without registering recent use. Feasible if
   * you do not want to change the state of the cache, but only "peek" at it.
   * Returns the entry associated with <key> if found, or undefined if not found.
   */
  find(key){
    return this._keymap[key];
  }

  /**
   * Check if <key> is in the cache without registering recent use.
   * Returns true if key exists.
   */
  has(key){
    return this._keymap[key] !== undefined;
  }

  /**
   *
   * @param altId
   * @returns {boolean}
   */
  hasAltId(altId){
    var entry = this.tail;
    while(entry){
      if( entry.altId === altId ){
        return true;
      }
      entry = entry.older;
    }
    return false;
  }

  /**
   * Remove entry <key> from cache and return its value. Returns undefined if not
   * found.
   */
  remove(key){
    var entry = this._keymap[key];
    if (!entry) { return; }
    delete this._keymap[entry.key];
    if (entry.newer && entry.older) {
      // link the older entry with the newer entry
      entry.older.newer = entry.newer;
      entry.newer.older = entry.older;
    } else if (entry.newer) {
      // remove the link to us
      entry.newer.older = undefined;
      // link the newer entry to head
      this.head = entry.newer;
    } else if (entry.older) {
      // remove the link to us
      entry.older.newer = undefined;
      // link the newer entry to head
      this.tail = entry.older;
    } else {
      this.head = this.tail = undefined;
    }

    this.size--;
    return entry.value;
  }

  /** Removes all entries */
  removeAll(){
    // This should be safe, as we never expose strong references to the outside
    this.head = this.tail = undefined;
    this.size = 0;
    this._keymap = {};
  }

  /**
   * Get all keys stored in keymap
   * Array returned is in an arbitrary order
   */
  keys(){
    return Object.keys(this._keymap);
  }

  forEach(callback){
    if( typeof callback === 'function' ){
      var entry = this.head,
          index = 0;
      while (entry) {
        callback(entry.value, index, this);
        index++;
        entry = entry.newer;
      }
    }
  }

  /**
   * Create an array of stored objects and
   * @param {string='mhLocalCache'} storageKey - key to save to local storage to
   *
   * save to localStorage
   * objects are JSON.stringiy-ed with promise properties removed
   *
   */
  saveToLocalStorage(storageKey='mhLocalCache'){
    var arr = [],
        entry = this.head,
        replacer = function(key, value){
          if( (/promise|request/gi).test(key) ){
            return;
          }
          return value;
        };
    log('saving to localStorage');
    while (entry) {
      log('adding to arry: ', JSON.stringify(entry.value, replacer));
      arr.push(JSON.stringify(entry.value, replacer));
      entry = entry.newer;
    }
    log('adding to localStorage: ', JSON.stringify(arr));
    localStorage[storageKey] = JSON.stringify(arr);
  }

  /**
   * Fill cache localStorage.mhLocalCache
   * @param {string='mhLocalCache'} storageKey
   */
  restoreFromLocalStorage(storageKey='mhLocalCache'){
    var MHObject = System.get('../../src/models/base/MHObject').MHObject;
    //console.log('circular dep: ', MHObject);

    if( !localStorage || typeof localStorage[storageKey] === 'undefined' ){
      log('nothing stored');
      return;
    }
    var i = 0, curr,
        stored = JSON.parse(localStorage[storageKey]);

    for( ; i < stored.length ; i++ ){
      curr = MHObject.create(stored[i]);
      if( curr && !this.has(curr.mhid) ){
        log('adding to cache: ', curr);
        this.putMHObj(curr);
      }
    }
  }
}

