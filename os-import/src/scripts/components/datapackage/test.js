var _ = require('lodash');
var assert = require('chai').assert;
var DatapackageModel = require('./index');
var datapackage;
process.env.NODE_ENV = 'test';

describe('Data package model', function() {
  beforeEach(function(done) { datapackage = new DatapackageModel(); done(); });

  it('initialize with default values', function(done) {
    var json = datapackage.toJSON();

    assert(
      json.homepage === '',
      'Default homepage property value should be empty'
    );

    assert(json.license === 'PDDL-1.0', 'Default license value is wrong');
    assert(json.name === '', 'Default name value should be empty');

    assert(
      _.isArray(json.resources) && json.resources.length === 0,
      'Default resources value should be empty array'
    );

    assert(json.title === '', 'Default title value should be empty');
    assert(json.version === '0.1.0', 'Default version value is wrong');
    done();
  });

  it('slugifies name from title', function(done) {
    datapackage.setTitle('Some long title with_underscore, comas and 1!');

    assert(
      datapackage.get('name') === 'some-long-title-with_underscore-comas-and-1',
      'Title was not proper slugified'
    );

    done();
  });

  it('passed with resource object updates internal list', function(done) {
    done();
  });

  it('passed with array of resources updates internal list', function(done) {
    done();
  });

  it('resets list of resources', function(done) { done(); });
});
