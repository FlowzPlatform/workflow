'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;

var myInputsHelper = {};

module.exports = myInputsHelper;

/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} MyInputs
 */
myInputsHelper.getMyInputs = function (element) {
  var bo = getBusinessObject(element);

  var myInputs = getExtensionElements(bo, 'camunda:MyInputs');

  if (typeof myInputs !== 'undefined') {
    return myInputs[0];
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
myInputsHelper.getFormFields = function (element) {
  var myInputs = this.getMyInputs(element);

  if (typeof myInputs === 'undefined') {
    return [];
  }

  return myInputs.fields;
};


/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
myInputsHelper.getFormField = function (element, idx) {

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
myInputsHelper.getConstraints = function (formField) {
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
myInputsHelper.getEnumValues = function (formField) {
  if (formField && formField.values) {
    return formField.values;
  }
  return [];
};
