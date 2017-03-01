import lookup from './lookup.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';

beforeAll(() => bootstrapTests());

const expectImageFormatFilledOut = (image) => {
  expect(image).toBeDefined();
  expect(image.width).toBeGreaterThan(0);
  expect(image.height).toBeGreaterThan(0);
  expect(image.url).toMatch(/^https:\/\/images\.mediahound\.com\//);
};

test('lookup is exported as a function', () => {
  expect(typeof lookup === 'function').toBe(true);
});

test('lookup takes an ids array (1 item)', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(1);
});

test('lookup can be paged through', async () => {
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
      'mhmov-dodgeball',
      'mhmov-hoosiers',
      'mhmov-metropolis',
      'mhmov-the-shawshank-redemption'
    ]
  });

  expect(res.hasMorePages).toBe(true);
  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(10);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  // Requested 11 movies with pageSize of 10, so second page should have 1 movie
  expect(nextRes.content.length).toBe(1);
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
      'mhmov-dodgeball',
      'mhmov-hoosiers',
      'mhmov-metropolis',
      'mhmov-the-shawshank-redemption'
    ],
    pageSize: 7
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(7);
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content.length).toBe(4);
  expect(nextRes.hasMorePages).toBe(false);
});

test('looking up an invalid mhid should fail', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: ['mhmov-invalidsljdkfsjklj']
    });
  });

  expect(syncFunction).toThrow();
});

test('lookup takes simple components', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      'primaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  const { metadata } = object;
  expect(metadata).toBeDefined();
  expect(metadata.name).toBe('Gladiator');
  expect(metadata.altId).toBe('mhmov-gladiator');
  expect(metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expect(primaryImage).toBeDefined();
  expect(primaryImage.metadata).toBeDefined();
  expect(primaryImage.metadata.mhid).toMatch(/^mhimg/);
  expect(primaryImage.metadata.isDefault).toBe(false);
  expectImageFormatFilledOut(primaryImage.metadata.original);
  expectImageFormatFilledOut(primaryImage.metadata.large);
  expectImageFormatFilledOut(primaryImage.metadata.medium);
  expectImageFormatFilledOut(primaryImage.metadata.small);
  expectImageFormatFilledOut(primaryImage.metadata.thumbnail);
});

test('lookup takes an object components', async () => {
  const res = await lookup({
    ids: ['mhmov-gladiator'],
    components: [
      { name: 'primaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(1);

  const firstPair = res.content[0];
  expect(firstPair).toBeDefined();

  const { object, context } = firstPair;
  expect(context).toEqual({});
  expect(object).toBeDefined();

  const { metadata } = object;
  expect(metadata).toBeDefined();
  expect(metadata.name).toBe('Gladiator');
  expect(metadata.altId).toBe('mhmov-gladiator');
  expect(metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');

  const { primaryImage } = object;
  expect(primaryImage).toBeDefined();
  expect(primaryImage.metadata).toBeDefined();
  expect(primaryImage.metadata.mhid).toMatch(/^mhimg/);
  expect(primaryImage.metadata.isDefault).toBe(false);
  expectImageFormatFilledOut(primaryImage.metadata.original);
  expectImageFormatFilledOut(primaryImage.metadata.large);
  expectImageFormatFilledOut(primaryImage.metadata.medium);
  expectImageFormatFilledOut(primaryImage.metadata.small);
  expectImageFormatFilledOut(primaryImage.metadata.thumbnail);
});
