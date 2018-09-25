'use strict';

let $ = require('jquery')
var entryFactory = require('../../../factory/EntryFactory'),
  cmdHelper = require('../../../helper/CmdHelper'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
let nameProps = require('../../bpmn/parts/NameProps');
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
module.exports = function (group, element, translate, options) {
  var bo = getBusinessObject(element);
  if (!bo) {
    return;
  }

  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
    var versionTagEntry = entryFactory.textField({
      id: 'addRoles',
      label: translate('Add Roles'),
      modelProperty: 'addedRoles'
    });
    group.entries.push(versionTagEntry);
  }  
};

