'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    utils = require('../../../Utils'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    cmdHelper = require('../../../helper/CmdHelper');
let data_ = []

module.exports = function(group, element, bpmnFactory, translate, options) {

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
    if (options != undefined) {
      data_ = options.schema
    }
    let entitySchemaOptions = data_.map(f => ({ value: f.id, name: f.title }))

    let SchemaEntry = entryFactory.selectBox({
      id: 'schema',
      label: translate('Schema'),
      selectOptions: entitySchemaOptions,
      modelProperty: 'schema'
    });

    // in participants we have to change the default behavior of set and get
    if (is(element, 'bpmn:Participant')) {
      SchemaEntry.get = function(element) {
        var processBo = bo.get('processRef');
        
        return {
          schema: processBo.get('camunda:schema')
        };
      };

      SchemaEntry.set = function(element, values) {
        var processBo = bo.get('processRef');

        return cmdHelper.updateBusinessObject(element, processBo, {
          'camunda:schema': values.schema || undefined
        });
      };
    }

    group.entries.push(SchemaEntry);

  }
};

// module.exports = function(group, element, bpmnFactory, translate, options) {
//   if (options != undefined) {
//     data_ = options.schema
//   }
//   console.log('options', data_)
  
//   let entitySchemaOptions = data_.map(f => ({ value: f.id, name: f.title }))
//   // let entitySchemaOptions = [{ value: 'f.id', name: 'f.title' }]

//   group.entries.push(entryFactory.selectBox({
//     id: 'schema',
//     label: translate('Schema'),
//     selectOptions: entitySchemaOptions,
//     modelProperty: 'schema'
//     // get: function (element, node) {
//     //  return getBusinessObject(element).id;
//     // },
//     // set: function (element, values, node) {
//     //   element = element.labelTarget || element;

//     //   return cmdHelper.updateProperties(element, properties);
//     // }
//   }));
// }
