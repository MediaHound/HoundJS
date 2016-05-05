import MHPagedResponse from './MHPagedResponse.js';

export default class MHBucketPagedResponse extends MHPagedResponse {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      type: String,
      name: String,
      formattedName: String,
      hintText: String,
    };
  }
}
