import { configure } from './sdk.js';
import bootstrapTests from '../test-util/bootstrap-tests.js';
import syncify from '../test-util/syncify.js';

beforeAll(() => bootstrapTests({ autoConfigure: false }));

test.skip('configure can be called 50 times at once', async () => {
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
        .then(({ accessToken }) => {
          return { success: true, accessToken };
        })
        .catch(err => ({ success: false }))
    );
  }

  const values = await Promise.all(promises);
  const failures = values.filter(v => !v.success).length;
  expect(failures).toBe(0);

  const allTokensSame = values.every(v => v.accessToken === values[0].accessToken);
  expect(allTokensSame).toBe(true);
});
