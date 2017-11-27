var entryFactory = require('../../../factory/EntryFactory')
var is = require('bpmn-js/lib/util/ModelUtil').is
var extensionElements = require('./implementation/ExtensionElements')
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject
var elementHelper = require('../../../helper/ElementHelper')
var cmdHelper = require('../../../helper/CmdHelper')
var getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements

// add helper js
var myConfigsHelper = require('../../../helper/MyConfigsHelper')

let ensureFormKeyAndDataSupported = (element) => {
  return (is(element, 'bpmn:Task') || is(element, 'bpmn:StartEvent') || (element.type).match(/camunda:/gi))
}

// Camunda Properties Provider /////////////////////////////////////
module.exports = (group, element, bpmnFactory, translate, options) => {
  if (!ensureFormKeyAndDataSupported(element)) {
    return
  }

  let getSelectedConfigField = (element, node) => {
    var selected = configFieldsEntry.getSelected(element, node.parentNode)
    if (selected.idx === -1) {
      return
    }
    return myConfigsHelper.getConfigField(element, selected.idx)
  }

  var configFieldsEntry = extensionElements(element, bpmnFactory, {
      id: 'my-config',
      label: translate('Configuration'),
      modelProperty: 'key',
      prefix: 'Config',
      createExtensionElement: function (element, extensionElements, value) {
        var bo = getBusinessObject(element)
        var commands = []
          // add extemsion elements
        if (!extensionElements) {
          extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
          commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }))
        }
        // add configurations list node
        var myConfigs = myConfigsHelper.getMyConfigs(element)
        if (!myConfigs) {
          myConfigs = elementHelper.createElement('camunda:MyConfigurations', { fields: [] }, extensionElements, bpmnFactory)
          commands.push(cmdHelper.addAndRemoveElementsFromList(
            element,
            extensionElements,
            'values',
            'extensionElements', [myConfigs], []
          ))
        }
        // add configuration node
        var configField = elementHelper.createElement('camunda:Configuration', { key: value }, myConfigs, bpmnFactory)
        if (typeof myConfigs.fields !== 'undefined') {
          commands.push(cmdHelper.addElementsTolist(element, myConfigs, 'fields', [configField]))
        } else {
          commands.push(cmdHelper.updateBusinessObject(element, myConfigs, {
            fields: [configField]
          }))
        }
        return commands
      },
      removeExtensionElement: function (element, extensionElements, value, idx) {
        var myConfigs = getExtensionElements(getBusinessObject(element), 'camunda:MyConfigurations')[0]
        var entry = myConfigs.fields[idx]
        var commands = []
        commands.push(cmdHelper.removeElementsFromList(element, myConfigs, 'fields', null, [entry]))
        return commands
      },
      getExtensionElements: function (element) {
        return myConfigsHelper.getConfigFields(element)
      },
      hideExtensionElements: function (element, node) {
        return false
      }
    })
    // Config fields entry add in group entries
  group.entries.push(configFieldsEntry)

  // [MyConfig] configuration id text input
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'my-config-key',
    label: translate('Key'),
    modelProperty: 'key',
    getProperty: function (element, node) {
      var selectedConfigField = getSelectedConfigField(element, node) || {}
      return selectedConfigField.key
    },
    setProperty: function (element, properties, node) {
      var configField = getSelectedConfigField(element, node)
      return cmdHelper.updateBusinessObject(element, configField, properties)
    },
    hidden: function (element, node) {
      return !getSelectedConfigField(element, node)
    },
    validate: function (element, values, node) {}
  }))

  group.entries.push(entryFactory.validationAwareTextField({
    id: 'my-config-value',
    label: translate('Value'),
    modelProperty: 'value',
    getProperty: function (element, node) {
      var selectedConfigField = getSelectedConfigField(element, node) || {}
      return selectedConfigField.value
    },
    setProperty: function (element, properties, node) {
      var configField = getSelectedConfigField(element, node)
      return cmdHelper.updateBusinessObject(element, configField, properties)
    },
    hidden: function (element, node) {
      return !getSelectedConfigField(element, node)
    },
    validate: function (element, values, node) {}
  }))
}
