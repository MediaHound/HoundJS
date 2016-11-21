import houndRequest from '../../request/hound-request.js';

export default ({ filters, components, pageSize }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/explore',
    params: { filters, components, pageSize },
    responseType: 'pagedResponse'
  });
};
