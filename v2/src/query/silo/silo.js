import houndRequest from '../../request/hound-request.js';

export default ({ patterns, sharedPatterns, global, silosPerPage, itemsPerSilo, debug = false }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/silo',
    params: { patterns, sharedPatterns, global, silosPerPage, itemsPerSilo },
    responseType: 'silo',
    debug,
    paramsProper: true
  });
};
