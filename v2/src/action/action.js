import houndRequest from '../request/hound-request.js';

export default ({ ids, action }) => {
  return houndRequest({
    method: 'PUT',
    endpoint: `graph/action/${action}`,
    params: {
      ids
    },
    responseType: 'json'
  });
};
