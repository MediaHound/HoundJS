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


test('explore takes a sort object: sort by ids - in order', async () => {
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
  expect(res.content[1].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[2].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[3].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
  expect(res.content[1].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[2].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[3].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01');
  expect(res.content[1].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[2].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[3].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8');
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1');
  expect(res.content[1].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G');
  expect(res.content[2].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // troy
  expect(res.content[3].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // her
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her 2013
  expect(res.content[1].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook 2004
  expect(res.content[2].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator 2000
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator 2000
  expect(res.content[1].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook 2004
  expect(res.content[2].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her 2013
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator
  expect(res.content[1].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her
  expect(res.content[2].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook
  expect(res.content[3].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // Troy
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
  expect(res.content[0].object.metadata.mhid).toBe('mhmovrdRNaU0J07yE4n87CFzoYjBR6FbQN6jXxxu4D01'); // Troy
  expect(res.content[1].object.metadata.mhid).toBe('mhmovmhmrIfMxv8U3zZaAq7wDRK5WuG5h0hdUpInVrM1'); // The Notebook
  expect(res.content[2].object.metadata.mhid).toBe('mhmov6VBBM2sP7mkD2kURuZoPQt4INC0spAiz8HUsSL8'); // Her
  expect(res.content[3].object.metadata.mhid).toBe('mhmovPeR81SeVnIPqEFsr36NYUqfqHuXzO9lDuQkq72G'); // Gladiator
});
