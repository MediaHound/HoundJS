import 'isomorphic-fetch';
import 'babel-polyfill';
import dotenv from 'dotenv';

import { sdk } from '../hound.js';

dotenv.config();

export default ({ autoConfigure = true } = {}) => {
  if (autoConfigure) {
    const clientId = process.env.HOUNDJS_TEST_CLIENT_ID;
    const clientSecret = process.env.HOUNDJS_TEST_CLIENT_SECRET;
    const origin = process.env.HOUNDJS_TEST_ORIGIN;

    if (!clientId || !clientSecret || !origin) {
      throw new Error('Must specify HOUNDJS_TEST environment variables');
    }

    console.log('Client Id:', clientId);
    console.log('Client Secret:', clientSecret);
    console.log('Origin:', origin);

    return sdk.configure({
      clientId,
      clientSecret,
      origin
    });
  }
  else {
    return new Promise(resolve => resolve());
  }
};
