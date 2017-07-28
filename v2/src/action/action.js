import houndRequest from '../request/hound-request.js';

export default ({ ids, action, debug = false }) => {
  return houndRequest({
    method: 'PUT',
    endpoint: `graph/action/${action}`,
    params: {
      ids
    },
    responseType: 'json',
    debug
  });
};
