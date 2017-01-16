import houndRequest from '../../request/hound-request.js';
import extraEncode from '../../request/extra-encode.js';

export const all = ({ searchTerm, scopes, pageSize }) => {
  return houndRequest({
    method  : 'GET',
    endpoint: `search/all/${extraEncode(searchTerm)}`,
    params: {
      version: '1.3', // TODO: Remove when this is implicit
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
      version: '1.3', // TODO: Remove when this is implicit
      siloPageSize,
      includeAll,
      types: Array.isArray(scopes) ? scopes : undefined
    },
    responseType: 'silo'
  });
};
