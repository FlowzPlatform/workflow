'use strict';
var entryFactory = require('../../../factory/EntryFactory'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements,
  elementHelper = require('../../../helper/ElementHelper'),
  extensionElements = require('./implementation/ExtensionElements');
// extensionElements = require('./implementation/MappingElements');
var cmdHelper = require('../../../helper/CmdHelper'),
  myPropetiesHelper = require('../../../helper/MyPropertyHelper');
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
    get: function(element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {},
        values = {};
      values[modelProperty] = selectedFormField[modelProperty];
      return values;
    },
    set: function(element, values, node) {
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
    hidden: function(element, node) {
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
    get: function(element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {},
        values = {};
      values[modelProperty] = selectedFormField[modelProperty];
      return values;
    },
    set: function(element, values, node) {
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
    hidden: function(element, node) {
      return !getSelectedFormField(element, node);
    },
    validate: validate
  });
}

function ensureFormKeyAndDataSupported(element) {
  return is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent');
}

function getChoice(bo) {
  return bo.get('camunda:choice');
}
// Camunda Properties Provider /////////////////////////////////////
module.exports = function(group, element, bpmnFactory, translate, options) {
  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }

  function getSelectedFormField(element, node) {
    var selected = formFieldsEntry.getSelected(element, node.parentNode);
    if (selected.idx === -1) {
      return;
    }
    return myPropetiesHelper.getFormField(element, selected.idx);
  }
  // let entitySchemaModel = await getSchema()
  // console.log(entitySchemaModel)
  // options = options || {};
  //   var getSelectedListener = options.getSelectedListener;
  // group.entries.push(entryFactory.textBox({
  //   id: 'Notes',
  //   label: translate('Notes'),
  //   modelProperty: 'notes',
  // }));
  // group.entries.push(entryFactory.selectBox({
  //   id: 'Choice',
  //   label: translate('Choice'),
  //   selectOptions: [{ name: '---select---', value: 0 },
  //     { name: 'Plain Request', value: 1 },
  //     { name: 'Single Choice', value: 2 },
  //     { name: 'Multi Choice', value: 3 }
  //   ],
  //   modelProperty: 'choice',
  //   // get: function (element, node) {
  //   //   var bo = getBusinessObject(element);
  //   //   return {
  //   //     choice: bo.get('camunda:choice')
  //   //   };
  //   // },
  //   // set: function (element, values) {
  //   //   var bo = getBusinessObject(element);
  //   //   var choice = values.choice;
  //   //   var props = {
  //   //     'camunda:choice': choice
  //   //   };
  //   //   var commands = [];
  //   //   commands.push(cmdHelper.updateBusinessObject(element, bo, props));
  //   //   return commands;
  //   // },
  //   validate: function (element, values) {
  //     var value = values.choice,
  //       validate = {};
  //     if (!value || value == 0) {
  //       validate.choice = translate('Must provide a value');
  //     }
  //     return validate;
  //   }
  // }));
  var entitySchemaOptions = options.schema.map(f => ({ value: f.id, name: f.title }))
    // group.entries.push(entryFactory.selectBox({
    //   id: 'Entity_Schema',
    //   label: 'Entity Schema',
    //   // [{ name: "Schema-FinalDiscussion", value: "35dfea15-baf9-4322-9bce-486e9f436555" }]
    //   selectOptions: entitySchemaOptions, // [{ name: '---select---', value: 0 }],
    //   modelProperty: 'entityschema',
    //   hidden: function (element, node) {
    //     var bo = getBusinessObject(element);
    //     if (bo && !getChoice(bo)) {
    //       return true
    //     } else {
    //       return Boolean(!(getChoice(bo) > 1));
    //     }
    //   }
    // }));
    // group.entries.push(entryFactory.link({
    //   id: 'list_schema',
    //   label: 'List Schema',
    //   // getClickableElement: list_schema,         
    //   modelProperty: 'list_schema'
    // }));
    // group.entries.push(entryFactory.selectBox({
    //   id: 'Approval_class',
    //   label: 'Approval class',
    //   selectOptions: options.approval, // [{ name: '---select---', value: 0 }],
    //   modelProperty: 'approvalClass'
    // }));
    // group.entries.push(entryFactory.link({
    //   id: 'list_approval',
    //   label: 'List Approval',
    //   // getClickableElement: list_approval,       
    //   modelProperty: 'list_approval',
    // }));
    // group.entries.push(entryFactory.selectBox({
    //   id: 'Email_Template',
    //   label: 'Email Template',
    //   selectOptions: options.emailtemplate, //[{ name: '---select---', value: 0 }],
    //   modelProperty: 'emailTemplate'
    // }));
    // group.entries.push(entryFactory.link({
    //   id: 'list_emailTemplate',
    //   label: 'List EmailTemplate',
    //   modelProperty: 'list_emailTemplate',
    //   // getClickableElement : list_emailTemplate     
    // }));
    // group.entries.push(entryFactory.textField({
    //   id: 'Submit_label',
    //   label: 'Submit label',
    //   modelProperty: 'submitLabel',
    // }));
    // [MyProperty] form field select box
  var formFieldsEntry = extensionElements(element, bpmnFactory, {
    id: 'my-propeties',
    label: translate('Entity'),
    modelProperty: 'id',
    prefix: 'Property',
    createExtensionElement: function(element, extensionElements, value) {
      var bo = getBusinessObject(element),
        commands = [];
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
      }
      var myProperty = myPropetiesHelper.getMyProperty(element);
      if (!myProperty) {
        myProperty = elementHelper.createElement('camunda:MyProperty', { fields: [] }, extensionElements, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements', [myProperty], []
        ));
      }
      var field = elementHelper.createElement('camunda:Property', { id: value }, myProperty, bpmnFactory);
      if (typeof myProperty.fields !== 'undefined') {
        commands.push(cmdHelper.addElementsTolist(element, myProperty, 'fields', [field]));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, myProperty, {
          fields: [field]
        }));
      }
      return commands;
    },
    removeExtensionElement: function(element, extensionElements, value, idx) {
      var myProperty = getExtensionElements(getBusinessObject(element), 'camunda:MyProperty')[0],
        entry = myProperty.fields[idx],
        commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, myProperty, 'fields', null, [entry]));
      return commands;
    },
    getExtensionElements: function(element) {
      return myPropetiesHelper.getFormFields(element);
    },
    hideExtensionElements: function(element, node) {
      return false;
    }
  });
  group.entries.push(formFieldsEntry);
  // [MyProperty] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'my-property-id',
    label: translate('ID'),
    modelProperty: 'id',
    getProperty: function(element, node) {
      var selectedFormField = getSelectedFormField(element, node) || {};
      return selectedFormField.id;
    },
    setProperty: function(element, properties, node) {
      var formField = getSelectedFormField(element, node);
      return cmdHelper.updateBusinessObject(element, formField, properties);
    },
    hidden: function(element, node) {
      return !getSelectedFormField(element, node);
    },
    validate: function(element, values, node) {
      var formField = getSelectedFormField(element, node);
      if (formField) {
        var idValue = values.id;
        if (!idValue || idValue.trim() === '') {
          return { id: 'Form field id must not be empty' };
        }
        var formFields = myPropetiesHelper.getFormFields(element);
        var existingFormField = find(formFields, function(f) {
          return f !== formField && f.id === idValue;
        });
        if (existingFormField) {
          return { id: 'Form field id already used in form data.' };
        }
      }
    }
  }));
  group.entries.push(formFieldTextField({
    id: 'my-property-notes',
    label: 'Notes',
    modelProperty: 'notes'
  }, getSelectedFormField));
  group.entries.push(formFieldSelectBox({
    id: 'my-property-entityschema',
    label: translate('Entity schema'),
    selectOptions: entitySchemaOptions,
    modelProperty: 'entityschema'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-property-Add_Schema',
    label: 'Add New',
    getClickableElement: function(element, node) {
      options.AddEntity()
    },
    hideLink: function(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-property-createTemplate',
    label: translate('Create Template'),
    // selectOptions: [],
    selectOptions: function(element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myPropetiesHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
        _.each(selectedEntity.createTemplate, function(field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'createTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-property-Create_template',
    label: 'Add/View',
    getClickableElement: function(element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  var entitySchemaViewTemplate = []
  group.entries.push(formFieldSelectBox({
    id: 'my-property-viewTemplate',
    label: translate('View Template'),
    //selectOptions: [],
    selectOptions: function(element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myPropetiesHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
        _.each(selectedEntity.viewTemplate, function(field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'viewTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-property-View_template',
    label: 'Add/View',
    getClickableElement: function(element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-property-emailTemplate',
    label: translate('Email Template'),
    // selectOptions: [],
    selectOptions: function(element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      var selected = formFieldsEntry.getSelected(element, inputNode.parentNode);
      var formField = myPropetiesHelper.getFormField(element, selected.idx);
      if (formField && formField.entityschema) {
        var selectedEntity = _.find(options.schema, function(d) { return d.id == formField.entityschema })
        _.each(selectedEntity.emailTemplate, function(field) {
          selectOptions.push({ name: field.filename, value: field.filename });
        });
      }
      return selectOptions;
    },
    modelProperty: 'emailTemplate'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-property-Email_template',
    label: 'Add/View',
    getClickableElement: function(element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      if (selectedEntity != undefined) {
        options.openTemplate(selectedEntity)
      }
    },
    hideLink: function(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  group.entries.push(formFieldSelectBox({
    id: 'my-property-choice',
    label: translate('Choice'),
    selectOptions: [{ name: '---select---', value: 0 },
      { name: 'Plain Request', value: 1 },
      { name: 'Single Choice', value: 2 },
      { name: 'Multi Choice', value: 3 }
    ],
    modelProperty: 'choice'
  }, getSelectedFormField));
  group.entries.push(formFieldSelectBox({
    id: 'my-property-approvalClass',
    label: translate('Approval Class'),
    selectOptions: options.approval,
    modelProperty: 'approvalClass'
  }, getSelectedFormField));
  group.entries.push(entryFactory.link({
    id: 'my-property-Approval',
    label: 'Add/View',
    getClickableElement: function(element, node) {
      let selectedEntity = element.businessObject.extensionElements.values[0].fields[0].entityschema
      options.openApprovalClass()
    },
    hideLink: function(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));
  // [MyProperty] form field label text input field
  group.entries.push(formFieldTextField({
    id: 'my-property-cancelLabel',
    label: translate('Cancel label'),
    modelProperty: 'cancelLabel'
  }, getSelectedFormField));
  group.entries.push(formFieldTextField({
    id: 'my-property-submitLabel',
    label: 'Submit label',
    modelProperty: 'submitLabel'
  }, getSelectedFormField));
};