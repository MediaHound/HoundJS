import houndRequest from '../../request/hound-request.js';

export default ({ filters, sort, components, pageSize, debug = false, method = 'GET', useHimitsu = true }) => {
  return houndRequest({
    method,
    endpoint: 'graph/explore',
    params: { filters, sort, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse',
    debug,
    useHimitsu
  });
};
