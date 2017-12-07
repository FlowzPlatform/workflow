var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject
var getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements

var myConfigsHelper = {}
module.exports = myConfigsHelper

/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} MyInputs
 */
myConfigsHelper.getMyConfigs = (element) => {
  var bo = getBusinessObject(element)
  var myConfigs = getExtensionElements(bo, 'camunda:MyConfigurations')

  if (typeof myConfigs !== 'undefined') {
    return myConfigs[0]
  }
}

/**
 * Return all form fields existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of form field objects
 */
myConfigsHelper.getConfigFields = function (element) {
  var myConfigs = this.getMyConfigs(element)

  if (typeof myConfigs === 'undefined') {
    return []
  }
  return myConfigs.fields
}

/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
myConfigsHelper.getConfigField = function (element, idx) {
  var configFields = this.getConfigFields(element)
  return configFields[idx]
}
