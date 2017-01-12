import houndRequest from '../../request/hound-request.js';

export default ({ filters, sort, components, pageSize }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/explore',
    params: { filters, sort, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse'
  });
};
