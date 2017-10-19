import houndRequest from '../../request/hound-request.js';

export default ({ ids, components, pageSize, debug = false }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/lookup',
    params: { ids, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse',
    debug
  });
};
