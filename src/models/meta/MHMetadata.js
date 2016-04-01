import MHImageData from '../image/MHImageData.js';
import { jsonCreateWithArgs } from '../internal/jsonParse.js';

export class MHMetadata {
  constructor(args) {
    jsonCreateWithArgs(args, this);
  }

  get jsonProperties() {
    return {
      mhid: {type: String, optional: false},
      altId: String,
      name: String,
      description: String,
      createdDate: Date,
      subType: String
    };
  }
}

export class MHMediaMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      releaseDate: Date
    };
  }
}

export class MHUserMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      username: {type: String, optional: false},
      email: String
    };
  }
}

export class MHCollectionMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      mixlist: String
    };
  }
}

export class MHActionMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      message: String
    };
  }
}

export class MHImageMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      isDefault: Boolean,
      averageColor: String,
      thumbnail: MHImageData,
      small: MHImageData,
      medium: MHImageData,
      large: MHImageData,
      original: MHImageData
    };
  }
}

export class MHSubscriptionMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      timePeriod: String,
      price: String,
      currency: String,
      mediums: String
    };
  }
}

export class MHSourceMetadata extends MHMetadata {
  get jsonProperties() {
    return {
      ...super.jsonProperties,
      connectable: Boolean
    };
  }
}

export class MHContributorMetadata extends MHMetadata {

}

export class MHHashtagMetadata extends MHMetadata {

}

export class MHTraitMetadata extends MHMetadata {

}
