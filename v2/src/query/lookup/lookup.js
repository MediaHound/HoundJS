import houndRequest from '../../request/hound-request.js';

export default ({ ids, components, pageSize }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/object',
    params: { ids, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse'
  });
};
