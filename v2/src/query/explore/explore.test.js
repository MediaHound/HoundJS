import explore from './explore.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';

beforeAll(() => bootstrapTests());

test('explore is exported as a function', () => {
  expect(typeof explore === 'function').toBe(true);
});

test('explore takes a filters object', async () => {
  const res = await explore({
    filters: {
      returnType: 'ShowSeries',
      withContributor: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);

  for (const { object, context } of res.content) {
    expect(object.metadata.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('explore can be paged through', async () => {
  const res = await explore({
    filters: {
      withContributor: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    }
  });

  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.hasMorePages).toBe(true);
});

test('explore can take a pageSize', async () => {
  const res = await explore({
    filters: {
      withContributor: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
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

// TODO: test: explore can take a compoonents object
