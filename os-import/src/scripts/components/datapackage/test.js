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
    var dpResources;

    var resources = [
      {data: '1', name: 'test.csv', path: 'test.csv', schema: {}},
      {data: '2', name: 'another.csv', path: 'another.csv', schema: {}},

      // First two rows are injected directly
      {data: '3', path: 'the-last.csv', schema: {}}
    ];

    datapackage.set('resources', resources.slice(0, 2));
    dpResources = datapackage.addResources(_.last(resources)).get('resources');

    assert(
      _.every(dpResources, function(resource, i) {
        return resource.path === resources[i].path
          && resource.name === resources[i].path;
      }) && dpResources.length === 3,

      'There are wrong values in resources list'
    );

    done();
  });

  it('passed with array of resources updates internal list', function(done) {
    var dpResources;

    var resources = [
      {data: '1', name: 'test.csv', path: 'test.csv', schema: {}},

      // First row is injected directly
      {data: '2', path: 'another.csv', schema: {}},
      {data: '3', path: 'the-last.csv', schema: {}}
    ];

    datapackage.set('resources', [resources[0]]);
    dpResources = datapackage.addResources(_.rest(resources)).get('resources');

    assert(
      _.every(dpResources, function(resource, i) {
        return resource.path === resources[i].path
          && resource.name === resources[i].path;
      }) && dpResources.length === 3,

      'There are wrong values in resources list'
    );

    done();
  });

  it('infer schema for passed in resource', function(done) { done(); });
  it('resets list of resources', function(done) { done(); });
});
