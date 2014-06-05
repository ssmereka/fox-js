var assert = require("assert"),
    should = require("should"),
    _ = require("underscore");

var dateUtility = require('../../../libs/Utility/date.js');

var zeroDiffTest = function(fn) {
  it('difference of the same date should be 0.', function() {
    var date = new Date();
    fn(date, date).should.equal(0);
  });
}

var nonDateTest = function(fn) {
  it('non-date objects should return 0.', function() {
    fn(5, new Date()).should.equal(0);
  });
}

var negDateDiff = function(fn, days, result) {
  it('negative date difference.', function() {
    var date1 = new Date();
    var date2 = new Date(date1.getTime());
    date1.setDate(date1.getDate() + days);
    fn(date2, date1).should.equal(result);
  });
}

var posDateDiff = function(fn, days, result) {
  it('positive date difference.', function() {
    var date1 = new Date();
    var date2 = new Date(date1.getTime());
    date1.setDate(date1.getDate() + days);
    fn(date1, date2).should.equal(result);
  });
}

var dui = new dateUtility();

describe('Date Utility Lib', function() {
  
  describe('diff(date1, date2)', function(){
    zeroDiffTest(dui.diff);
    nonDateTest(dui.diff);
    negDateDiff(dui.diff, 20, -1 * 20 * 24 * 60 * 60 * 1000);
    posDateDiff(dui.diff, 20, 20 * 24 * 60 * 60 * 1000);
  });

  describe('diffInMilliseconds(date1, date2)', function() {
    zeroDiffTest(dui.diffInMilliseconds);
    nonDateTest(dui.diffInMilliseconds);
    negDateDiff(dui.diffInMilliseconds, 20, -1 * 20 * 24 * 60 * 60 * 1000);
    posDateDiff(dui.diffInMilliseconds, 20, 20 * 24 * 60 * 60 * 1000);
  });

  describe('diffInMinutes(date1, date2)', function() {
    zeroDiffTest(dui.diffInMinutes);
    nonDateTest(dui.diffInMinutes);
    negDateDiff(dui.diffInMinutes, 150, -1 * 150 * 24 * 60);
    posDateDiff(dui.diffInMinutes, 66 , 66 * 24 * 60);
  });

  describe('diffInHours(date1, date2)', function() {
    zeroDiffTest(dui.diffInHours);
    nonDateTest(dui.diffInHours);
    negDateDiff(dui.diffInHours, 99999, -1 * 99999 * 24);
    posDateDiff(dui.diffInHours, 35563, 35563 * 24);
  });

  describe('diffInDays(date1, date2)', function() {
    zeroDiffTest(dui.diffInDays);
    nonDateTest(dui.diffInDays);
    negDateDiff(dui.diffInDays, 2, -1 * 2);
    posDateDiff(dui.diffInDays, 2534, 2534);
  });
});