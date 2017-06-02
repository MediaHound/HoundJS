import houndRequest from '../../request/hound-request.js';

export default ({ pattern, global, silosPerPage, itemsPerSilo }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/silo',
    params: { pattern, global, silosPerPage, itemsPerSilo },
    responseType: 'silo'
  });
};
