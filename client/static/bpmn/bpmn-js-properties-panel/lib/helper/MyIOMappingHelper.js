'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  getExtensionElements = require('./ExtensionElementsHelper').getExtensionElements;

var MyIOMappingHelper = {};

module.exports = MyIOMappingHelper;

/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} MyIOMapping
 */
MyIOMappingHelper.getMyIOMapping = function (element) {
  var bo = getBusinessObject(element);

  var myIOMapping = getExtensionElements(bo, 'camunda:MyIOMapping');

  if (typeof myIOMapping !== 'undefined') {
    return myIOMapping[0];
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
MyIOMappingHelper.getMappings = function (element) {
  var myIOMapping = this.getMyIOMapping(element);

  if (typeof myIOMapping === 'undefined') {
    return [];
  }

  return myIOMapping.fields;
};


/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
MyIOMappingHelper.getMapping = function (element, idx) {

  var mappings = this.getMappings(element);

  return mappings[idx];
};


/**
 * Get all constraints for a specific form field from the business object
 *
 * @param  {ModdleElement} mapping
 *
 * @return {Array<ModdleElement>} a list of constraint objects
 */
MyIOMappingHelper.getConstraints = function (mapping) {
  if (mapping && mapping.validation && mapping.validation.constraints) {
    return mapping.validation.constraints;
  }
  return [];
};


/**
 * Get all camunda:value objects for a specific form field from the business object
 *
 * @param  {ModdleElement} mapping
 *
 * @return {Array<ModdleElement>} a list of camunda:value objects
 */
MyIOMappingHelper.getEnumValues = function (mapping) {
  if (mapping && mapping.values) {
    return mapping.values;
  }
  return [];
};
