var jsonParse = require('../../lib/models/internal/jsonParse.js');

describe('jsonParse', function() {
  
  describe('jsonCreateWithArgs()', function() {

  });

  describe('jsonMergeWithArgs()', function() {

  });

  describe('jsonCreateFromArrayData()', function() {
    it('transforms arrays of built-in types', function() {

      expect(jsonParse.jsonCreateFromArrayData([1, 2, 3], [Number])).toEqual([1, 2, 3]);
      expect(jsonParse.jsonCreateFromArrayData(['1', '2', '3'], [Number])).toEqual([1, 2, 3]);
      expect(jsonParse.jsonCreateFromArrayData(['1', '2a', '3b'], [Number])).toEqual([1, null, null]);


      expect(jsonParse.jsonCreateFromArrayData([true, false, true], [Boolean])).toEqual([true, false, true]);
      expect(jsonParse.jsonCreateFromArrayData([1, 2, 'hello'], [Boolean])).toEqual([true, true, true]);

      expect(jsonParse.jsonCreateFromArrayData(['1', '2', '3'], [String])).toEqual(['1', '2', '3']);
      expect(jsonParse.jsonCreateFromArrayData(['1', true, 3], [String])).toEqual(['1', 'true', '3']);
      

      // TODO: Date tests

      
      expect(jsonParse.jsonCreateFromArrayData([1], [Number])).toEqual([1]);
      expect(jsonParse.jsonCreateFromArrayData([null], [Number])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([undefined], [Number])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([], [Number])).toEqual([]);

      expect(jsonParse.jsonCreateFromArrayData([true], [Boolean])).toEqual([true]);
      expect(jsonParse.jsonCreateFromArrayData([false], [Boolean])).toEqual([false]);
      expect(jsonParse.jsonCreateFromArrayData([null], [Boolean])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([undefined], [Boolean])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([], [Boolean])).toEqual([]);

      expect(jsonParse.jsonCreateFromArrayData([null], [String])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([undefined], [String])).toEqual([null]);
      expect(jsonParse.jsonCreateFromArrayData([], [String])).toEqual([]);
    });
  });
  
});
