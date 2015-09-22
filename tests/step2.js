var $ = require('jquery');
var _ = require('underscore');
var assert = require('chai').assert;
var backbone = require('backbone');
var Browser = require('zombie');
var browser;
var csv = require('csv');
var inflect = require('i')();
var path = require('path');
var dataDir = path.join('.', 'tests', 'data');
var fs = require('fs');
var jtsInfer = require('json-table-schema').infer;
var parsedData;
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');
var setTimeoutOrig = setTimeout;
var sinon = require('sinon');
process.env.NODE_ENV = 'test';
Browser.localhost('127.0.0.1', process.env.PORT || 3000);
browser = new Browser({maxWait: 30000, silent: true});

function completeStep1(done) {
  browser.visit('/create', function() {
    var upload = browser.window.APP.layout.step1.layout.upload;
    browser.fill('[data-editors=name] input[name=name]', 'This is the name');

    sinon.stub(browser.window.FileAPI, 'readAsText', function(file, callback) {
      fs.readFile(path.join(dataDir, 'decent.csv'), 'utf8', function (error, data) {
        if(error)
          return console.log(error);

        callback({type: 'load', target:  {
          lastModified: 1428475571000,
          lastModifiedDate: 'Wed Apr 08 2015 09:46:11 GMT+0300 (MSK)',
          name: 'decent.csv',
          size: 410,
          type: 'text/csv',
          webkitRelativePath: ''
        }, result: data});
      });
    });

    setTimeout = function() { upload.parseCSV(); };

    // csv.parse() for some reasons doesn't work. Don't have time to investigate.
    sinon.stub(upload, 'parseCSV', function() {
      upload.trigger('parse-complete', {
        data  : parsedData,
        id    : 1,
        isURL : false,
        name  : 'decent.csv',
        schema: parsedSchema,
        size  : 230,
        text  : 'CSV'
      });
    });

    upload.on('parse-complete', function() {
      browser.window.APP.$('[data-id=submit]').click();

      // Stubbing methods called by setTimeout is a problem, so setTimeout is replaced
      // somewhere — restore it each time
      setTimeout = setTimeoutOrig;

      done();
    });

    browser.attach('[data-id=upload] [data-id=file]', path.join(dataDir, 'decent.csv'));
  });
}

// Common method for testing if concept returned correctly
function testMappingMethod(done, method, options) {
  var index = _.random(parsedData[0].length - 1);
  var mapper = browser.window.APP.activate().layout.mapper;
  var schema = _.extend({}, parsedSchema.fields);
  schema[index].concept = options.conceptName;

  mapper.reset(
    new backbone.Collection(
      _.chain(parsedData)
        .slice(0, 3)
        .map(function(row) { return {columns: row}; })
        .value()
    ),

    schema
  );

  assert(
    mapper[method].call(mapper).name === parsedData[0][index],
    'Mapping view returned wrong ' + options.conceptTitle + ' column'
  );

  done();
}

function triggerColumnFormChange(userForm) {
  var form = userForm || _.first(browser.window.APP.layout.mapper.layout.forms);
  form.trigger('concept:change', form);
}

// Get parsed data to feed to testing methods
before(function(done) {
  fs.readFile(path.join(dataDir, 'decent.csv'), 'utf8', function (error, text) {
    if(error)
      return console.log(error);

    csv.parse(text, function(error, data) {
      parsedData = data;
      parsedSchema = jtsInfer(data[0], _.rest(data));
      done();
    });
  });
});

