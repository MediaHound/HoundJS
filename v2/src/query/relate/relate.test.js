import relate from './relate.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';

beforeAll(() => bootstrapTests());

test('relate is exported as a function', () => {
  expect(typeof relate === 'function').toBe(true);
});

test('relate takes a simple single-item factors array', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD']
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced single-item factors array', async () => {
  const res = await relate({
    factors: [
      {
        'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD': { weight: 1 }
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a simple multi-item factors array', async () => {
  const res = await relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test.only('relate takes an advanced muli-item factors array', async () => {
  const res = await relate({
    factors: [
      {
        'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD': { weight: 1 }
      },
      {
        'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8': { weight: 2 }
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced mulit-item factors array with boostOnly', async () => {
  const res = await relate({
    factors: [
      {
        'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD': {
          weight: 1,
          boostOnly: false
        }
      },
      {
        'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8': {
          weight: 2,
          boostOnly: true
        }
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a filters object', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    filters: {
      returnType: 'ShowSeries'
    }
  });

  expect(Array.isArray(res.content)).toBe(true);

  for (const { object, context } of res.content) {
    expect(object.metadata.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('relate can be paged through', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD']
  });

  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.hasMorePages).toBe(true);
});

test('relate can take a pageSize', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 3
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(3);
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content.length).toBe(3);
  expect(nextRes.hasMorePages).toBe(true);
});

test('relate with an invalid mhid factor should fail', async () => {
  const syncFunction = await syncify(() => {
    return relate({
      factors: ['mhmov-invalidsljdkfsjklj']
    });
  });

  expect(syncFunction).toThrow();
});

test('relate can take components', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: ['primaryImage', 'keyContributors']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(2);

  for (const { object } of res.content) {
    expect(object.metadata).toBeDefined();
    expect(object.primaryImage).toBeDefined();
    expect(object.primaryImage.metadata).toBeDefined();
    expect(object.keyContributors).toBeDefined();
    expect(object.keyContributors.content).toBeDefined();
    expect(Array.isArray(object.keyContributors.content)).toBe(true);
  }
});
