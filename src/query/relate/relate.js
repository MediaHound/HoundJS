import houndRequest from '../../request/hound-request.js';

export default ({ factors, filters, components, promote, pageSize, debug = false }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/relate',
    params: { factors, filters, components, promote, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse',
    debug
  });
};
