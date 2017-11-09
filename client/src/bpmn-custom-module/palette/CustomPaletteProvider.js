/* eslint-disable */
// var Cat = require('../cat')
/**
 * A provider for quick service task production
 */
var _ = require('lodash')
  // var axios = require('axios')
var $ = require('jquery')
var assign = require('lodash/object').assign
var config = require('@/config')

var CustomPaletteProvider = function (palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
  this._create = create
  this._elementFactory = elementFactory
  this._translate = translate

  palette.registerProvider(this)
}

CustomPaletteProvider.prototype.getPaletteEntries = function () {
  var elementFactory = this._elementFactory
  var create = this._create
  var translate = this._translate
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

  var plugin = [] // require('../../../bpmnPlugin/config.json') // ['Filter', 'sendRFQ']
  $.ajax({
    url: config.default.serverURI + '/bpmnplugins',
    dataType: 'json',
    async: false,
    success: function (data) {
      plugin = _.filter(data.data, (f) => { return f.isEnable })
    }
  });

  // await axios.get('http://172.16.160.117:3030/plugin')
  // console.log('plugin', plugin)

  var pallets = {}
  _.each(plugin, (plug) => {
    // // requirejs.undef(`../../../bpmnPlugin/${f}/index.js`)
    // delete require.cache[require.resolve(`../../../bpmnPlugin/${f}/index.js`)];
    // var plug = require(`../../../bpmnPlugin/${f}/index.js`)
    // var plug = {}
    // $.ajax({
    //   url: f.url, // 'https://s3-us-west-2.amazonaws.com/airflowbucket1/bpmnplugin/Filter/index.json',
    //   dataType: 'json',
    //   async: false,
    //   success: function (data) {
    //     plug = data
    //   }
    // });

    pallets['create.' + plug['worker-type']] = createAction('camunda:' + plug['worker-type'], 'activity', 'palette-img', plug.title, plug.imgurl, { input: plug.input, output: plug.output })
      // {
      //   group: 'activity',
      //   title: plug.title, // 'Create Plugin',
      //   // className: 'fa fa-plug',
      //   className: 'palette-img',
      //   imageUrl: plug.imageStr, // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAHTAAAB0wFzb496AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAZVQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxy7YmgAAAIZ0Uk5TAAECAwQFBgcJCgsMDQ4PEBESExUXGBkaHB8hJCUmJygpKissLS8wMTQ3ODo+P0BBQklKTVJVWlxeY2ZnbG9xd3l7fICFi4+UlpeZnJ2eoaKmq6+xs7S2t7i7v8LGycrLzM3O0NPU1tfY2dzd3+Dh5Obn6Onq6+zt7u/w8vT19/j5+vv8/f74F6GfAAACrklEQVR42u2aaVeSQRxHfwJukGZiKZiaaaRJ5IImaZqJWpi5ZJpbrlmYoVmmoYKgPJ+7F7Qrzzoz/zdzv8C9c86cmTkzAwA3I+9TinDSH0ZrAAAIENizpPwA4P2mkPHVA2BNIeQt4FJIccJHG+BDkDYgiDragDpgmdK/DKAhSedPNgBA5zmV/7wzuxT2UAX04CcDNP4B/GaYwj/8x4+8cfH+8by/AuCYFu2fduAfihbE+heK8B+l6yL966W4QMWWOP9WBS7BuyvKv+vFpTQeivEfNiIHLSci/CctyEmbgPNpqg0qdGV4+zNdUKWXd0AvNBjk6x+EJiM8/SPaftgm+PknbDoCkD/Lyz+bD10UL/LxLxZDJ2UbPPwbZdBN5TZ7/3YlDFC9x9q/Vw1D+OJs/XEfDOJPsPQn/DBMR5qdP90BE3Qz25gy3TBFH6uAPpgkzMYfhmkiLPwR837YJq37J20WAlAwZ9U/VwBLuJas+ZdcsEj5phX/ZjksUxUz749VgQG1+2b9+7VgQtOROf9RExjRauoiLdkKZgTPjPvPgmBIyHhACEzpN+rvB2OGjPmHwJwxI/4x9n7Yp/T7p+wcAlA4r9c/XwgulKzq86+WgBPuqB5/1A1ueHa0/TsecKT+QMt/UA+uNB+r+4+bwZl29YB2cOeFmv8lfz+ufVGZAG4BAXgmdgW+iMob12MhAfdyBwSEBKg89vpkgAyQATJABsgAGSADZIAMkAEyQAbIABkgA2QAdcAd6gA3ccBnEAeEiQM+XqUNSNwFbUAItAHPQRvw2k4bsOIEacCn6yAN+H4LpAGnAZAGaP3W5h7wBLQBEdAGzDhoA9ZcIA2I3QBpQPw2SANOH4A24CFoA56S+OH89bVtFETMZP1vHFQB9+OKoigrV0BGzat30UeMxv8DUiSqHRljWNcAAAAASUVORK5CYII=', // Cat.dataURL,
      //   action: {
      //     dragstart: startCreate(event, plug.type),
      //     click: startCreate(event, plug.type)
      //   }
      // }
  })
  return pallets
    // return {
    //   'create.Custom': {
    //     group: 'activity',
    //     title: 'Create Plugin',
    //     // className: 'fa fa-plug',
    //     className: 'palette-img',
    //     imageUrl: 'data:image/png;base64,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', // Cat.dataURL,
    //     action: {
    //       dragstart: startCreate,
    //       click: startCreate
    //     }
    //   }
    // }
}

module.exports = CustomPaletteProvider
