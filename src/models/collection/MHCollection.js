import MHObject from '../base/MHObject.js';
import MHAction from '../action/MHAction.js';
import MHLoginSession from '../user/MHLoginSession.js';
import { MHCollectionMetadata } from '../meta/MHMetadata.js';

import houndRequest from '../../request/hound-request.js';

/**
 * @classdesc Mediahound Collection Object (MHCollection) inherits from MHObject
 */
export default class MHCollection extends MHObject {

  get jsonProperties() {
    return {
      ...super.jsonProperties,
      metadata: MHCollectionMetadata,
      firstContentImage: { mapper: MHObject.create },
      primaryOwner: { mapper: MHObject.create }
    };
  }

  static get mhidPrefix()   { return 'mhcol'; }
  static get rootEndpoint() { return 'graph/collection'; }

  /**
   * @param {string} name - the name of the new collection for the currently logged in user.
   * @returns {Promise<MHCollection>} - a Promise that resolves to the newly created MHCollection
   * @static
   */
  static createWithName(name, description) {
    var path = this.rootSubendpoint('new');
    var data = {};

    if (name) {
      data.name = name;
    }
    if (description) {
      data.description = description;
    }

    return houndRequest({
        method: 'POST',
        endpoint: path,
        data: data
      })
      .then(function(response) {
        return MHObject.fetchByMhid(response.metadata.mhid);
      })
      .then(function(newCollection) {
        if (MHLoginSession.openSession) {
          MHLoginSession.currentUser.fetchOwnedCollections('full',12,true);
        }
        return newCollection;
      });
  }


  /**
  * @param {string} name - the name of the new collection for the currently logged in user.
  * @returns {Promise<MHCollection>} - a Promise that resolves to the newly created MHCollection
  * @static
  */
  editMetaData(name, description) {
    var path = this.subendpoint('update'),
    data = {};

    if (description) {
      data = {
        'name':name,
        'description':description
      };
    }
    else if (name) {
      data = { 'name':name };
    }

    return houndRequest({
      method: 'PUT',
      endpoint: path,
      data: data
    })
    .then(function(response) {
      return MHObject.fetchByMhid(response.metadata.mhid);
    })
    .then(function(newCollection) {
      if (MHLoginSession.openSession) {
        MHLoginSession.currentUser.fetchOwnedCollections('full',12,true);
      }
      return newCollection;
    });
  }


  /**
   * @param {Array<MHMedia>} - an Array of MHMedia objects to add to this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  appendContent(contents) {
    const mhids = contents.map(m => {
      if (typeof m === 'string' || m instanceof String) {
        return m;
      }
      else if ('metadata' in m) {
        return m.metadata.mhid;
      }
      else {
        return m;
      }
    });
    return this.changeContents(contents, { operation: 'append', order: 0, ids: mhids });
  }

  /**
   * @param {Array<MHMedia>} - an Array of MHMedia objects to add to this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  prependContent(contents) {
    const mhids = contents.map(m => {
      if (typeof m === 'string' || m instanceof String) {
        return m;
      }
      else if ('metadata' in m) {
        return m.metadata.mhid;
      }
      else {
        return m;
      }
    });
    return this.changeContents(contents, { operation: 'prepend', order: 0, ids: mhids });
  }

  /**
   * @param {MHMedia} - a MHMedia object to remove from this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  removeContentAtIndex(index) {
    return this.removeContentAtIndexes([index]);
  }

  /**
   * @param {Array<MHMedia>} - an Array of MHMedia objects to remove from this collection
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  removeContentAtIndexes(indexes) {
    return this.changeContents(null, { operation: 'remove', order: 0, indices: indexes });
  }

  /**
   * @private
   * @param {Array<MHMedia>} - an Array of MHMedia objects to add or remove from this collection
   * @param {string} sub - the subendpoint string, 'add' or 'remove'
   * @returns {Promise} - a promise that resolves to the new list of content for this MHCollection
   */
  changeContents(contents, operation) {
    const path = this.subendpoint('update');
    return houndRequest({
      method: 'POST',
      endpoint: path,
      data: {
        operations: [operation],
        allowDuplicates: true
      }
    });
  }

  /**
   * @param {boolean} force - whether to force a call to the server instead of using the cached ownersPromise
   * @returns {Promise} - a promise that resolves to a list of mhids for the owners of this MHCollection
   */
  fetchOwners(view='full', size=12, force=false) {
    const path = this.subendpoint('owners');
    return this.fetchPagedEndpoint(path, view, size, force);
  }

  fetchContent(view='full', size=12, force=false, filters) {
    const path = this.subendpoint('content');
    const params = {};
    if (filters) {
      params.filters = filters;
    }
    return this.fetchPagedEndpoint(path, view, size, force, null, params);
  }
}

MHObject.registerConstructor(MHCollection, 'MHCollection');
