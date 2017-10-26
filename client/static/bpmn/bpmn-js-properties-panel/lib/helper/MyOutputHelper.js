'use strict';
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;
var MyOutputsHelper = {};
module.exports = MyOutputsHelper;
/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} MyOutputs
 */
MyOutputsHelper.getMyOutputs = function(element) {
  var bo = getBusinessObject(element);
  var myOutPuts = getExtensionElements(bo, 'camunda:MyOutputs');
  if (typeof myOutPuts !== 'undefined') {
    return myOutPuts[0];
  }
};
/**
 * Return all form fields existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of form field objects
 */
MyOutputsHelper.getFormFields = function(element) {
  var myOutPut = this.getMyOutputs(element);
  if (typeof myOutPut === 'undefined') {
    return [];
  }
  return myOutPut.fields;
};
/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
MyOutputsHelper.getFormField = function(element, idx) {
  var formFields = this.getFormFields(element);
  return formFields[idx];
};
/**
 * Get all constraints for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of constraint objects
 */
MyOutputsHelper.getConstraints = function(formField) {
  if (formField && formField.validation && formField.validation.constraints) {
    return formField.validation.constraints;
  }
  return [];
};
/**
 * Get all camunda:value objects for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of camunda:value objects
 */
MyOutputsHelper.getEnumValues = function(formField) {
  if (formField && formField.values) {
    return formField.values;
  }
  return [];
};