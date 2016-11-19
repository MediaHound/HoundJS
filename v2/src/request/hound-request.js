import * as sdk from '../sdk/sdk.js';

/**
 * Removes undefined parameters
 */
const filteredParams = (obj) => {
  return Object
    .keys(obj)
    .reduce((newObj, k) => {
      let value = obj[k];
      if (value !== undefined) {
        newObj[k] = value;
      }
      return newObj;
    }, {});
};

const serializeQueryParams = (obj) => {
  const filteredObj = filteredParams(obj);

  return Object
    .keys(filteredObj)
    .reduce((str, k) => {
      const value = filteredObj[k];
      if (value !== undefined) {
        // TODO: Remove this if statement, once ids are handled like other arrays
        if (k === 'ids') {
          for (const id of value) {
            const encodedValue = encodeURIComponent(id);
            str.push(`${k}=${encodedValue}`);
          }
        }
        else {
          const encodedValue = encodeURIComponent(value instanceof Object ? JSON.stringify(value) : value);
          str.push(`${k}=${encodedValue}`);
        }
      }
      return str;
    }, [])
    .join('&');
};

const serializeBodyParams = (obj) => {
  return JSON.stringify(filteredParams(obj));
};

const houndRequest = ({ method, endpoint, url, params, paramsProper = false }) => {
  // You can either pass a full url or an endpoint
  let path = url ? url : `${sdk.details.getRootEndpoint()}/${endpoint}`;

  let body;

  if (params) {
    if (method === 'GET') {
      // TODO: Everything should go to paramsProper soon
      if (paramsProper) {
        path = `${path}?params=${encodeURIComponent(JSON.stringify(params))}`;
      }
      else {
        path = `${path}?${serializeQueryParams(params)}`;
      }
    }
    else {
      body = serializeBodyParams(params);
    }
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // Set the OAuth access token if the client has configured OAuth.
  const accessToken = sdk.details.getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(method, path);
  if (body) {
    console.log('BODY:', body);
  }

  return fetch(path, {
      method,
      headers,
      body
    })
    .then(res => {
      if (!res.ok) {
        const err = new Error('houndjs Request Failed');
        err.response = res;
        throw err;
      }
      return res.json();
    })
    .then(json => {
      const { content, pagingInfo } = json;

      return {
        content,
        hasMorePages: !!(pagingInfo && pagingInfo.next),
        next() {
          return houndRequest({
            method: 'GET',
            url: pagingInfo.next
          });
        }
      };
    });
};

export default houndRequest;