describe('Columns mapping view', function() {
  beforeEach(completeStep1);

  it(
    'has a method that returns column mapped into Amount concept',

    function(done) { testMappingMethod(done, 'getAmount', {
      conceptName: 'mapping.measures.amount',
      conceptTitle: 'Amount'
    }); }
  );

  it(
    'has a method that returns column mapped into Date/Time concept',

    function(done) { testMappingMethod(done, 'getDateTime', {
      conceptName: 'mapping.date.properties.year',
      conceptTitle: 'Date/Time'
    }); }
  );

  it(
    'has a method that return true if there is Amount and Date/Time and false in other cases',

    function(done) {
      var mapper = browser.window.APP.activate().layout.mapper;

      mapper.reset(
        new backbone.Collection(
          _.chain(parsedData)
            .slice(0, 3)
            .map(function(row) { return {columns: row}; })
            .value()
        ),

        parsedSchema.fields
      );

      // Button should be disabled when no Amount and/or no Date/Time concepts defined
      browser.window.APP.$('.column-form [name="concept"]').val('');
      triggerColumnFormChange();
      assert(!mapper.isComplete());

      // Button should be disabled when no Date/Time concepts mapped
      browser.window.APP.$('.column-form [name="concept"]').val('');
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.measures.amount');
      triggerColumnFormChange();
      assert(!mapper.isComplete());

      // Button should be disabled when no Amount concepts mapped
      browser.window.APP.$('.column-form [name="concept"]').val('');
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.date.properties.year');
      triggerColumnFormChange();
      assert(!mapper.isComplete());

      // Enabled in other cases
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.measures.amount');
      browser.window.APP.$('.column-form:eq(1) [name="concept"]').val('mapping.date.properties.year');
      triggerColumnFormChange();
      assert(mapper.isComplete());

      done();
    }
  );
});

