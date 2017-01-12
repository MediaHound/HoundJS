import * as sdk from './sdk.js';
import bootstrapTests from '../test-util/bootstrap-tests.js';
import relate from '../query/relate/relate.js';
import explore from '../query/explore/explore.js';
import lookup from '../query/lookup/lookup.js';
import * as search from '../query/search/search.js';

import syncify from '../test-util/syncify.js';

beforeAll(() => bootstrapTests({ autoConfigure: false }));

test('Sdk queries fail without first configuring: Relate', async () => {
  const syncFunction = await syncify(() => {
    return relate({
      factors: ['mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD']
    });
  });

  expect(syncFunction).toThrow();
});

test('Sdk queries fail without first configuring: Explore', async () => {
  const syncFunction = await syncify(() => {
    return explore({
      filters: {
        returnType: 'ShowSeries',
        withContributor: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
      }
    });
  });

  expect(syncFunction).toThrow();
});

test('Sdk queries fail without first configuring: Lookup', async () => {
  const syncFunction = await syncify(() => {
    return lookup({
      ids: ['mhmov-gladiator']
    });
  });

  expect(syncFunction).toThrow();
});

test('Sdk queries fail without first configuring: Search', async () => {
  const syncFunction = await syncify(() => {
    return search.all({
      searchTerm: 'glad',
      scopes: ['ShowSeries'],
      pageSize: 5
    });
  });

  expect(syncFunction).toThrow();
});
