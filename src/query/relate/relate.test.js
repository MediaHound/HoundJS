import relate from './relate.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';
import { expectMediaHoundImage } from '../../test-util/expect-image.js';
import himOGTest from '../../test-util/himOGTest.js';

beforeAll(() => bootstrapTests());

test('relate is exported as a function', () => {
  expect(typeof relate === 'function').toBe(true);
});

himOGTest('relate takes a simple single-item factors array of mhid', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes a simple single-item factors array of altId', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmov-gladiator'],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes a simple single-item factors array of MSI', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['IMDB::tt0238380'],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes an advanced single-item factors array of mhid', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes an advanced single-item factors array of altId', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmov-gladiator'
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes an advanced single-item factors array of MSI', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'IMDB::tt0238380'
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes an advanced single-item factors array with weight', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize should be 10
});

himOGTest('relate takes a simple multi-item factors array of mhid', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes a simple multi-item factors array of altId', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      'mhmov-gladiator',
      'mhmov-the-notebook'
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes a simple multi-item factors array of MSI', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      'IMDB::tt0238380',
      'IMDB::tt0365748'
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes a simple multi-item factors array of mhid, altId, and MSI', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      'mhmov-her',
      'IMDB::tt0365748'
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes an advanced muli-item factors array', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'
      },
      {
        id: 'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes an advanced muli-item factors array with weights', async ({ useHimitsu }) => {
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
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes an advanced single-item factors array with boostOnly', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 1,
        boostOnly: false
      }
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes an advanced multi-item factors array with boostOnly', async ({ useHimitsu }) => {
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
    ],
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
});

himOGTest('relate takes a filters object with a simple factors array', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    filters: {
      returnType: { '$eq': 'ShowSeries' }
    },
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10);

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

himOGTest('relate takes a filters object with an advanced factors array', async ({ useHimitsu }) => {
  const res = await relate({
    factors: [
      {
        id: 'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
        weight: 2
      }
    ],
    filters: {
      returnType: { '$eq': 'ShowSeries' }
    },
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10);

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

himOGTest('relate can be paged through', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    useHimitsu
  });

  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.hasMorePages).toBe(true);
});

himOGTest('relate can take a pageSize', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 3,
    useHimitsu
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content).toHaveLength(3);
  expect(nextRes.hasMorePages).toBe(true);
});

himOGTest('relate with an invalid mhid factor should fail', async ({ useHimitsu }) => {
  const syncFunction = await syncify(() => {
    return relate({
      factors: ['mhmovWRONGWRONGWRONGWRONGWRONGWRONGWRONGWRON'],
    useHimitsu
    });
  });

  expect(syncFunction).toThrow();
});

himOGTest('relate return basic metadata if no components are requested', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    useHimitsu
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

himOGTest('relate takes a simple component', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: ['primaryImage'],
    useHimitsu
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

himOGTest('relate takes multiple simple components', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'primaryImage',
      'secondaryImage'
    ],
    useHimitsu
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

himOGTest('relate takes an object component', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      { name: 'primaryImage' }
    ],
    useHimitsu
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

himOGTest('relate takes multiple object components', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      { name: 'primaryImage' },
      { name: 'secondaryImage' }
    ],
    useHimitsu
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

himOGTest('relate ignores unrecognized components', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'wrongComponent'
    ],
    useHimitsu
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

himOGTest('relate ignores unrecognized components but accepts valid ones', async ({ useHimitsu }) => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD'],
    pageSize: 2,
    components: [
      'wrongComponent',
      'primaryImage'
    ],
    useHimitsu
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
