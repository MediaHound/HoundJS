import * as sdk from './models/sdk.js';
import houndRequest from './request/hound-request.js';

export { sdk };

export const relate = ({ factors, filters, components, pageSize }) => {
  return houndRequest({
    method: 'POST',
    endpoint: 'graph/relate',
    params: { factors, filters, components, pageSize }
  });
};

export const explore = ({ filters, components, pageSize }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/explore',
    params: { filters, components, pageSize }
  });
};

export const lookup = ({ ids, filters, components, pageSize }) => {
  return houndRequest({
    method: 'GET',
    endpoint: 'graph/object',
    // TODO: The ids[0] below should just be ids
    params: { ids: ids[0], filters, components, pageSize }
  });
};
