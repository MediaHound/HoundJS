import * as sdk from '../sdk/sdk.js';
import basicRequest from './basic-request.js';

const createPagedResponse = ({ json, responseType, generateRequest }) => {
  const { content, pagingInfo, ...rest } = json;

  const hasMorePages = !!(pagingInfo && pagingInfo.next);

  const payload = {
    content: responseType === 'pagedResponse' ? content : content.map(c => createPagedResponse({ json: c, responseType: 'pagedResponse', generateRequest })),
    hasMorePages,
    ...rest
  };

  if (hasMorePages) {
    payload.next = () => generateRequest({
      method: 'GET',
      url: pagingInfo.next,
      responseType
    });
  }

  return payload;
};

const houndRequest = ({ method, endpoint, url, params, paramsProper = false, responseType }) => {
  // Set the OAuth access token if the client has configured OAuth.
  const accessToken = sdk.details.getAccessToken();

  const locale = sdk.getLocale();

  return basicRequest({
      // You can either pass a full url or an endpoint
      url: url ? url : `${sdk.details.getRootEndpoint()}/${endpoint}`,
      method,
      params,
      paramsProper,
      authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      locale
    })
    .then(json => {
      if (responseType === 'json') {
        return json;
      }
      else if (responseType === 'pagedResponse' || responseType === 'silo') {
        return createPagedResponse({ json, responseType, generateRequest: houndRequest });
      }
      else {
        throw new Error('houndjs Invalid response type set');
      }
    });
};

export default houndRequest;
