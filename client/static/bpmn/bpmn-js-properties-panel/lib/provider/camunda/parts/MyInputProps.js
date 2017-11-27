'use strict';
var entryFactory = require('../../../factory/EntryFactory'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements,
  elementHelper = require('../../../helper/ElementHelper'),
  extensionElements = require('./implementation/ExtensionElements');
// extensionElements = require('./implementation/MappingElements');
var cmdHelper = require('../../../helper/CmdHelper'),
  myInputsHelper = require('../../../helper/MyInputsHelper');
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
    validate = options.validate,
    hidden = options.hidden;
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
    hidden: hidden || function (element, node) {
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
  return is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent') || (element.type).match(/camunda:/gi);
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
    return myInputsHelper.getFormField(element, selected.idx);
  }

  var entitySchemaOptions = options.schema.map(f => ({ value: f.id, name: f.title }))

  // [MyInputs] form field select box
  var formFieldsEntry = extensionElements(element, bpmnFactory, {
    id: 'my-propeties',
    label: translate('Entity'),
    modelProperty: 'id',
    prefix: 'Input',
    createExtensionElement: function (element, extensionElements, value) {
      var bo = getBusinessObject(element),
        commands = [];
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
      }
      var myInputs = myInputsHelper.getMyInputs(element);
      if (!myInputs) {
        myInputs = elementHelper.createElement('camunda:MyInputs', { fields: [] }, extensionElements, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements', [myInputs], []
        ));
      }
      var field = elementHelper.createElement('camunda:Input', { id: value }, myInputs, bpmnFactory);
      if (typeof myInputs.fields !== 'undefined') {
        commands.push(cmdHelper.addElementsTolist(element, myInputs, 'fields', [field]));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, myInputs, {
          fields: [field]
        }));
      }
      return commands;
    },
    removeExtensionElement: function (element, extensionElements, value, idx) {
      var myInputs = getExtensionElements(getBusinessObject(element), 'camunda:MyInputs')[0],
        entry = myInputs.fields[idx],
        commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, myInputs, 'fields', null, [entry]));
      return commands;
    },
    getExtensionElements: function (element) {
      return myInputsHelper.getFormFields(element);
    },
    hideExtensionElements: function (element, node) {
      return false;
    }
  });
  group.entries.push(formFieldsEntry);
  // [MyInputs] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'my-input-id',
    label: translate('ID'),
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
        var formFields = myInputsHelper.getFormFields(element);
        var existingFormField = find(formFields, function (f) {
          return f !== formField && f.id === idValue;
        });
        if (existingFormField) {
          return { id: 'Form field id already used in form data.' };
        }
      }
    }
  }));
  group.entries.push(formFieldTextField({
    id: 'my-input-notes',
    label: 'Notes',
    modelProperty: 'notes'
  }, getSelectedFormField));
  group.entries.push(formFieldSelectBox({
    id: 'my-input-entityschema',
    label: translate('Entity schema'),
    selectOptions: entitySchemaOptions,
    modelProperty: 'entityschema'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-input-Add_Schema',
    label: 'Add New',
    getClickableElement: function (element, node) {
      options.AddEntity()
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-input-createTemplate',
    label: translate('Create Template'),
    // selectOptions: [],
    selectOptions: function (element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myInputsHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function (d) { return d.id == formField.entityschema })
        _.each(selectedEntity.createTemplate, function (field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'createTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-input-Create_template',
    label: 'Add/View',
    getClickableElement: function (element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  var entitySchemaViewTemplate = []
  group.entries.push(formFieldSelectBox({
    id: 'my-input-viewTemplate',
    label: translate('View Template'),
    //selectOptions: [],
    selectOptions: function (element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myInputsHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function (d) { return d.id == formField.entityschema })
        _.each(selectedEntity.viewTemplate, function (field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'viewTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-input-View_template',
    label: 'Add/View',
    getClickableElement: function (element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-input-emailTemplate',
    label: translate('Email Template'),
    // selectOptions: [],
    selectOptions: function (element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myInputsHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function (d) { return d.id == formField.entityschema })
        _.each(selectedEntity.emailTemplate, function (field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'emailTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-input-Email_template',
    label: 'Add/View',
    getClickableElement: function (element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-input-choice',
    label: translate('Choice'),
    selectOptions: [{ name: '---select---', value: 0 },
      { name: 'Plain Request', value: 1 },
      { name: 'Single Choice', value: 2 },
      { name: 'Multi Choice', value: 3 }
    ],
    modelProperty: 'choice'
  }, getSelectedFormField));
  group.entries.push(formFieldSelectBox({
    id: 'my-input-approvalClass',
    label: translate('Approval Class'),
    selectOptions: options.approval,
    modelProperty: 'approvalClass'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-input-Approval',
    label: 'Add/View',
    getClickableElement: function (element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      options.openApprovalClass()
    },
    hideLink: function (element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  // [MyInputs] form field label text input field
  group.entries.push(formFieldTextField({
    id: 'my-input-cancelLabel',
    label: translate('Cancel label'),
    modelProperty: 'cancelLabel'
  }, getSelectedFormField));
  group.entries.push(formFieldTextField({
    id: 'my-input-submitLabel',
    label: 'Submit label',
    modelProperty: 'submitLabel'
  }, getSelectedFormField));

  // group.entries.push(entryFactory.checkbox({
  //   id: 'my-input-is-form-input',
  //   label: translate('Is Form Input'),
  //   modelProperty: 'isFormInput',
  //   get: function (element, node) {
  //     var selectedFormField = getSelectedFormField(element, node) || {},
  //       values = {};
  //     values['isFormInput'] = selectedFormField['isFormInput'];
  //     return values;
  //   },
  //   set: function (element, values, node) {
  //     var commands = [];
  //     if (typeof options.set === 'function') {
  //       var cmd = options.set(element, values, node);
  //       if (cmd) {
  //         commands.push(cmd);
  //       }
  //     }
  //     var formField = getSelectedFormField(element, node),
  //       properties = {};
  //     properties['isFormInput'] = values['isFormInput'] || undefined;
  //     commands.push(cmdHelper.updateBusinessObject(element, formField, properties));
  //     return commands;
  //   },
  //   hidden: function (element, node) {
  //     return !getSelectedFormField(element, node);
  //   }
  // }));

  // group.entries.push(formFieldTextField({
  //   id: 'my-input-capacity',
  //   label: 'Capacity',
  //   modelProperty: 'capacity',
  //   hidden: function (element, node) {
  //     var formField = getSelectedFormField(element, node);
  //     if (formField) {
  //       return !formField.isFormInput
  //     } else {
  //       return !getSelectedFormField(element, node)
  //     }
  //   }
  // }, getSelectedFormField));
};
