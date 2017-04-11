const expectImageFormatFilledOut = (imageFormat) => {
  expect(imageFormat).toBeDefined();
  expect(imageFormat.width).toBeGreaterThan(0);
  expect(imageFormat.height).toBeGreaterThan(0);
  expect(imageFormat.url).toMatch(/^https:\/\/images\.mediahound\.com\//);
};

export const expectMediaHoundImage = (image) => {
  expect(image).toBeDefined();
  expect(image.metadata).toBeDefined();
  expect(image.metadata.mhid).toMatch(/^mhimg/);
  expect(image.metadata.isDefault).toBeDefined();
  expectImageFormatFilledOut(image.metadata.original);
  expectImageFormatFilledOut(image.metadata.large);
  expectImageFormatFilledOut(image.metadata.medium);
  expectImageFormatFilledOut(image.metadata.small);
  expectImageFormatFilledOut(image.metadata.thumbnail);
};
