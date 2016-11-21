import houndRequest from '../../request/hound-request.js';
import extraEncode from '../../request/extra-encode.js';

export const all = ({ searchTerm, scopes, pageSize }) => {
  return houndRequest({
    method  : 'GET',
    endpoint: `search/all/${extraEncode(searchTerm)}`,
    params: {
      pageSize,
      types: Array.isArray(scopes) ? scopes : undefined
    },
    responseType: 'pagedResponse'
  });
};

export const segmented = ({ searchTerm, scopes, siloPageSize, includeAll = true }) => {
  return houndRequest({
    method  : 'GET',
    endpoint: `search/segmented/${extraEncode(searchTerm)}`,
    params: {
      siloPageSize,
      includeAll,
      types: Array.isArray(scopes) ? scopes : undefined
    },
    responseType: 'silo'
  });
};
