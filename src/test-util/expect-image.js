const expectImageFormatFilledOut = (imageFormat) => {
  expect(imageFormat).toBeDefined();
  expect(imageFormat.width).toBeGreaterThan(0);
  expect(imageFormat.height).toBeGreaterThan(0);
  expect(imageFormat.url).toMatch(/^https:\/\/images\.mediahound\.com\//);
};

export const expectMediaHoundImage = (image) => {
  expect(image).toBeDefined();
  expect(image).toBeDefined();
  expect(image.mhid).toMatch(/^mhimg/);
  expect(image.isDefault).toBeDefined();
  expectImageFormatFilledOut(image.original);
  expectImageFormatFilledOut(image.large);
  expectImageFormatFilledOut(image.medium);
  expectImageFormatFilledOut(image.small);
  expectImageFormatFilledOut(image.thumbnail);
};
