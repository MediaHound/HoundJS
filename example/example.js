// You are responsible for polyfilling the fetch api.
import 'isomorphic-fetch';

// You are responsible for providing the babel polyfill.
import 'babel-polyfill';

import hound from 'houndjs';

const main = async () => {
  await hound.sdk.configure({
    clientId: '<Your Client>',
    clientSecret: '<Your Secret>'
  });

  const url = hound.sdk.getLoginDialogURL({
    redirectUrl: 'mysite.com/?finished',
    scopes: 'public_profile'
  });

  hound.sdk.loginWithAccessToken({
    accessToken: '<Token you get from redirect url>'
  });


  hound.sdk.loginWithCredentials({
    username: '<Username>',
    password: '<Password>',
    scope: 'public_profile'
  });


  const resultsA = await hound.search.all({
    searchTerm: 'glad',
    scopes: ['Movie']
  });

  const resultsB = await hound.search.segmented({
    searchTerm: 'note',
    scopes: ['Movie', 'ShowSeries'],
    includeAll: true
  });


  const resultC = await hound.collection.create({
    name: 'My Top 10',
    description: 'The best movies ever'
  });

  await hound.collection.update({
    id: resultC.metadata.mhid,
    operations: [
      { operation: 'prepend', order: 0, ids: ['mhmov-gladiator'] }
    ],
    allowDuplicates: false
  });


  const resultsE = await hound.trait.compose({
    ids: ['mhgnr-drama', 'mhgnr-action'],
    types: ['subset', 'superset', 'exact']
  });


  await hound.takeAction({
    ids: ['mhmov-gladiator'],
    action: 'like'
  });


  await hound.explore({
    filters: {
      returnType: { '$eq': 'Movie' },
      withContributor: {
        '$eq': 'mhric-george-clooney'
      }
    },
    pageSize: 20,
    components: [
      'primaryImage',
      {
        name: 'contributors',
        pageSize: 3
      }
    ]
  });


  await hound.lookup({
    ids: [
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
    pageSize: 5,
    components: [
      'primaryImage',
      {
        name: 'contributors',
        pageSize: 3
      }
    ]
  });


  await hound.relate({
    factors: [
      'mhmovjND8mq6M3RVmfvMpkcAKqYnyScgYVLqk0ITJuCD',
      { id: 'mhmov-her', weight: 2},
      { id: 'mhusr-db', weight: 0.5, boostOnly: true }
    ],
    filters: {
      returnType: { '$eq': 'Movie' },
      withContributor: {
        '$eq': 'mhric-george-clooney'
      }
    },
    pageSize: 12,
    components: [
      'primaryImage',
      {
        name: 'contributors',
        pageSize: 3
      }
    ]
  });
};

main();
