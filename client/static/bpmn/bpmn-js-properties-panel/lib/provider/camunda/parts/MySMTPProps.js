// 'use strict';

// var entryFactory = require('../../../factory/EntryFactory'),
//   getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
//   utils = require('../../../Utils'),
//   cmdHelper = require('../../../helper/CmdHelper');
// var nameEntryFactory = require('../../bpmn/parts/implementation/Name'),
//   is = require('bpmn-js/lib/util/ModelUtil').is;


// module.exports = function (group, element, translate) {

//   // Id
//   // group.entries.push(entryFactory.validationAwareTextField({
//   //   id: 'host',
//   //   label: translate('Host'),
//   //   modelProperty: 'text',
//   //   getProperty: function (element) {
//   //     return getBusinessObject(element).id;
//   //   },
//   //   setProperty: function (element, properties) {

//   //     element = element.labelTarget || element;

//   //     return cmdHelper.updateProperties(element, properties);
//   //   },
//   //   // validate: function (element, values) {
//   //   //   var idValue = values.id;

//   //   //   var bo = getBusinessObject(element);

//   //   //   var idError = utils.isIdValid(bo, idValue);

//   //   //   return idError ? { id: idError } : {};
//   //   // }
//   // }));
//   // if (!is(element, 'bpmn:Collaboration')) {

//   //   var options;
//   //   if (is(element, 'bpmn:TextAnnotation')) {
//   //     options = {"id": "host", "label":"Host", modelProperty: 'text' };
//   //   }
//   var options = entryFactory.textBox({
//       id: "host",
//       label: "host",
//       modelProperty: "text"
//     });

//     // name
//   group.entries = group.entries.push(entryFactory(element, options, translate));

//   // }

// };
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

  // if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('sendproffmail')) {
    console.log({is})
    console.log({bo})
  if (is(element, 'camunda:Sendproofmail')) {
    var versionTagEntry = entryFactory.textField({
      id: 'host',
      label: translate('Host'),
      modelProperty: 'host'
    });
    group.entries.push(versionTagEntry);
  var versionTagEntry2 = entryFactory.textField({
    id: 'user',
    label: translate('User'),
    modelProperty: 'user'
  });
  group.entries.push(versionTagEntry2);
  var versionTagEntry3 = entryFactory.textField({
    id: 'password',
    label: translate('Password'),
    modelProperty: 'password'
  });
  group.entries.push(versionTagEntry3);
  }

};

