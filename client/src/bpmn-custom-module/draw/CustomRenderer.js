var inherits = require('inherits')
var isObject = require('lodash/lang').isObject
var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer')
var TextUtil = require('diagram-js/lib/util/Text')
var is = require('bpmn-js/lib/util/ModelUtil').is
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject
var svgAppend = require('tiny-svg/lib/append')
var svgAttr = require('tiny-svg/lib/attr')
var svgCreate = require('tiny-svg/lib/create')
var svgClasses = require('tiny-svg/lib/classes')
  // var Cat = require('../cat')
var TASK_BORDER_RADIUS = 10
var _ = require('lodash')
var $ = require('jquery')
var config = require('@/config')
var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12
}

var CustomRender = function (eventBus, pathMap, styles) {
  BaseRenderer.call(this, eventBus, 2000)

  var textUtil = new TextUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  })

  var computeStyle = styles.computeStyle

  // this.drawTriangle = function (parent, shape) {
  //   var url = Cat.dataURL;
  //   var catGfx = svgCreate('image', {
  //     x: 0,
  //     y: 0,
  //     width: shape.width,
  //     height: shape.height,
  //     href: url
  //   });

  //   svgAppend(parent, catGfx);

  //   return catGfx;
  // };

  var renderLabel = function (parentGfx, label, options) {
    var text = textUtil.createText(label || '', options)
    svgClasses(text).add('djs-label')
    svgAppend(parentGfx, text)

    return text
  }

  var renderEmbeddedLabel = function (parentGfx, element, align) {
    var semantic = getSemantic(element)

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getStrokeColor(element)
      }
    })
  }

  var drawRect = function (parentGfx, width, height, r, offset, attrs) {
    if (isObject(offset)) {
      attrs = offset
      offset = 0
    }

    offset = offset || 0

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    })

    var rect = svgCreate('rect')
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    })
    svgAttr(rect, attrs)

    svgAppend(parentGfx, rect)

    return rect
  }

  this.drawTriangle = function (parentGfx, element, type) {
    type = type.replace(/^camunda:/, '')
    var plugin = [] // require('../../../bpmnPlugin/config.json') // ['Filter', 'sendRFQ']
    $.ajax({
      url: config.default.serverURI + '/bpmnplugins',
      dataType: 'json',
      async: false,
      success: function (data) {
        plugin = data.data
      }
    })
    var plug = _.chain(plugin).map(plug => {
      // var plug = {}
      // $.ajax({
      //   url: f.url, // 'https://s3-us-west-2.amazonaws.com/airflowbucket1/bpmnplugin/Filter/index.json',
      //   dataType: 'json',
      //   async: false,
      //   success: function (data) {
      //     plug = data
      //   }
      // })
      return plug
        // delete require.cache[require.resolve(`../../../bpmnPlugin/${f}/index.js`)]
        // return require(`../../../bpmnPlugin/${f}/index.js`)
    }).find(f => { return f['worker-type'] === type }).value()

    var attrs = {
      fill: getFillColor(element),
      stroke: getStrokeColor(element)
    }

    var rect = drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs)

    /* plugins background */
    // var url = Cat.dataURL
    var catGfx = svgCreate('image', {
      x: 5,
      y: 5,
      width: element.width / 4,
      height: element.height / 4,
      href: plug.imgurl
    })

    svgAppend(parentGfx, catGfx)

    renderEmbeddedLabel(parentGfx, element, 'center-middle')
    return rect
  }
}

inherits(CustomRender, BaseRenderer)

module.exports = CustomRender

CustomRender.$inject = ['eventBus', 'pathMap', 'styles']

CustomRender.prototype.drawShape = function (p, element) {
  var type = element.type

  if (type.match(/camunda:/gi)) {
    return this.drawTriangle(p, element, type)
  }
}

CustomRender.prototype.canRender = function (element) {
  return is(element, 'bpmn:FlowNode')
}

var getFillColor = function (element, defaultColor) {
  var bo = getBusinessObject(element)

  return bo.di.get('fill') || defaultColor || 'white'
}

var getStrokeColor = function (element, defaultColor) {
  var bo = getBusinessObject(element)

  return bo.di.get('stroke') || defaultColor || 'black'
}

var getSemantic = function (element) {
  return element.businessObject
}
