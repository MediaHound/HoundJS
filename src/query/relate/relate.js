import houndRequest from '../../request/hound-request.js';

export default ({
    factors,
    filters,
    components,
    promote,
    config,
    pageSize,
    method = 'GET',
    debug = false,
    useHimitsu = true
  }) => {
    return houndRequest({
      method,
      endpoint: 'graph/relate',
      params: { factors, filters, components, promote, config, pageSize },
      paramsProper: true,
      responseType: 'pagedResponse',
      debug,
      useHimitsu
    });
};
