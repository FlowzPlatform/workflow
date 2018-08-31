'use strict';
var is = require('bpmn-js/lib/util/ModelUtil').is
var entryFactory = require('../../../factory/EntryFactory')
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject

function ensureFormKeyAndDataSupported(element) {
  return is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent') || (element.type).match(/camunda:/gi);
}
module.exports = function(group, element, translate) {
  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }
  // capacity
  // group.entries.push(entryFactory.checkbox({
  //   id: 'is-form-input',
  //   label: translate('Is Form Input'),
  //   modelProperty: 'isFormInput'
  // }))
  // group.entries.push(entryFactory.textField({
  //     id: 'capacity',
  //     label: 'Capacity',
  //     modelProperty: 'capacity',
  //     hidden: function(element, node) {
  //       var bo = getBusinessObject(element);
  //       var isFormInput = bo.get('camunda:isFormInput');
  //       return !isFormInput
  //     }
  //   }))
  // button label
  // group.entries.push(entryFactory.checkbox({
  //   id: 'isButton',
  //   label: translate('Is Button'),
  //   modelProperty: 'isButton'
  // }))
  // group.entries.push(entryFactory.textField({
  //   id: 'buttonLabel',
  //   label: 'Button Label',
  //   modelProperty: 'buttonLabel',
  //   hidden: function (element, node) {
  //     var bo = getBusinessObject(element);
  //     var isFormInput = bo.get('camunda:isButton');
  //     return !isFormInput
  //   }
  // }))
    //Execute Any
  // group.entries.push(entryFactory.checkbox({
  //   id: 'execute-if-any',
  //   label: translate('Execute if Any'),
  //   modelProperty: 'executeIfAny'
  // }))
  // group.entries.push(entryFactory.textField({
  //     id: 'countany',
  //     label: 'Countany',
  //     modelProperty: 'countany',
  //     hidden: function(element, node) {
  //       var bo = getBusinessObject(element);
  //       var executeIfAny = bo.get('camunda:executeIfAny');
  //       return !executeIfAny
  //     }
  //   }))
    // is Process Task
  // group.entries.push(entryFactory.checkbox({
  //   id: 'is-task-process',
  //   label: translate('Task Process'),
  //   modelProperty: 'isProcessTask'
  // }))
}