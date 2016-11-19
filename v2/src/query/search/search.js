import houndRequest from '../../request/hound-request.js';

const extraEncode = str => {
  // encodeURIComponent then encode - _ . ! ~ * ' ( ) as well
  return encodeURIComponent(str)
    .replace(/\-/g, '%2D')
    .replace(/\_/g, '%5F')
    .replace(/\./g, '%2E')
    .replace(/\!/g, '%21')
    .replace(/\~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/\'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
};

export const all = ({ searchTerm, scopes, pageSize }) => {
  return houndRequest({
    method  : 'GET',
    endpoint: `search/all/${extraEncode(searchTerm)}`,
    params: {
      pageSize,
      types: Array.isArray(scopes) ? scopes : undefined
    }
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
    }
  });
};
