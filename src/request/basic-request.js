let _FormData;
if (typeof window !== 'undefined') {
  _FormData = window.FormData;
}
else if (typeof FormData === 'function') {
  _FormData = FormData;
}
else if (typeof window === 'undefined') {
  _FormData = require('form-data');
}

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

const createFormData = (obj) => {
  return Object
    .keys(obj)
    .reduce((formData, key) => {
      formData.append(key, obj[key]);
      return formData;
    }, new _FormData());
};

const serializeQueryParams = (obj) => {
  const filteredObj = filteredParams(obj);

  return Object
    .keys(filteredObj)
    .reduce((str, k) => {
      const value = filteredObj[k];
      if (value !== undefined) {
        // TODO: Remove this if statement, once types are handled like other arrays
        if (k === 'types') {
          for (const el of value) {
            const encodedEl = encodeURIComponent(el);
            str.push(`${k}=${encodedEl}`);
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

const basicRequest = ({ method, url, params, authorization, paramsProper = false, useForms = false, locale = null, debug = false, useHimitsu = true }) => {
  const headers = {
    'Accept': 'application/json'
  };

  if (authorization) {
    headers.Authorization = authorization;
  }

  if (locale) {
    headers['Accept-Language'] = locale;
  }

  let body;

  if (params) {
    if (method === 'GET') {
      // TODO: Everything should go to paramsProper soon
      if (paramsProper) {
        url = `${url}?useHimitsu=${useHimitsu}&params=${encodeURIComponent(JSON.stringify(params))}`;
      }
      else {
        url = `${url}?useHimitsu=${useHimitsu}&${serializeQueryParams(params)}`;
      }
    }
    else if (useForms) {
      body = createFormData(params);
    }
    else {
      body = serializeBodyParams(params);
      headers['Content-Type'] = 'application/json';
    }
  }

  // console.log(method, url, body, headers);
  let startTime = 0;
  if (debug && performance) {
    startTime = performance.now();
  }

  return fetch(url, {
      method,
      headers,
      body
    })
    .then(res => {
      if (!res.ok) {
        const err = new Error(`houndjs Request Failed: ${res.status} ${res.statusText}`);
        err.response = res;
        throw err;
      }

      if (debug && performance) {
        const endTime = performance.now();

        const responseTime = endTime - startTime;

        return res.json()
          .then(json => ({
            json,
            responseTime
          }))
          .catch(err => ({
            json: null,
            responseTime
          }));
      }
      else {
        return res.json()
          .catch(err => ({
            json: null
          }));
      }
    });
};

export default basicRequest;
