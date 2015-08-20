var houndjs = require('../../dist/houndjs.js');

describe('houndjs', function() {
  it('exposes expected main objects', function() {
    expect(houndjs.MHAction).toBeDefined();
    expect(houndjs.MHCollection).toBeDefined();
    expect(houndjs.MHContributor).toBeDefined();
    expect(houndjs.MHMedia).toBeDefined();
    expect(houndjs.MHObject).toBeDefined();
    expect(houndjs.MHSDK).toBeDefined();
    expect(houndjs.MHSearch).toBeDefined();
    expect(houndjs.MHSource).toBeDefined();
    expect(houndjs.MHTrait).toBeDefined();
    expect(houndjs.MHUser).toBeDefined();
  });
});
