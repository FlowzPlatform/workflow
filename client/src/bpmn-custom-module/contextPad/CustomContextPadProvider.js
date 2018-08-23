var assign = require('lodash/object').assign
var hasPrimaryModifier = require('diagram-js/lib/util/Mouse').hasPrimaryModifier
  // var is = require('bpmn-js/lib/util/ModelUtil').is

function CustomContextPadProvider (eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate) {
  contextPad.registerProvider(this)

  this._contextPad = contextPad
  this._modeling = modeling
  this._elementFactory = elementFactory
  this._connect = connect
  this._create = create
  this._popupMenu = popupMenu
  this._canvas = canvas
  this._rules = rules
  this._translate = translate

  eventBus.on('create.end', 250, function (event) {
    var shape = event.context.shape

    if (!hasPrimaryModifier(event)) {
      return
    }

    var entries = contextPad.getEntries(shape)

    if (entries.replace) {
      entries.replace.action.click(event, shape)
    }
  })
}

CustomContextPadProvider.$inject = [
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate'
]

module.exports = CustomContextPadProvider

CustomContextPadProvider.prototype.getContextPadEntries = function (element) {
  // var contextPad = this._contextPad
  // var modeling = this._modeling
  // var elementFactory = this._elementFactory
  // var connect = this._connect
  // var create = this._create
  // var popupMenu = this._popupMenu
  // var canvas = this._canvas
  // var rules = this._rules
  var translate = this._translate

  var actions = {}
    /**
     * Create an append action
     *
     * @param {String} type
     * @param {String} className
     * @param {String} [title]
     * @param {Object} [options]
     *
     * @return {Object} descriptor
     */

  // function getReplaceMenuPosition (element) {
  //   var Y_OFFSET = 5

  //   var diagramContainer = canvas.getContainer()
  //   var pad = contextPad.getPad(element).html

  //   var diagramRect = diagramContainer.getBoundingClientRect()
  //   var padRect = pad.getBoundingClientRect()

  //   var top = padRect.top - diagramRect.top
  //   var left = padRect.left - diagramRect.left

  //   var pos = {
  //     x: left,
  //     y: top + padRect.height + Y_OFFSET
  //   }

  //   return pos
  // }
  // var replaceMenu
  // if (popupMenu._providers['bpmn-replace']) {
  //   replaceMenu = popupMenu.create('bpmn-replace', element)
  // }
  // if (is(element, 'camunda:Custom')) {
  if ((element.type).match(/flowz:/gi)) {
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        title: translate('Change type'),
        action: {
          click: function (event, element) {
            // alert(1)
            // replaceMenu.open(assign(getReplaceMenuPosition(element), {
            //   cursor: { x: event.x, y: event.y }
            // }), element);
          }
        }
      }
    })
  }
  return actions
}
