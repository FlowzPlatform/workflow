'use strict';
var entryFactory = require('../../../factory/EntryFactory'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements,
  elementHelper = require('../../../helper/ElementHelper'),
  extensionElements = require('./implementation/ExtensionElements');
// extensionElements = require('./implementation/MappingElements');
var cmdHelper = require('../../../helper/CmdHelper'),
  myOutputsHelper = require('../../../helper/MyOutputHelper');
// formHelper = require('../../../helper/FormHelper');
var _ = require('lodash')
  /**
   * Generate a form field specific textField using entryFactory.
   *
   * @param  {string} options.id
   * @param  {string} options.label
   * @param  {string} options.modelProperty
   * @param  {function} options.validate
   *
   * @return {Object} an entryFactory.textField object
   */
function formFieldTextField(options, getSelectedFormField) {
  var id = options.id,
    label = options.label,
    modelProperty = options.modelProperty,
    validate = options.validate;
  return entryFactory.textField({
    id: id,
    label: label,
    modelProperty: modelProperty,
    get: function (element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {},
        values = {};
      values[modelProperty] = selectedFormField[modelProperty];
      return values;
    },
    set: function (element, values, node) {
      var commands = [];
      if (typeof options.set === 'function') {
        var cmd = options.set(element, values, node);
        if (cmd) {
          commands.push(cmd);
        }
      }
      var formField = getSelectedFormField(element, node),
        properties = {};
      properties[modelProperty] = values[modelProperty] || undefined;
      commands.push(cmdHelper.updateBusinessObject(element, formField, properties));
      return commands;
    },
    hidden: function (element, node) {
      return !getSelectedFormField(element, node);
    },
    validate: validate
  });
}
/**
 * Generate a form field specific textField using entryFactory.
 *
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {string} options.modelProperty
 * @param  {function} options.validate
 *
 * @return {Object} an entryFactory.textField object
 */
function formFieldSelectBox(options, getSelectedFormField) {
  var id = options.id,
    label = options.label,
    modelProperty = options.modelProperty,
    selectOptions = options.selectOptions,
    validate = options.validate;
  return entryFactory.selectBox({
    id: id,
    label: label,
    modelProperty: modelProperty,
    selectOptions: selectOptions,
    get: function (element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {},
        values = {};
      values[modelProperty] = selectedFormField[modelProperty];
      return values;
    },
    set: function (element, values, node) {
      var commands = [];
      if (typeof options.set === 'function') {
        var cmd = options.set(element, values, node);
        if (cmd) {
          commands.push(cmd);
        }
      }
      var formField = getSelectedFormField(element, node),
        properties = {};
      properties[modelProperty] = values[modelProperty] || undefined;
      commands.push(cmdHelper.updateBusinessObject(element, formField, properties));
      return commands;
    },
    hidden: function (element, node) {
      return !getSelectedFormField(element, node);
    },
    validate: validate
  });
}

function ensureFormKeyAndDataSupported(element) {
  // return is(element, 'bpmn:ExclusiveGateway') || is(element, 'bpmn:InclusiveGateway') ||
  //   is(element, 'bpmn:ParallelGateway') || is(element, 'bpmn:ComplexGateway') ||
  //   is(element, 'bpmn:EventBasedGateway');
  return is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent') || (element.type).match(/camunda:/gi)
}

function getChoice(bo) {
  return bo.get('camunda:choice');
}
// Camunda Properties Provider /////////////////////////////////////
module.exports = function (group, element, bpmnFactory, translate, options) {
  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }

  function getSelectedFormField(element, node) {
    var selected = formFieldsEntry.getSelected(element, node.parentNode);
    if (selected.idx === -1) {
      return;
    }
    return myOutputsHelper.getFormField(element, selected.idx);
  }
  var entitySchemaOptions = options.schema.map(f => ({ value: f.id, name: f.title }))
  var formFieldsEntry = extensionElements(element, bpmnFactory, {
    id: 'my-outputs',
    label: translate('Add'),
    modelProperty: 'id',
    prefix: 'Output',
    createExtensionElement: function (element, extensionElements, value) {
      var bo = getBusinessObject(element),
        commands = [];
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
      }
      var myOutputs = myOutputsHelper.getMyOutputs(element);
      if (!myOutputs) {
        myOutputs = elementHelper.createElement('camunda:MyOutputs', { fields: [] }, extensionElements, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements', [myOutputs], []
        ));
      }
      var field = elementHelper.createElement('camunda:Output', { id: value }, myOutputs, bpmnFactory);
      if (typeof myOutputs.fields !== 'undefined') {
        commands.push(cmdHelper.addElementsTolist(element, myOutputs, 'fields', [field]));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, myOutputs, {
          fields: [field]
        }));
      }
      return commands;
    },
    removeExtensionElement: function (element, extensionElements, value, idx) {
      var myOutputs = getExtensionElements(getBusinessObject(element), 'camunda:MyOutputs')[0],
        entry = myOutputs.fields[idx],
        commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, myOutputs, 'fields', null, [entry]));
      return commands;
    },
    getExtensionElements: function (element) {
      return myOutputsHelper.getFormFields(element);
    },
    hideExtensionElements: function (element, node) {
      return false;
    }
  });
  group.entries.push(formFieldsEntry);
  // [MyOutputs] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'my-output-id',
    label: translate('Name'),
    modelProperty: 'id',
    getProperty: function (element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {};
      return selectedFormField.id;
    },
    setProperty: function (element, properties, node) {
      var formField = getSelectedFormField(element, node);
      return cmdHelper.updateBusinessObject(element, formField, properties);
    },
    hidden: function (element, node) {
      return !getSelectedFormField(element, node);
    },
    validate: function (element, values, node) {
      var formField = getSelectedFormField(element, node);
      if (formField) {
        var idValue = values.id;
        if (!idValue || idValue.trim() === '') {
          return { id: 'Form field id must not be empty' };
        }
        var formFields = myOutputsHelper.getFormFields(element);
        var existingFormField = find(formFields, function (f) {
          return f !== formField && f.id === idValue;
        });
        if (existingFormField) {
          return { id: 'Form field id already used in form data.' };
        }
      }
    }
  }));
  // group.entries.push(formFieldTextField({
  //   id: 'my-output-condition',
  //   label: 'Condition',
  //   modelProperty: 'condition'
  // }, getSelectedFormField));
  group.entries.push(formFieldSelectBox({
    id: 'my-output-entityschema',
    label: translate('Schema Type'),
    selectOptions: entitySchemaOptions,
    modelProperty: 'entityschema'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-output-Add_Schema',
    label: 'Add Schema',
    getClickableElement: function (element, node) {
      options.AddEntity()
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  //   group.entries.push(formFieldSelectBox({
  //     id: 'my-output-createTemplate',
  //     label: translate('Create Template'),
  //     // selectOptions: [],
  //     selectOptions: function(element, inputNode) {
  //       var selectOptions = [{ name: '--Select--', value: '' }];
  //       var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
  //       var formField = myOutputsHelper.getFormField(element, selected.idx);
  //       if (formField && formField.entityschema) {
  //         var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
  //         _.each(selectedEntity.createTemplate, function(field) {
  //           selectOptions.push({ name: field.filename, value: field.filename });
  //         });
  //       }
  //       return selectOptions;
  //     },
  //     modelProperty: 'createTemplate'
  //   }, getSelectedFormField));
  //   group.entries.push(entryFactory.link({
  //     id: 'my-output-Create_template',
  //     label: 'Add/View',
  //     getClickableElement: function(element, node) {
  //       let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
  //       if (selectedEntity != undefined) {
  //         options.openTemplate(selectedEntity)
  //       }
  //     },
  //     hideLink: function(element, node) {
  //       return !getSelectedFormField(element, node);
  //     }
  //   }));
  //   var entitySchemaViewTemplate = []
  //   group.entries.push(formFieldSelectBox({
  //     id: 'my-output-viewTemplate',
  //     label: translate('View Template'),
  //     //selectOptions: [],
  //     selectOptions: function(element, inputNode) {
  //       var selectOptions = [{ name: '--Select--', value: '' }];
  //       var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
  //       var formField = myOutputsHelper.getFormField(element, selected.idx);
  //       if (formField && formField.entityschema) {
  //         var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
  //         _.each(selectedEntity.viewTemplate, function(field) {
  //           selectOptions.push({ name: field.filename, value: field.filename });
  //         });
  //       }
  //       return selectOptions;
  //     },
  //     modelProperty: 'viewTemplate'
  //   }, getSelectedFormField));
  //   group.entries.push(entryFactory.link({
  //     id: 'my-output-View_template',
  //     label: 'Add/View',
  //     getClickableElement: function(element, node) {
  //       let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
  //       if (selectedEntity != undefined) {
  //         options.openTemplate(selectedEntity)
  //       }
  //     },
  //     hideLink: function(element, node) {
  //       return !getSelectedFormField(element, node);
  //     }
  //   }));
  //   group.entries.push(formFieldSelectBox({
  //     id: 'my-output-emailTemplate',
  //     label: translate('Email Template'),
  //     // selectOptions: [],
  //     selectOptions: function(element, inputNode) {
  //       var selectOptions = [{ name: '--Select--', value: '' }];
  //       var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
  //       var formField = myOutputsHelper.getFormField(element, selected.idx);
  //       if (formField && formField.entityschema) {
  //         var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
  //         _.each(selectedEntity.emailTemplate, function(field) {
  //           selectOptions.push({ name: field.filename, value: field.filename });
  //         });
  //       }
  //       return selectOptions;
  //     },
  //     modelProperty: 'emailTemplate'
  //   }, getSelectedFormField));
  //   group.entries.push(entryFactory.link({
  //     id: 'my-output-Email_template',
  //     label: 'Add/View',
  //     getClickableElement: function(element, node) {
  //       let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
  //       if (selectedEntity != undefined) {
  //         options.openTemplate(selectedEntity)
  //       }
  //     },
  //     hideLink: function(element, node) {
  //       return !getSelectedFormField(element, node);
  //     }
  //   }));
  //   group.entries.push(formFieldSelectBox({
  //     id: 'my-output-choice',
  //     label: translate('Choice'),
  //     selectOptions: [{ name: '---select---', value: 0 },
  //       { name: 'Plain Request', value: 1 },
  //       { name: 'Single Choice', value: 2 },
  //       { name: 'Multi Choice', value: 3 }
  //     ],
  //     modelProperty: 'choice'
  //   }, getSelectedFormField));
  //   group.entries.push(formFieldSelectBox({
  //     id: 'my-output-approvalClass',
  //     label: translate('Approval Class'),
  //     selectOptions: options.approval,
  //     modelProperty: 'approvalClass'
  //   }, getSelectedFormField));
  //   group.entries.push(entryFactory.link({
  //     id: 'my-output-Approval',
  //     label: 'Add/View',
  //     getClickableElement: function(element, node) {
  //       let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
  //       options.openApprovalClass()
  //     },
  //     hideLink: function(element, node) {
  //       return !getSelectedFormField(element, node);
  //     }
  //   }));
  // [MyOutputs] form field label text input field
  //   group.entries.push(formFieldTextField({
  //     id: 'my-output-cancelLabel',
  //     label: translate('Cancel label'),
  //     modelProperty: 'cancelLabel'
  //   }, getSelectedFormField));
  //   group.entries.push(formFieldTextField({
  //     id: 'my-output-submitLabel',
  //     label: 'Submit label',
  //     modelProperty: 'submitLabel'
  //   }, getSelectedFormField));
};
