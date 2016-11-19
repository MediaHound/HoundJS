import houndRequest from '../request/hound-request.js';

export default ({ ids, action }) => {
  console.log(`Bulk take action (${action}) on ${ids}`);

  return houndRequest({
    method: 'PUT',
    endpoint: `graph/action/${action}`,
    params: {
      ids
    }
  });
};
