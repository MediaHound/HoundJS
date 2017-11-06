//Himitsu and OG Rexplore Test
const himOGTest = (name, fn) => {
  test(`${name} - useHimitsu:false`, fn.bind(this, { useHimitsu: false }));
  test(`${name} - useHimitsu:true`, fn.bind(this, { useHimitsu: true }));
};
export default himOGTest;
