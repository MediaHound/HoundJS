import houndRequest from '../../request/hound-request.js';

// TODO: promote and sort on all of these
export default ({ factors, filters, components, pageSize }) => {
  return houndRequest({
    method: 'GET', // TODO: can make this POST
    endpoint: 'graph/relate',
    params: { factors, filters, components, pageSize },
    paramsProper: true,
    responseType: 'pagedResponse'
  });
};
