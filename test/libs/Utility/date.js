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

var negDateDiffDLS = function(fn, resultCoefficient) {
  resultCoefficient = (! resultCoefficient) ? 1 : resultCoefficient;
  it('negative date difference with daylight savings time.', function() {
    var date1 = new Date(2014, 6, 5, 10, 10, 5, 15);
    var date2 = new Date(date1.getTime());
    date1.setDate(date1.getDate() + 180);
    var offset = (resultCoefficient === 1) ? 0 : resultCoefficient * (1/24);
    fn(date2, date1, true).should.equal((-1 * 180 * resultCoefficient)-offset);
  });
}

var posDateDiffDLS = function(fn, resultCoefficient) {
  resultCoefficient = (! resultCoefficient) ? 1 : resultCoefficient;
  it('positive date difference with daylight savings time.', function() {
    var date1 = new Date(2014, 6, 5, 10, 10, 5, 15);
    var date2 = new Date(date1.getTime());
    date1.setDate(date1.getDate() + 180);
    var offset = (resultCoefficient === 1) ? 0 : resultCoefficient * (1/24);
    fn(date1, date2, true).should.equal((180 * resultCoefficient)+offset);
  });
}

var dui = new dateUtility();

describe('Date Utility Lib', function() {
  
  describe('diff(date1, date2)', function(){
    zeroDiffTest(dui.diff);
    nonDateTest(dui.diff);
    negDateDiff(dui.diff, 20, -1 * 20 * 24 * 60 * 60 * 1000);
    posDateDiff(dui.diff, 20, 20 * 24 * 60 * 60 * 1000);
    negDateDiffDLS(dui.diff, 24 * 60 * 60 * 1000);
    posDateDiffDLS(dui.diff, 24 * 60 * 60 * 1000);
  });

  describe('diffInMilliseconds(date1, date2)', function() {
    zeroDiffTest(dui.diffInMilliseconds);
    nonDateTest(dui.diffInMilliseconds);
    negDateDiff(dui.diffInMilliseconds, 20, -1 * 20 * 24 * 60 * 60 * 1000);
    posDateDiff(dui.diffInMilliseconds, 20, 20 * 24 * 60 * 60 * 1000);
    negDateDiffDLS(dui.diffInMilliseconds, 24 * 60 * 60 * 1000);
    posDateDiffDLS(dui.diffInMilliseconds, 24 * 60 * 60 * 1000);
  });

  describe('diffInMinutes(date1, date2)', function() {
    zeroDiffTest(dui.diffInMinutes);
    nonDateTest(dui.diffInMinutes);
    negDateDiff(dui.diffInMinutes, 1000, -1 * 1000 * 24 * 60);
    posDateDiff(dui.diffInMinutes, 66 , 66 * 24 * 60);
    negDateDiffDLS(dui.diffInMinutes, 24 * 60);
    posDateDiffDLS(dui.diffInMinutes, 24 * 60);
  });

  describe('diffInHours(date1, date2)', function() {
    zeroDiffTest(dui.diffInHours);
    nonDateTest(dui.diffInHours);
    negDateDiff(dui.diffInHours, 99999, -1 * 99999 * 24);
    posDateDiff(dui.diffInHours, 35563, 35563 * 24);
    negDateDiffDLS(dui.diffInHours, 24);
    posDateDiffDLS(dui.diffInHours, 24);
  });

  describe('diffInDays(date1, date2)', function() {
    zeroDiffTest(dui.diffInDays);
    nonDateTest(dui.diffInDays);
    negDateDiff(dui.diffInDays, 2, -1 * 2);
    posDateDiff(dui.diffInDays, 2534, 2534);
    negDateDiffDLS(dui.diffInDays, 1);
    posDateDiffDLS(dui.diffInDays, 1);
  });
});