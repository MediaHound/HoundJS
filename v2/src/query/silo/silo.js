import houndRequest from '../../request/hound-request.js';

export default ({ pattern, global }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/silo',
    params: { pattern, global },
    responseType: 'silo'
  });
};
