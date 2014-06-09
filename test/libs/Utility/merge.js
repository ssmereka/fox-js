var assert = require("assert"),
    should = require("should"),
    _ = require("underscore");

var merge = require('../../../libs/Utility/merge.js');

var deepPriorityMerge = function(obj1, obj2, expectedMergeValue, done) {
  merge.deepPriorityMerge(obj1, obj2, function(err, mergedValue) {
    if(err) {
      return done(err);
    }

    assert.deepEqual(mergedValue, expectedMergeValue);
    done();
  });
}


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

  describe('deepPriorityMerge(obj1, obj2, done, depth, next)', function(){
    it('strings should merge', function(done) {
      var obj1 = { "a": "a", "b": "b" };
      var obj2 = { "b": "d", "c": "c" };
      var result = { "a": "a", "b": "b", "c": "c" };
      deepPriorityMerge(obj1, obj2, result, done);
    });

    it('numbers should merge', function(done) {
      var obj1 = { 1: 1, 2: 2 };
      var obj2 = { 2: 4, 3: 3 };
      var result = { 1: 1, 2: 2, 3: 3 };
      deepPriorityMerge(obj1, obj2, result, done);
    });

    it('arrays should merge', function(done) {
      var obj1 = { "a": ["a1", "a2", "a3"], "b": ["b1", "b2"] };
      var obj2 = { "b": ["d1", "d2", "d3"], "c": ["c1"] };
      var result = { "a": ["a1", "a2", "a3"], "b": ["b1", "b2"], "c": ["c1"] };
      deepPriorityMerge(obj1, obj2, result, done);
    });

    it('subobjects should merge', function(done) {
      var obj1 = {
        "a": { 1: 1 },
        "b": { 21: 21, 22: 22 }
      }
      var obj2 = {
        "b": { 4: 4 },
        "c": { 3: 3 }
      };
      var result = {
        "a": { 1: 1 },
        "b": { 21: 21, 22: 22 },
        "c": { 3: 3 }
      }
      deepPriorityMerge(obj1, obj2, result, done);
    });

    it('empty objects should merge', function(done) {
      var obj1 = {};
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      deepPriorityMerge(obj1, obj2, obj2, function(err){
        if(err) {
          return done(err);
        }
        deepPriorityMerge(obj2, obj1, obj2, done);
      });
    });

    it('handle undefined objects', function(done) {
      var obj1 = undefined;
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      deepPriorityMerge(obj1, obj2, obj2, function(err){
        if(err) {
          return done(err);
        }
        deepPriorityMerge(obj2, obj1, obj2, done);
      });
    });

    it('handle values that are not objects', function(done) {
      var obj1 = true;
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      deepPriorityMerge(obj1, obj2, obj2, function(err){
        if(err) {
          return done(err);
        }
        deepPriorityMerge(obj2, obj1, obj2, function(err) {
          if(err) {
            return done(err);
          }
          deepPriorityMerge(obj1, obj1, {}, done);
        }); 
      });
    });

    it('merge arrays and objects', function(done) {
      var obj1 = [];
      var obj2 = {
        "a": "a",
        "b": "b",
        "c": "c"
      };
      deepPriorityMerge(obj1, obj2, obj2, function(err){
        if(err) {
          return done(err);
        }
        deepPriorityMerge(obj2, obj1, obj2, function(err) {
          if(err) {
            return done(err);
          }
          deepPriorityMerge(obj1, obj1, {}, done);
        }); 
      });
    });

    it('objects should deep merge', function(done) {
      var obj1 = {};
      var obj2 = { 
        "a": {
          "a.1": "a.1",
          "a.2": 1,
          "a.3": [ "a3-1", "a3-2", "a3-3" ],
          "a.4": {
            "a.4.a": "a.4.a",
            "a.4.b": 2,
            "a.4.c": [ "a4c-1", "a4c-2", "a4c-3" ],
            "a.4.d": {
              "a.4.d.1": "a.4.d.1",
              "a.4.d.2": 3,
              "a.4.d.3": [ "a4d3-1", "a4d3-2", "a4d3-3" ],
              "a.4.d.4": {}
            }
          }
        } 
      };
      var result = { 
        "a": {
          "a.1": "a.1",
          "a.2": 1,
          "a.3": [ "a3-1", "a3-2", "a3-3" ],
          "a.4": {
            "a.4.a": "a.4.a",
            "a.4.b": 2,
            "a.4.c": [ "a4c-1", "a4c-2", "a4c-3" ],
            "a.4.d": {
              "a.4.d.1": "a.4.d.1",
              "a.4.d.2": 3,
              "a.4.d.3": [ "a4d3-1", "a4d3-2", "a4d3-3" ],
              "a.4.d.4": {}
            }
          }
        } 
      };
      deepPriorityMerge(obj1, obj2, result, done);
    });

  });
});