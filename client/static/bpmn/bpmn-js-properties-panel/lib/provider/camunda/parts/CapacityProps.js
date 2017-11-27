'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is
var entryFactory = require('../../../factory/EntryFactory')
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject

function ensureFormKeyAndDataSupported(element) {
  return is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent') || (element.type).match(/camunda:/gi);
}

module.exports = function (group, element, translate) {
  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }

  // capacity
  group.entries.push(entryFactory.checkbox({
    id: 'is-form-input',
    label: translate('Is Form Input'),
    modelProperty: 'isFormInput'
  }))

  group.entries.push(entryFactory.textField({
    id: 'capacity',
    label: 'Capacity',
    modelProperty: 'capacity',
    hidden: function (element, node) {
      var bo = getBusinessObject(element);
      var isFormInput = bo.get('camunda:isFormInput');
      return !isFormInput
    }
  }))

  // is Process Task
  group.entries.push(entryFactory.checkbox({
    id: 'is-task-process',
    label: translate('Task Process'),
    modelProperty: 'isProcessTask'
  }))
}
