import { configure } from './sdk.js';
import bootstrapTests from '../test-util/bootstrap-tests.js';

beforeAll(() => bootstrapTests());

test('configure is exported as a function', () => {
  expect(typeof configure === 'function').toBe(true);
});
