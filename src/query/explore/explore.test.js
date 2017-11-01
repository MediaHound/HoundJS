import explore from './explore.js';
import bootstrapTests from '../../test-util/bootstrap-tests.js';
import { expectMediaHoundImage } from '../../test-util/expect-image.js';

beforeAll(() => bootstrapTests());

test('explore is exported as a function', () => {
  expect(typeof explore === 'function').toBe(true);
});

test('explore takes a filters object of mhid', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize is 10

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('explore takes a filters object of altId', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhric-george-clooney' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize is 10

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('explore takes a filters object of MSI', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'IMDB::nm0289142' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize is 10

  for (const { object, context } of res.content) {
    expect(object.mhid.substring(0, 5)).toBe('mhsss');
  }
});

test('explore can be paged through', async () => {
  const res = await explore({
    filters: {
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    }
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(10); // Default pageSize is 10
  expect(res.hasMorePages).toBe(true);

  const nextRes = await res.next();

  expect(Array.isArray(nextRes.content)).toBe(true);
  expect(nextRes.content).toHaveLength(10); // Default pageSize is 10
  expect(nextRes.hasMorePages).toBe(true);
});

test('explore can take a pageSize', async () => {
  const res = await explore({
    filters: {
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
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

test('explore takes a sort object: sort by ids - in order (mhid)', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
  expect(res.content[1].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[2].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[3].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
});

test('explore takes a sort object: sort by ids - in order (altId)', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov-her',
          'mhmov-gladiator',
          'mhmov-citizen-kane',
          'mhmov-dodgeball-a-true-underdog-story'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'mhmov-her',
          'mhmov-gladiator',
          'mhmov-citizen-kane',
          'mhmov-dodgeball-a-true-underdog-story'
        ]
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.altId).toBe('mhmov-her');
  expect(res.content[1].object.altId).toBe('mhmov-gladiator');
  expect(res.content[2].object.altId).toBe('mhmov-citizen-kane');
  expect(res.content[3].object.altId).toBe('mhmov-dodgeball-a-true-underdog-story');
});

test('explore takes a sort object: sort by ids - in order (MSI)', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'IMDB::tt1798709',
          'IMDB::tt0172495',
          'IMDB::tt0033467',
          'IMDB::tt0364725'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'IMDB::tt1798709',
          'IMDB::tt0172495',
          'IMDB::tt0033467',
          'IMDB::tt0364725'
        ]
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.altId).toBe('mhmov-her');
  expect(res.content[1].object.altId).toBe('mhmov-gladiator');
  expect(res.content[2].object.altId).toBe('mhmov-citizen-kane');
  expect(res.content[3].object.altId).toBe('mhmov-dodgeball-a-true-underdog-story');
});

test('explore takes a sort object: sort by ids - in order descending', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ],
        order: 'descending'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
  expect(res.content[1].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[2].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[3].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
});

test('explore takes a sort object: sort by ids - explicit reverse order', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'
        ]
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
  expect(res.content[1].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[2].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[3].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
});

test('explore takes a sort object: sort by ids - partial with name fallback', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'idsOrder',
        ids: [
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'
        ]
      },
      {
        type: 'property',
        property: 'metadata.name',
        order: 'descending'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[1].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[2].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // troy
  expect(res.content[3].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // her
});

test('explore takes a sort object: sort by releaseDate', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'
        ]
      }
    },
    sort: [
      {
        type: 'property',
        property: 'metadata.releaseDate'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her 2013
  expect(res.content[1].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook 2004
  expect(res.content[2].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator 2000
});

test('explore takes a sort object: sort by releaseDate ascending', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'
        ]
      }
    },
    sort: [
      {
        type: 'property',
        property: 'metadata.releaseDate',
        order: 'ascending'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator 2000
  expect(res.content[1].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook 2004
  expect(res.content[2].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her 2013
});

test('explore takes a sort object: sort by name', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'property',
        property: 'metadata.name'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator
  expect(res.content[1].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her
  expect(res.content[2].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook
  expect(res.content[3].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // Troy
});

test('explore takes a sort object: sort by name descending', async () => {
  const res = await explore({
    filters: {
      restrictTo: {
        $in: [
          'mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8',
          'mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G',
          'mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1',
          'mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'
        ]
      }
    },
    sort: [
      {
        type: 'property',
        property: 'metadata.name',
        order: 'descending'
      }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content[0].object.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // Troy
  expect(res.content[1].object.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook
  expect(res.content[2].object.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her
  expect(res.content[3].object.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator
});

test('explore return basic metadata if no components are requested', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();
  }
});

test('explore takes a simple component', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: ['primaryImage']
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});

test('explore takes multiple simple components', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: [
      'primaryImage',
      'secondaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);

    const { secondaryImage } = object;
    expectMediaHoundImage(secondaryImage.object);
  }
});

test('explore takes an object component', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: [
      { name: 'primaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});

test('explore takes multiple object components', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: [
      { name: 'primaryImage' },
      { name: 'secondaryImage' }
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);

    const { secondaryImage } = object;
    expectMediaHoundImage(secondaryImage.object);
  }
});

test('explore ignores unrecognized components', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: [
      'wrongComponent'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();
  }
});

test('explore ignores unrecognized components but accepts valid ones', async () => {
  const res = await explore({
    filters: {
      returnType: { $eq: 'ShowSeries' },
      contributors: { $eq: 'mhricyGERyNVHKy7BNMIZzXBX9dLOWzT4cWdcC6LPUHp' }
    },
    pageSize: 2,
    components: [
      'wrongComponent',
      'primaryImage'
    ]
  });

  expect(Array.isArray(res.content)).toBe(true);
  expect(res.content).toHaveLength(2);

  for (const { object } of res.content) {
    expect(object.name).toBeDefined();
    expect(object.altId).toBeDefined();
    expect(object.mhid).toBeDefined();

    const { primaryImage } = object;
    expectMediaHoundImage(primaryImage.object);
  }
});
