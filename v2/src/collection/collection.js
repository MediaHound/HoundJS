import houndRequest from '../request/hound-request.js';

export const create = ({ name, description, content, debug = false }) => {
  return houndRequest({
    method: 'POST',
    endpoint: 'graph/collection/new',
    params: {
      name,
      description,
      content
    },
    responseType: 'json',
    debug
  });
};

export const update = ({ id, operations, allowDuplicates = false, debug = false }) => {
  return houndRequest({
    method: 'POST',
    endpoint: `graph/collection/${id}/update`,
    params: {
      operations,
      allowDuplicates
    },
    responseType: 'none',
    debug
  });
};
