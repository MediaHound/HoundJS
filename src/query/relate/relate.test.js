import relate from './relate.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';
import { expectMediaHoundImage } from '../../test-util/expect-image.js';

beforeAll(() => bootstrapTests());

test('relate is exported as a function', () => {
  expect(typeof relate === 'function').toBe(true);
});

test('relate takes a simple single-item factors array of mhid', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes a simple single-item factors array of altId', async () => {
  const res = await relate({
    factors: ['mhmov-gladiator']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes a simple single-item factors array of MSI', async () => {
  const res = await relate({
    factors: ['IMDB::tt0238380']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes an advanced single-item factors array of mhid', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes an advanced single-item factors array of altId', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmov-gladiator'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes an advanced single-item factors array of MSI', async () => {
  const res = await relate({
    factors: [
      {
        id: 'IMDB::tt0238380'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes an advanced single-item factors array with weight', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

test('relate takes a simple multi-item factors array of mhid', async () => {
  const res = await relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a simple multi-item factors array of altId', async () => {
  const res = await relate({
    factors: [
      'mhmov-gladiator',
      'mhmov-the-notebook'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a simple multi-item factors array of MSI', async () => {
  const res = await relate({
    factors: [
      'IMDB::tt0238380',
      'IMDB::tt0365748'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a simple multi-item factors array of mhid, altId, and MSI', async () => {
  const res = await relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      'mhmov-her',
      'IMDB::tt0365748'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced muli-item factors array', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'
      },
      {
        id: 'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced muli-item factors array with weights', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1
      },
      {
        id: 'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
        weight: 2
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced single-item factors array with boostOnly', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1,
        boostOnly: false
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes an advanced multi-item factors array with boostOnly', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1,
        boostOnly: false
      },
      {
        id: 'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
        weight: 2,
        boostOnly: true
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
});

test('relate takes a filters object with a simple factors array', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    filters: {
      returnType: { '$eq': 'ShowSeries' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10);

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('relate takes a filters object with an advanced factors array', async () => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 2
      }
    ],
    filters: {
      returnType: { '$eq': 'ShowSeries' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10);

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
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
  expect(res.content).toHaveLength(3);
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content).toHaveLength(3);
  expect(nextRes.hasMorePages).toBe(true);
});

test('relate with an invalid mhid factor should fail', async () => {
  const syncFunction = await syncify(() => {
    return relate({
      factors: ['mhmovWRONGWRONGWRONGWRONGWRONGWRONGWRONGWRON']
    });
  });

  expect(syncFunction).toThrow();
});

test('relate return basic metadata if no components are requested', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();
  }
});

test('relate takes a simple component', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: ['primaryImage']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});

test('relate takes multiple simple components', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'primaryImage',
      'secondaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);

    const { secondaryImage } = object;
    expectMediaHoundImage(secondaryImage.object);
  }
});

test('relate takes an object component', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      { name: 'primaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});

test('relate takes multiple object components', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      { name: 'primaryImage' },
      { name: 'secondaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);

    const { secondaryImage } = object;
    expectMediaHoundImage(secondaryImage.object);
  }
});

test('relate ignores unrecognized components', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'wrongComponent'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();
  }
});

test('relate ignores unrecognized components but accepts valid ones', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'wrongComponent',
      'primaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object).toBeDefined();
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});
