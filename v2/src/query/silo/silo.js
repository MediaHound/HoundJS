import houndRequest from '../../request/hound-request.js';

export default ({ pattern, global, silosPerPage, itemsPerSilo, debug = false }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/silo',
    params: { pattern, global, silosPerPage, itemsPerSilo },
    responseType: 'silo',
    debug
  });
};
