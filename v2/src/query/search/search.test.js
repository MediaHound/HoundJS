import * as search from './search.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';

beforeAll(() => bootstrapTests());

test('search.all is exported as a function', () => {
  expect(typeof search.all === 'function').toBe(true);
});

test('search.segmented is exported as a function', () => {
  expect(typeof search.segmented === 'function').toBe(true);
});

test('search.all takes a searchTerm, scopes and pageSize', async () => {
  const res = await search.all({
    searchTerm: 'glad',
    scopes: ['ShowSeries'],
    pageSize: 5
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(5);
  expect(res.hasMorePages).toBe(true);

  for (const { object, context } of res.content) {
    expect(object.metadata.mhid.substring(0, 5)).toBe('mhsss');
  }

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content.length).toBe(5);
  expect(nextRes.hasMorePages).toBe(true);

  for (const { object, context } of nextRes.content) {
    expect(object.metadata.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('search.segmented takes a searchTerm, scopes, siloPageSize, and includeAll', async () => {
  const res = await search.segmented({
    searchTerm: 'glad',
    scopes: ['movie', 'showSeries'],
    siloPageSize: 6,
    includeAll: true
  });

  expect(res.hasMorePages).toBe(false);
  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(3); // Movies, ShowSeries, and All

  const innerTypes = res.content.map(innerRes => innerRes.type);
  expect(innerTypes).toEqual(['all', 'movie', 'showSeries']);

  for (const innerRes of res.content) {
    expect(Array.isArray(innerRes.content)).toBe(true);
    expect(innerRes.content.length).toBe(6);

    if (innerRes.type === 'movie') {
      for (const { object, context } of innerRes.content) {
        expect(object.metadata.mhid.substring(0, 5)).toBe('mhmov');
      }
    }

    if (innerRes.type === 'showSeries') {
      for (const { object, context } of innerRes.content) {
        expect(object.metadata.mhid.substring(0, 5)).toBe('mhsss');
      }
    }

    expect(innerRes.hasMorePages).toBe(true);

    const secondPageRes = await innerRes.next();

    expect(Array.isArray(secondPageRes.content)).toBe(true);
    expect(secondPageRes.content.length).toBe(6);
  }
});

test('search.segmented supports a false includeAll', async () => {
  const res = await search.segmented({
    searchTerm: 'glad',
    scopes: ['movie', 'showseries'],
    siloPage: 6,
    includeAll: false
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(2); // Movies, ShowSeries, but no All
});

test('search.segmented defaults includeAll to true', async () => {
  const res = await search.segmented({
    searchTerm: 'glad',
    scopes: ['movie', 'showseries'],
    siloPage: 6
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content.length).toBe(3); // Movies, ShowSeries, and All
});
