
import { jsonCreateWithArgs } from '../internal/jsonParse.js';
import MHPagingInfo from './MHPagingInfo.js';
import MHRelationalPair from './MHRelationalPair.js';

export default class MHPagedResponse {
  constructor(args) {
    this.cachedNextResponse = null;
    this.fetchNextOperation = null;

    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      content: [MHRelationalPair],
      pagingInfo: MHPagingInfo
    };
  }

  get hasMorePages() {
    return (this.pagingInfo.next !== undefined && this.pagingInfo.next !== null);
  }

  fetchNext() {
    const cachedResponse = this.cachedNextResponse;
    if (cachedResponse) {
      return new Promise(function(resolve) {
        resolve(cachedResponse);
      });
    }

    return this.fetchNextOperation(this.pagingInfo.next)
      .then(response => {
        this.cachedNextResponse = response;
        return response;
      });
  }
}
