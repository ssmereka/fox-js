var assert = require("assert"),
    should = require("should"),
    _ = require("underscore");

var merge = require('../../../libs/Utility/merge.js');


describe('Merge Utility Lib', function() {
  
  describe('priorityMerge(obj1, obj2)', function(){
    it('strings should merge', function() {
      var obj1 = {
        "a": "a",
        "b": "b"
      }
      var obj2 = {
        "b": "d",
        "c": "c"
      }
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
    });

    it('numbers should merge', function() {
      var obj1 = {
        1: 1,
        2: 2
      }
      var obj2 = {
        2: 4,
        3: 3
      }
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        1: 1,
        2: 2,
        3: 3
      });
    });

    it('arrays should merge', function() {
      var obj1 = {
        "a": ["a1", "a2", "a3"],
        "b": ["b1", "b2"]
      };
      var obj2 = {
        "b": ["d1", "d2", "d3"],
        "c": ["c1"]
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": ["a1", "a2", "a3"],
        "b": ["b1", "b2"],
        "c": ["c1"]
      });
    });

    it('subobjects should merge', function() {
      var obj1 = {
        "a": { 1: 1 },
        "b": { 21: 21, 22: 22 }
      };
      var obj2 = {
        "b": { 4: 4 },
        "c": { 3: 3 }
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": { 1: 1 },
        "b": { 21: 21, 22: 22 },
        "c": { 3: 3 }
      });
    });

    it('empty objects should merge', function() {
      var obj1 = {};
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj2, obj1),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
    });

    it('handle undefined objects', function() {
      var obj1 = undefined;
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj2, obj1),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj1, obj1), obj1);
    });

    it('handle values that are not objects', function() {
      var obj1 = true;
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj2, obj1),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj1, obj1), undefined);
    });

    it('merge arrays and objects', function() {
      var obj1 = [];
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      assert.deepEqual(merge.priorityMerge(obj1, obj2),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj2, obj1),{
        "a": "a",
        "b": "b",
        "c": "c"
      });
      assert.deepEqual(merge.priorityMerge(obj1, obj1), obj1);
    });

  });
});