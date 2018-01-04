import houndRequest from '../../request/hound-request.js';

export default ({ patterns, sharedPatterns, global, silosPerPage, itemsPerSilo, debug = false, method = 'GET', useHimitsu = true }) => {
  return houndRequest({
    method,
    endpoint: 'graph/silo',
    params: { patterns, sharedPatterns, global, silosPerPage, itemsPerSilo },
    responseType: 'silo',
    debug,
    paramsProper: true,
    useHimitsu
  });
};
