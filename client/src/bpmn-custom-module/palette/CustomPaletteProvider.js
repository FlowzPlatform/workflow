/* eslint-disable */
// var Cat = require('../cat')
/**
 * A provider for quick service task production
 */
var _ = require('lodash')
var assign = require('lodash/object').assign

var CustomPaletteProvider = function (palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate, plugins) {
  this._create = create
  this._elementFactory = elementFactory
  this._translate = translate
  this._plugins = plugins

  palette.registerProvider(this)
}

CustomPaletteProvider.prototype.getPaletteEntries = function () {
  var elementFactory = this._elementFactory
  var create = this._create
  var translate = this._translate
  var plugins = this._plugins
    // console.log('this._plugin', this._plugin)
  var renderInputOutput = function (shape, input, output) {
    var element = elementFactory._bpmnFactory.create('bpmn:ExtensionElements', { values: [] });
    element.$parent = shape.businessObject;

    //// Render  Input
    var myInputs = elementFactory._bpmnFactory.create('camunda:MyInputs', { fields: [] });
    myInputs.$parent = element.businessObject

    _.forEach(input, (fields) => {
      fields = _.reduce(fields, function (result, value, key) {
        if (_.indexOf(['id', 'isFormInput', 'capacity', 'cancelLabel', 'submitLabel', 'createTemplate', 'emailTemplate', 'viewTemplate', 'approvalClass', 'choice', 'label', 'notes', 'entityschema'], key.toLowerCase()) != -1) {
          result[key.toLowerCase()] = value
        }
        return result;
      }, {});
      var field = elementFactory._bpmnFactory.create('camunda:Input', fields);
      field.$parent = myInputs.businessObject
      myInputs.fields.push(field)
    })

    //// Render output
    var myOutputs = elementFactory._bpmnFactory.create('camunda:MyOutputs', { fields: [] });
    myOutputs.$parent = element.businessObject

    _.forEach(output, (fields) => {
      fields = _.reduce(fields, function (result, value, key) {
        if (_.indexOf(['id', 'notes', 'entityschema'], key.toLowerCase()) != -1) {
          result[key.toLowerCase()] = value
        }
        return result;
      }, {});
      var outputfield = elementFactory._bpmnFactory.create('camunda:Output', fields);
      outputfield.$parent = myOutputs.businessObject
      myOutputs.fields.push(outputfield)
    })

    element.values.push(myInputs)
    element.values.push(myOutputs)
    return element
  }

  function createAction(type, group, className, title, imageUrl, options) {
    function createListener(event) {
      // create('shape', { type: 'camunda:Filter' })
      var shape = elementFactory.createShape(assign({ type: type }, options))

      shape.businessObject['extensionElements'] = renderInputOutput(shape, options.input, options.output)
      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded
      }

      create.start(event, shape)
    }

    var shortType = type.replace(/^camunda\:/, '')

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      imageUrl: imageUrl,
      action: {
        dragstart: createListener,
        click: createListener
      }
    }
  }

  plugins = _.filter(plugins, (f) => { return f.isEnable })

  var pallets = {}
  _.each(plugins, (plug) => {
    pallets['create.' + plug.pluginType] = createAction('camunda:' + plug.pluginType, 'flow-plugin', 'palette-img', plug.title, plug.image, { input: plug.input, output: plug.output })
  })
  return pallets
}
CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate',
  'config.additionalPlugins'
]
module.exports = CustomPaletteProvider
