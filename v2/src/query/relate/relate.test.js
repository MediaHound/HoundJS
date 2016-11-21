import relate from './relate.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import syncify from '../../test-util/syncify.js';

beforeAll(() => bootstrapTests());

test('relate is exported as a function', () => {
  expect(typeof relate === 'function').toBe(true);
});

test('relate takes a factors array', async () => {
  const res = await relate({
    factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD']
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

// TODO: test: relate can take a compoonents object