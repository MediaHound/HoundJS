import houndRequest from '../request/hound-request.js';

export const create = ({ name, description }) => {
  return houndRequest({
    method: 'POST',
    endpoint: 'graph/collection/new',
    params: {
      name,
      description
    }
  });
};

export const update = ({ id, operations, allowDuplicates = false }) => {
  return houndRequest({
    method: 'POST',
    endpoint: `graph/collection/${id}/update`,
    params: {
      operations,
      allowDuplicates
    }
  });
};