describe('Manual mapping of types', function() {
  this.timeout(25000);

  // Complete first step
  beforeEach(completeStep1);

  it('mark active step in sub header', function(done) {
    browser.assert.elements('[data-step-id="1"].is-active, [data-step-id="3"].is-active', 0);
    browser.assert.element('[data-step-id="2"].is-active');
    done();
  });

  it('shows header and first two rows of user data', function(done) {
    assert(_.chain(parsedData)
      .slice(0, 3)

      .every(function(row, rIndex) {
        return _.every(row, function(column, cIndex) {
          return column = browser.window.APP.$(
            '[data-id="user-data"] tr:eq(' + rIndex + ') td:eq(' + cIndex + ')'
          ).html()
        });
      })

      .value(),

      'User data table do not correspond to uploaded data'
    );

    done();
  });

  it('shows a populated form of certain properties for each column', function(done) {
    // Return certain form field value
    function value(index, name) {
      return browser.window.APP.$(
        '.column-form:eq(' + index + ') [name="' + name + '"]'
      ).val()
    }

    assert(
      _.every(_.first(parsedData), function(column, index) {
        var schema = parsedSchema.fields[index];

        return value(index, 'title') === inflect.titleize(schema.name) &&
          value(index, 'description') === '' &&
          value(index, 'type') === schema.type &&
          value(index, 'concept') === (schema.concept || '');
      }),

      'Columns forms do not correspond to user data'
    );

    done()
  });

  it(
    'requires to map at least an Amount and a Date/Time in order ' +
    'to proceed to the next step',

    function(done) {
      // Button should be disabled when no Amount and/or no Date/Time concepts defined
      browser.window.APP.$('.column-form [name="concept"]').val('');
      triggerColumnFormChange();
      browser.assert.element('[data-id="submit-button"].form-button--disabled');

      // Button should be disabled when no Date/Time concepts mapped
      browser.window.APP.$('.column-form [name="concept"]').val('');
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.measures.amount');
      triggerColumnFormChange();
      browser.assert.element('[data-id="submit-button"].form-button--disabled');

      // Button should be disabled when no Amount concepts mapped
      browser.window.APP.$('.column-form [name="concept"]').val('');
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.date.properties.year');
      triggerColumnFormChange();
      browser.assert.element('[data-id="submit-button"].form-button--disabled');

      // Enabled in other cases
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val('mapping.measures.amount');
      browser.window.APP.$('.column-form:eq(1) [name="concept"]').val('mapping.date.properties.year');
      triggerColumnFormChange();
      browser.assert.element('[data-id="submit-button"]:not(.form-button--disabled)');

      done();
    }
  );

  it('doesn\'t allow to pick more than one Amount or Date/Time', function(done) {
    _.each([
      {name: 'mapping.measures.amount', title: 'Amount'},
      {name: 'mapping.date.properties.year', title: 'Date/Time'},
      {name: 'mapping.classification.properties.id', title: 'Classification'},

      {
        name: 'mapping.classification.properties.id',
        title: 'Classification > ID'
      },

      {
        name: 'mapping.classification.properties.label',
        title: 'Classification > Label'
      },

      {name: 'mapping.entity.properties.id', title: 'Entity'},
      {name: 'mapping.entity.properties.id', title: 'Entity > ID'},
      {name: 'mapping.entity.properties.label', title: 'Entity > Label'}
    ], function(concept) {
      browser.window.APP.$('.column-form:eq(0) [name="concept"]').val(concept.name);
      triggerColumnFormChange();

      browser.window.APP.$('.column-form:eq(1) [name="concept"]').val(concept.name);

      triggerColumnFormChange(
        browser.window.APP.layout.mapper.layout.forms[1]
      );

      assert(
        browser.window.APP.$('.column-form option[value="' + concept.name + '"]:selected').size() === 1,
        'User allowed to pick more than one ' + concept.title
      );
    });

    done();
  });

  it('properly maps columns into concepts', function(done) {
    var mapper = browser.window.APP.layout.mapper;
    var index = _.random(mapper.layout.forms.length - 1);
    browser.window.APP.$('.column-form [name="concept"]').val('');

    browser.window.APP.$('.column-form:eq(' + index + ') [name="concept"]')
      .val('mapping.measures.amount');

    triggerColumnFormChange();

    assert(
      mapper.getAmount().name === parsedData[0][index],
      'Mapping view returns incorrect Amount column'
    );

    // Clear state
    browser.window.APP.$('.column-form [name="concept"]').val('');
    index = _.random(mapper.layout.forms.length - 1);

    browser.window.APP.$('.column-form:eq(' + index + ') [name="concept"]')
      .val('mapping.date.properties.year');

    assert(
      mapper.getDateTime().name === parsedData[0][index],
      'Mapping view returns incorrect Date/Time column'
    );

    done();
  });

  it('Step 2 is reset only if data changed on Step 1', function(done) {
    var app = browser.window.APP;

    var concept = _.sample([
      'mapping.measures.amount',
      'mapping.entity.properties.id',
      'mapping.classification.properties.id'
    ]);

    var router = browser.window.ROUTER;

    // Get back to Step 1, change nothing and proceed to Step 2
    app.$('.column-form [name="concept"]').val('');
    app.$('.column-form:eq(0) [name="concept"]').val(concept);
    router.navigate('/create', {trigger: true});

    setTimeout(function() {
      router.navigate('/map', {trigger: true});

      setTimeout(function() {
        assert(app.$(
          '.column-form:eq(0) [name="concept"] option[value="' + concept +
          '"]:selected'
        ).size() === 1);

        assert(app.$(
          '.column-form [name="concept"] option:not([value=""]):selected'
        ).size() === 1);

        // Get back to Step 1, upload new valid file with different schema and proceed to Step 2
        app.$('.column-form [name="concept"]').val('');
        app.$('.column-form:eq(0) [name="concept"]').val(concept);
        router.navigate('/create', {trigger: true});

        setTimeout(function() {
          app.layout.step1.layout.form.setValue('files', {
            data: [['name', 'age'], ['John', 33]],
            name: 'another.csv',

            schema: {fields: [
              {name: 'name', type: 'string'},
              {name: 'age', type: 'integer'}
            ]},

            size: 1
          });

          router.navigate('/map', {trigger: true});

          setTimeout(function() {
            assert(app.$(
              '.column-form:eq(0) [name="concept"] option[value="' + concept +
              '"]:selected'
            ).size() === 0);

            assert(app.$(
              '.column-form [name="concept"] option:not([value=""]):selected'
            ).size() === 0);

            done();
          });
        }, 300);
      }, 300);
    }, 300);    
  });
});