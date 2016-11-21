import houndRequest from '../../request/hound-request.js';

export default ({ factors, filters, components, promote, pageSize }) => {
  return houndRequest({
    method: 'GET', // TODO: can make this POST
    endpoint: 'graph/relate',
    params: { factors, filters, components, promote, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse'
  });
};