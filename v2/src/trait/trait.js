import houndRequest from '../request/hound-request.js';

export const comopse = ({ ids, types, components }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/trait/compose',
    params: {
      ids,
      types,
      components
    }
  });
};
