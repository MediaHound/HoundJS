import lookup from './lookup.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';
import { expectMediaHoundImage } from '../../test-util/expect-image.js';

beforeAll(() => bootstrapTests());


test('lookup is exported as a function', () => {
  expect(typeof lookup === 'function').toBe(true);
});

test('lookup takes an ids array (1 item) using mhid', async () => {
  const res = await lookup({
    ids: ['mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);
});

test('lookup takes an ids array (1 item) using altId', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);
});

test('lookup takes an ids array (1 item) using MSI', async () => {
  const res = await lookup({
    ids: ['IMDB::tt0238380']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);
});

test('lookup takes an ids array (3 items) that are 3 different pieces of content using mhid', async () => {
  const res = await lookup({
    ids: [
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
      'mhmovAyp87luMBe75zACCmd4RgqsRysexXsll2N7HqxJ',
      'mhmovrxL89X8RDcdkAsNfVzMuL1oSjjgYv9g9ixuW2IT'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are 3 different pieces of content using altId', async () => {
  const res = await lookup({
    ids: [
      'mhmov-gladiator',
      'mhmov-shakespeare-in-love',
      'mhmov-being-john-malkovich'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are 3 different pieces of content using MSI', async () => {
  const res = await lookup({
    ids: [
      'Vudu:Movie:32275',
      'IMDB::tt0238380',
      'iTunes:Movie:570128788'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are 3 different pieces of content using mhid, altId, and MSI', async () => {
  const res = await lookup({
    ids: [
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
      'mhmov-shakespeare-in-love',
      'iTunes:Movie:570128788'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are all the same piece of content using mhid', async () => {
  const res = await lookup({
    ids: [
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are all the same piece of content using altId', async () => {
  const res = await lookup({
    ids: [
      'mhmov-gladiator',
      'mhmov-gladiator',
      'mhmov-gladiator'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are all the same piece of content using MSI', async () => {
  const res = await lookup({
    ids: [
      'IMDB::tt0238380',
      'IMDB::tt0238380',
      'IMDB::tt0238380'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup takes an ids array (3 items) that are all the same piece of content using mhid, altId, and MSI', async () => {
  const res = await lookup({
    ids: [
      'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
      'mhmov-gladiator',
      'IMDB::tt0172495']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(3);
});

test('lookup can be paged through (default should be 10)', async () => {
  const res = await lookup({
    ids: [
      // 11 movies
      'mhmov-gladiator',
      'mhmov-her',
      'mhmov-the-notebook',
      'mhmov-citizen-kane',
      'mhmov-king-kong',
      'mhmov-back-to-the-future',
      'mhmov-saving-private-ryan',
      'mhmov-dodgeball-a-true-underdog-story',
      'mhmov-hoosiers',
      'mhmov-metropolis',
      'mhmov-the-shawshank-redemption'
    ]
  });

  expect(res.hasMorePages).toBe(true);
  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  // Requested 11 movies with pageSize of 10, so second page should have 1 movie
  expect(nextRes.content).toHaveLength(1);
  expect(nextRes.hasMorePages).toBe(false);
});

test('lookup can take a pageSize', async () => {
  const res = await lookup({
    ids: [
      // 11 movies
      'mhmov-gladiator',
      'mhmov-her',
      'mhmov-the-notebook',
      'mhmov-citizen-kane',
      'mhmov-king-kong',
      'mhmov-back-to-the-future',
      'mhmov-saving-private-ryan',
      'mhmov-dodgeball-a-true-underdog-story',
      'mhmov-hoosiers',
      'mhmov-metropolis',
      'mhmov-the-shawshank-redemption'
    ],
    pageSize: 7
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(7);
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content).toHaveLength(4);
  expect(nextRes.hasMorePages).toBe(false);
});

test('looking up an invalid mhid should fail', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: ['mhmovWRONGWRONGWRONGWRONGWRONGWRONGWRONGWRON']
    });
  });

  expect(syncFunction).toThrow();
});

test('looking up an invalid altId should fail', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: ['mhmov-invalidsljdkfsjklj']
    });
  });

  expect(syncFunction).toThrow();
});

test('looking up an invalid MSI should return an empty object', async () => {
  const res = await lookup({
    ids: ['IMDB::WRONG']
  });
  expect(res.content.length).toBe(1);
  expect(Object.keys(res.content[0]).length === 0)
});

test('looking up an invalid mhid along with valid mhids should fail', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: [
        'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
        'mhmovWRONGWRONGWRONGWRONGWRONGWRONGWRONGWRON'
      ]
    });
  });

  expect(syncFunction).toThrow();
});

test('looking up an invalid altId along with valid altIds should fail', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: [
        'mhmov-gladiator',
        'mhmov-invalidsljdkfsjklj'
      ]
    });
  });

  expect(syncFunction).toThrow();
});

test('looking up an invalid MSI along with valid MSIs should fail', async () => {
  const res = await lookup({
    ids: [
      'IMDB::tt0238380',
      'IMDB::WRONG'
    ]
  });
  expect(res.content.length).toBe(2);
  expect(Object.keys(res.content[1]).length === 0)
});

test('lookup returns basic metadata if no components are requested', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
});

test('lookup takes a simple component', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      'primaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expectMediaHoundImage(primaryImage.object);
});

test('lookup takes multiple simple components', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      'primaryImage',
      'secondaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expectMediaHoundImage(primaryImage.object);

  const { secondaryImage } = object;
  expectMediaHoundImage(secondaryImage.object);
});

test('lookup takes a single object component', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      { name: 'primaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expectMediaHoundImage(primaryImage.object);
});

test('lookup takes multiple object components', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      { name: 'primaryImage' },
      { name: 'secondaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expectMediaHoundImage(primaryImage.object);

  const { secondaryImage } = object;
  expectMediaHoundImage(secondaryImage.object);
});

test('lookup ignores unrecognized components', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      'wrongComponent'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
});

test('lookup ignores unrecognized components but accepts valid ones', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      'wrongComponent',
      'primaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  expect(object.name).toBe('Gladiator');
  expect(object.altId).toBe('mhmov-gladiator');
  expect(object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expectMediaHoundImage(primaryImage.object);
});
