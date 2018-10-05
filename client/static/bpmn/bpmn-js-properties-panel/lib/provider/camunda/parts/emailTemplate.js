// 'use strict';

// var entryFactory = require('../../../factory/EntryFactory'),
//   getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
//   utils = require('../../../Utils'),
//   is = require('bpmn-js/lib/util/ModelUtil').is,
//   cmdHelper = require('../../../helper/CmdHelper');
// let data_ = []

// module.exports = function (group, element, bpmnFactory, translate, options) {

//   var bo = getBusinessObject(element);

//   if (!bo) {
//     return;
//   }

//   // if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && bo.get('processRef')) {
//     if (options != undefined) {
//       data_ = options.schema
//     }
//     let entitySchemaOptions = data_.map(f => ({ value: f.id, name: f.title }))

//     let SchemaEntry = entryFactory.selectBox({
//       id: 'schema',
//       label: translate('Schema'),
//       selectOptions: entitySchemaOptions,
//       modelProperty: 'schema'
//     });

//     // in participants we have to change the default behavior of set and get
//     if (is(element, 'camunda:Sendproofmail')) {
//       SchemaEntry.get = function (element) {
//         var processBo = bo.get('processRef');

//         return {
//           schema: processBo.get('camunda:schema')
//         };
//       };

//       SchemaEntry.set = function (element, values) {
//         var processBo = bo.get('processRef');

//         return cmdHelper.updateBusinessObject(element, processBo, {
//           'camunda:schema': values.schema || undefined
//         });
//       };
//     }

//     group.entries.push(SchemaEntry);

//   // }
// };

'use strict';

let $ = require('jquery')
var entryFactory = require('../../../factory/EntryFactory'),
  cmdHelper = require('../../../helper/CmdHelper'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
let nameProps = require('../../bpmn/parts/NameProps');
// import userData from '../../../../../../../src/store/index' 
let userData = require('../../../../../../../src/store/index')
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
let emailTemplateData;
module.exports = function (generalGroup, element, bpmnFactory, translate, options) {
  var bo = getBusinessObject(element);
  if (!bo) {
    return;
  }
  if (options !== undefined) {
    emailTemplateData = options.emailTemplate.map(f => ({ value: f.id, name: f.templateName }))
  }
  if (is(element, 'camunda:Sendproofmail')) {
    let SchemaEntry = entryFactory.selectBox({
      id: 'emailtemplate',
      label: translate('Email Template'),
      selectOptions: emailTemplateData,
      modelProperty: 'emailtemplate'
    });
    generalGroup.entries.push(SchemaEntry);
  }
  if (is(element, 'bpmn:ComplexGateway') || is(element, 'bpmn:ExclusiveGateway') ) {
    let condition = entryFactory.textField({
      id: 'condition',
      label: translate('Condition'),
      modelProperty: 'condition'
    });
    generalGroup.entries.push(condition)

    let var_name = entryFactory.textField({
      id: 'var_name',
      label: translate('Variable Name'),
      modelProperty: 'var_name'
    });
    generalGroup.entries.push(var_name)
  }
  

};

