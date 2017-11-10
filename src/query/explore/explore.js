import houndRequest from '../../request/hound-request.js';

export default ({ filters, sort, components, pageSize, debug = false, useHimitsu = true }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/explore',
    params: { filters, sort, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse',
    debug,
    useHimitsu
  });
};
