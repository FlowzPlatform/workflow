'use strict';
var entryFactory = require('../../../factory/EntryFactory'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  elementHelper = require('../../../helper/ElementHelper'),
  getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements;
//mappingElements = require('./implementation/MappingElements');
var cmdHelper = require('../../../helper/CmdHelper');
var myIOMappingHelper = require('../../../helper/MyIOMappingHelper'),
  extensionElements = require('./implementation/ExtensionElements');
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
function mappingSelectBox(options, getSelectedMapping) {
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
      var selectedMapping = getSelectedMapping(element, node) || {},
        values = {};
      values[modelProperty] = selectedMapping[modelProperty];
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
      var mapping = getSelectedMapping(element, node),
        properties = {};
      properties[modelProperty] = values[modelProperty] || undefined;
      commands.push(cmdHelper.updateBusinessObject(element, mapping, properties));
      return commands;
    },
    hidden: function(element, node) {
      return !getSelectedMapping(element, node);
    },
    validate: validate
  });
}

function ensureFormKeyAndDataSupported(element) {
  return is(element, 'bpmn:SequenceFlow');
}
module.exports = function(group, element, bpmnFactory, translate, options) {
  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }
  // check source entity is exist
  var isValid = true
  var _source = []
  var _target = []
  var _outputField = []
  var _inputField = []
  var bo = getBusinessObject(element)
  if (!bo.sourceRef.extensionElements || !bo.targetRef.extensionElements) {
    isValid = false;
  } else {
    // var _source = _.find(bo.sourceRef.extensionElements.values, )
    _source = _.chain(bo.sourceRef.extensionElements.values).find((d) => { return d.$type == 'camunda:MyOutputs' }).result('fields').filter((d) => { return !d.entityschema }).value()
    _target = _.chain(bo.targetRef.extensionElements.values).find((d) => { return d.$type == 'camunda:MyProperty' }).result('fields').filter((d) => { return !d.entityschema }).value()
    console.log('_source', _source)
    if (_source.length > 0 || _target.length > 0) {
      isValid = false;
    } else {
      _outputField = _.chain(bo.targetRef.extensionElements.values).find((d) => { return d.$type == 'camunda:MyProperty' }).result('fields').map(m => {
        return { entityschema: m.entityschema, value: m.id, name: m.id + ' (' + options.schema.find(f => { return f.id == m.entityschema }).title + ')' }
      }).value()
      _inputField = _.chain(bo.sourceRef.extensionElements.values).find((d) => { return d.$type == 'camunda:MyOutputs' }).result('fields').map(m => {
        return { entityschema: m.entityschema, value: m.id, name: m.id + ' (' + options.schema.find(f => { return f.id == m.entityschema }).title + ')' }
      }).value()
    }
  }
  if (!isValid) {
    group.entries.push({
      id: 'error_msg',
      html: '<label data-value="label" ' +
        'data-show="showLabel" ' +
        'class="entry-label" style="font-weight: 100;color: #cc3333;">' +
        '</label>',
      get: function(element, node) {
        return { label: 'producer and consumer schema are required!' };
      },
      showLabel: function(element, node) {
        return true;
      }
    });
    return;
  }
  // group.entries.push(entryFactory.selectBox({
  //   id: 'Schama_Mapping',
  //   label: 'Schema Mapping',
  //   selectOptions: options.schemamapping,
  //   modelProperty: 'schemaMapping'
  // }));
  // group.entries.push(entryFactory.link({
  //   id: 'list_schemaMapping',
  //   label: 'List Schema Mapping',
  //   modelProperty: 'list_schemaMapping',
  //   // getClickableElement : list_emailTemplate     
  // }));
  // [MyIOMapping] form field select box
  var mappingsEntry = extensionElements(element, bpmnFactory, {
    id: 'mappings',
    label: translate('Entity Schema'),
    modelProperty: 'id',
    prefix: 'Mapping',
    createExtensionElement: function(element, extensionElements, value) {
      var bo = getBusinessObject(element),
        commands = [];
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
      }
      var myIOMapping = myIOMappingHelper.getMyIOMapping(element);
      if (!myIOMapping) {
        myIOMapping = elementHelper.createElement('camunda:MyIOMapping', { fields: [] }, extensionElements, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements', [myIOMapping], []
        ));
      }
      var field = elementHelper.createElement('camunda:Mapping', { id: value }, myIOMapping, bpmnFactory);
      if (typeof myIOMapping.fields !== 'undefined') {
        commands.push(cmdHelper.addElementsTolist(element, myIOMapping, 'fields', [field]));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, myIOMapping, {
          fields: [field]
        }));
      }
      return commands;
    },
    removeExtensionElement: function(element, extensionElements, value, idx) {
      var myIOMapping = getExtensionElements(getBusinessObject(element), 'camunda:MyIOMapping')[0],
        entry = myIOMapping.fields[idx],
        commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, myIOMapping, 'fields', null, [entry]));
      return commands;
    },
    getExtensionElements: function(element) {
      return myIOMappingHelper.getMappings(element);
    },
    hideExtensionElements: function(element, node) {
      return false;
    }
  });
  group.entries.push(mappingsEntry);

  function getSelectedMapping(element, node) {
    var selected = mappingsEntry.getSelected(element, node.parentNode);
    if (selected.idx === -1) {
      return;
    }
    return myIOMappingHelper.getMapping(element, selected.idx);
  }
  // [MyIOMapping] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'mappings-id',
    label: translate('ID'),
    modelProperty: 'id',
    getProperty: function(element, node) {
      var selectedMapping = getSelectedMapping(element, node) || {};
      return selectedMapping.id;
    },
    setProperty: function(element, properties, node) {
      var mapping = getSelectedMapping(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, properties);
    },
    hidden: function(element, node) {
      return !getSelectedMapping(element, node);
    },
    validate: function(element, values, node) {
      var mapping = getSelectedMapping(element, node);
      if (mapping) {
        var idValue = values.id;
        if (!idValue || idValue.trim() === '') {
          return { id: 'Form field id must not be empty' };
        }
        var mappings = myIOMappingHelper.getMappings(element);
        var existingMapping = find(mappings, function(f) {
          return f !== mapping && f.id === idValue;
        });
        if (existingMapping) {
          return { id: 'Form field id already used in form data.' };
        }
      }
    }
  }));
  var entitySchemaOptions = options.schema.map(f => ({ value: f.id, name: f.title }))
  group.entries.push(mappingSelectBox({
    id: 'mappings-producer',
    label: translate('Producer'),
    selectOptions: function(element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      _.each(_inputField, function(field) {
        selectOptions.push(field);
      });
      return selectOptions
    },
    // function(element, inputNode) {
    //   var selectOptions = [{ name: '--Select--', value: '' }];
    //   _.each(entitySchemaOptions, function(field) {
    //     if (_.find(_source, (d) => { return d.entityschema == field.value })) {
    //       selectOptions.push({ name: field.name, value: field.value });
    //     }
    //   });
    //   return selectOptions;
    // },
    modelProperty: 'producer'
  }, getSelectedMapping));
  group.entries.push(mappingSelectBox({
    id: 'mappings-consumer',
    label: translate('Consumer'),
    selectOptions: function(element, inputNode) {
      var selectOptions = [{ name: '--Select--', value: '' }];
      _.each(_outputField, function(field) {
        selectOptions.push(field);
      });
      return selectOptions
    },
    // function(element, inputNode) {
    //   var selectOptions = [{ name: '--Select--', value: '' }];
    //   _.each(entitySchemaOptions, function(field) {
    //     if (_.find(_target, (d) => { return d.entityschema == field.value })) {
    //       selectOptions.push({ name: field.name, value: field.value });
    //     }
    //   });
    //   return selectOptions;
    // },
    modelProperty: 'consumer'
  }, getSelectedMapping));
  group.entries.push(mappingSelectBox({
      id: 'mappings-schemamapping',
      label: translate('Mapped Schema'),
      selectOptions: function(element, inputNode) {
        var selectOptions = [{ name: '--Select--', value: '' }];
        var selected = mappingsEntry.getSelected(element, inputNode.parentNode);
        var formField = myIOMappingHelper.getMapping(element, selected.idx);
        if (formField && formField.consumer && formField.producer) {
          var schemamapping = _.filter(options.schemamapping, function(d) {
            return (d.consumer == _.find(_outputField, (f) => {
                return formField.consumer == f.value
              }).entityschema) &&
              (d.producer == _.find(_inputField, (f) => {
                return formField.producer == f.value
              }).entityschema)
          })
          _.forEach(schemamapping, (item) => {
            selectOptions.push({ name: item.title, value: item.id })
          });
        }
        return selectOptions;
        //return options.schemamapping
      },
      modelProperty: 'schemamapping'
    },
    getSelectedMapping));
}