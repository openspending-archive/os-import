module.exports = {
  fail: {
    'report': {
      'meta': {
          'bad_column_count': 0,
          'bad_row_count': 0,

          'columns': [
            {
              'bad_type_percent': 0,
              'index': 0,
              'name': '123'
            }
          ],

          'header_index': 0,
          'headers': ['123'],
          'name': 'Pipeline',
          'row_count': 1
      },

      'results': [
        {
          '2': {
            'result_context': [
              '',
              '',
              ''
            ],

            'results': [
              {
                'column_index': null,
                'column_name': '',
                'processor': 'structure',
                'result_category': 'row',
                'result_id': 'structure_005',
                'result_level': 'error',
                'result_message': 'Row 2 is empty.',
                'result_name': 'Empty Row',
                'row_name': ''
              },

              {
                'column_index': 0,
                'column_name': 'id',
                'processor': 'schema',
                'result_category': 'row',
                'result_id': 'schema_003',
                'result_level': 'warning',
                'result_message': 'The value is not a valid Integer.',
                'result_name': 'Incorrect Type',
                'row_name': ''
              },

              {
                'column_index': 0,
                'column_name': 'id',
                'processor': 'schema',
                'result_category': 'row',
                'result_id': 'schema_004',
                'result_level': 'error',
                'result_message': 'Column id is a required field, but no value can be found in row 2.',
                'result_name': 'Required Field',
                'row_name': ''
              },
            ],

            'row_index': 2
          }
        },

        {
          '3': {
            'result_context': [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6'
            ],

            'results': [
              {
                'column_index': null,
                'column_name': '',
                'processor': 'structure',
                'result_category': 'row',
                'result_id': 'structure_003',
                'result_level': 'error',
                'result_message': 'Row 3 is defective: the dimensions are incorrect compared to headers.',
                'result_name': 'Defective Row',
                'row_name': ''
              },

              {
                'column_index': null,
                'column_name': '',
                'processor': 'schema',
                'result_category': 'row',
                'result_id': 'schema_002',
                'result_level': 'warning',
                'result_message': 'The row dimensions do not match the header dimensions.',
                'result_name': 'Incorrect Dimensions',
                'row_name': '1'
              }
            ],

            'row_index': 3
          }
        }]
    },

    'success': true
  },

  success: {
    'report': {
      'meta': {
        'bad_column_count': 0,
        'bad_row_count': 0,

        'columns': [
          {
            'bad_type_percent': 0,
            'index': 0,
            'name': '123'
          }
        ],

        'header_index': 0,
        'headers': ['123'],
        'name': 'Pipeline',
        'row_count': 1
      },

      'results': []
    },

    'success': true
  }
};
