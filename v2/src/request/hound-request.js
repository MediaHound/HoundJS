import * as sdk from '../sdk/sdk.js';
import basicRequest from './basic-request.js';

const createPagedResponse = ({ json, responseType, generateRequest }) => {
  const { content, pagingInfo, ...rest } = json;

  const hasMorePages = !!(pagingInfo && pagingInfo.next);

  let finalizedContent;
  if (responseType === 'pagedResponse') {
    finalizedContent = content;
  }
  else if (content) {
    finalizedContent = content.map(c => createPagedResponse({ json: c, responseType: 'pagedResponse', generateRequest }));
  }
  else {
    // If we get back no content array.
    finalizedContent = [];
  }

  const payload = {
    content: finalizedContent,
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

const transformResponse = (json, responseType, houndRequest) => {
  if (responseType === 'none') {
    return null;
  }
  else if (responseType === 'json') {
    return json;
  }
  else if (responseType === 'pagedResponse' || responseType === 'silo') {
    return createPagedResponse({ json, responseType, generateRequest: houndRequest });
  }
  else {
    throw new Error('houndjs Invalid response type set');
  }
};

const houndRequest = ({ method, endpoint, url, params, paramsProper = false, responseType, debug = false }) => {
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
      locale,
      debug
    })
    .then(res => {
      if (debug) {
        const { json, ...details } = res;

        return {
          ...details,
          response: transformResponse(json, responseType, houndRequest)
        };
      }
      else {
        return transformResponse(res, responseType, houndRequest);
      }
    });
};

export default houndRequest;
