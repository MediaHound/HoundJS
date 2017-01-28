import { configure } from './sdk.js';
import bootstrapTests from '../test-util/bootstrap-tests.js';
import syncify from '../test-util/syncify.js';

beforeAll(() => bootstrapTests({ autoConfigure: false }));

test('configure can be called 50 times at once', async () => {
  const clientId = process.env.HOUNDJS_TEST_CLIENT_ID;
  const clientSecret = process.env.HOUNDJS_TEST_CLIENT_SECRET;
  const origin = process.env.HOUNDJS_TEST_ORIGIN;

  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      configure({
          clientId,
          clientSecret,
          origin
        })
        .then(() => true)
        .catch(err => false)
    );
  }

  const values = await Promise.all(promises);
  const failures = values.filter(v => !v).length;
  expect(failures).toBe(0);
});
