import houndRequest from '../request/hound-request.js';

export const compose = ({ ids, types, components }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/trait/compose',
    params: { ids, types, components },
    responseType: 'silo'
  });
};
