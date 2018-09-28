<template>
  <div class="flow">
    <div style="margin:-15px;">
      <Row>
        <Col v-show="loading" class="demo-spin-col" span="24" style="margin-top:35px;">
            <Spin fix>
                <Icon type="load-c" :size="18" class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>
        </Col>
      </Row>
      <Row>
        <Col v-show="!loading" span="24">
          <Split style="height: calc(100vh - 97.51px);">
            <SplitArea :size="80" :minSize="800">
              <div id="js-canvas" style="width: 100%;height: calc(100vh - 110px);position: relative;"></div>
            </SplitArea>
            <SplitArea :size="20" :minSize="200">
              <Tooltip content="Save" placement="left" class="upload-icon">
                <a v-if="!btnLoading" @click="handleSubmit">
                  <i class="fa fa-floppy-o"></i>
                </a>
                <a v-if="btnLoading">
                  <i class="fa fa-spinner fa-spin"></i>
                </a>
              </Tooltip>
              <div id="js-properties-panel"></div>
            </SplitArea>
          </Split>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
  const subscriptionNew = require('flowz-subscription')
  import _ from 'lodash'
  import emailTemplateModel from '@/api/emailtemplate'
  import modelBpmnplugin from '@/api/bpmnplugins'
  import flowz from '@/api/flowz'
  import schemaModel from '@/api/schema'
  import BpmnModeler from 'bpmn-js/lib/Modeler'

  import 'diagram-js/assets/diagram-js.css'
  import 'bpmn-js/assets/bpmn-font/css/bpmn-embedded.css'

  import propertiesPanelModule from '../../../static/bpmn/bpmn-js-properties-panel'
  import propertiesProviderModule from '../../../static/bpmn/bpmn-js-properties-panel/lib/provider/camunda'
  import camundaModdleDescriptor from '../../../static/bpmn/camunda-bpmn-moddle/resources/camunda'
  import customPaletteModule from '@/bpmn-custom-module'

  const X2JS = require('x2js')
  export default {
    name: 'flow',
    watch: {
      '$route.params.id': function (newId, oldId) {
        this.loading = true
        this.initFlow()
      }
    },
    data () {
      return {
        permissions: ['read', 'write'],
        loading: true,
        processData: [],
        btnLoading: false,
        processVar: null,
        bpmnModeler: null,
        bpmnXML: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"><bpmn:startEvent id="StartEvent_1" /></bpmn:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"><bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds x="173" y="102" width="36" height="36" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>',
        flowObject: {
          name: '',
          schema: 0,
          startId: [],
          endId: [],
          intermediateId: [],
          processList: {},
          xml: '',
          svg: '',
          first: ''
        },
        oldFlow: {}
      }
    },
    methods: {
      async handleSubmit () {
        this.btnLoading = true
        this.bpmnModeler.saveSVG({ format: true },
          (e, svg) => {
            this.flowObject.svg = svg
          })
        this.bpmnModeler.saveXML({ format: true },
          (e, xml) => {
            this.flowObject.xml = xml
          })
        let x2js = new X2JS()
        let data = x2js.xml2js(this.flowObject.xml)
        // Set Roles
        let userRolesArr = []
        if (data.definitions.process !== undefined) {
          if (data.definitions.process._name !== undefined) {
            // Set Process Name
            this.flowObject.name = data.definitions.process._name
            // Set Schema
            if (data.definitions.process['_camunda:schema'] !== undefined) {
              this.flowObject.schema = data.definitions.process['_camunda:schema']
              if (this.flowObject.schema !== 0 && this.flowObject.schema !== '') {
                if (data.definitions.process['_camunda:addedRoles']) {
                  userRolesArr = data.definitions.process['_camunda:addedRoles'].split(',')
                }
                let jsonXML = data.definitions.process
                // Set StartIds
                if (jsonXML.startEvent !== undefined) {
                  if (_.isArray(jsonXML.startEvent)) {
                    this.flowObject.startId = _.map(jsonXML.startEvent, (d) => { return d._id })
                  } else {
                    this.flowObject.startId = [jsonXML.startEvent._id]
                  }
                }
                // Set endIds
                if (jsonXML.endEvent !== undefined) {
                  if (_.isArray(jsonXML.endEvent)) {
                    this.flowObject.endId = _.map(jsonXML.endEvent, (d) => { return d._id })
                  } else {
                    this.flowObject.endId = [jsonXML.endEvent._id]
                  }
                }
                // Set intermediateThrowEvent Ids
                if (jsonXML.intermediateThrowEvent !== undefined) {
                  if (_.isArray(jsonXML.intermediateThrowEvent)) {
                    this.flowObject.intermediateId = _.map(jsonXML.intermediateThrowEvent, (d) => { return d._id })
                  } else {
                    this.flowObject.intermediateId = [jsonXML.intermediateThrowEvent._id]
                  }
                }
                // Set Process
                let allProcess = []
                for (let type in jsonXML) {
                  if (type !== 'sequenceFlow') {
                    if (typeof jsonXML[type] === 'object') {
                      if (!Array.isArray(jsonXML[type])) {
                        jsonXML[type] = [jsonXML[type]]
                      }
                      for (let m of jsonXML[type]) {
                        // let obj = m

                        m.type = type.toLowerCase()
                        allProcess.push(m)
                      }
                    }
                  }
                }
                this.flowObject.processList = null
                this.flowObject.processList = {}
                if (allProcess.length > 0) {
                  if (allProcess.length === 1) {
                    for (let type in jsonXML) {
                      if (type !== 'sequenceFlow') {
                        if (typeof jsonXML[type] === 'object') {
                          if (!Array.isArray(jsonXML[type])) {
                            jsonXML[type] = [jsonXML[type]]
                          }
                          for (let [inx, m] of jsonXML[type].entries()) {
                            this.flowObject.processList[m._id] = {
                              id: m._id,
                              name: m._name || '',
                              type: type,
                              order: inx,
                              target: this.getTargetId(m, jsonXML)
                            }
                          }
                        }
                      }
                    }
                  } else {
                    for (let [inx, item] of data.definitions.BPMNDiagram.BPMNPlane.BPMNShape.entries()) {
                      let m = _.find(allProcess, {_id: item._bpmnElement})
                      if (m !== undefined && m !== null) {
                        if (m.type === 'sendproofmail') {
                          this.flowObject.processList[m._id] = {
                            id: m._id,
                            name: m._name || '',
                            type: m.type,
                            order: inx,
                            smtp: {
                              host: m._host || '',
                              password: m._password || '',
                              user: m._user || ''
                            },
                            emailtemplate: m._emailtemplate || '',
                            target: this.getTargetId(m, jsonXML)
                          }
                        } else {
                          this.flowObject.processList[m._id] = {
                            id: m._id,
                            name: m._name || '',
                            type: m.type,
                            order: inx,
                            target: this.getTargetId(m, jsonXML)
                          }
                        }
                      }
                    }
                  }

                  for (let startItems of this.flowObject.startId) {
                    // console.log('startItems: ', startItems)
                    if (this.flowObject.processList[startItems].target.length > 0) {
                      this.flowObject.first = this.flowObject.processList[startItems].target[0].id
                      break
                    }
                  }
                  let actions = []
                  let filteredProcesses = _.filter(allProcess, (o) => {
                    if (o.type !== 'startevent' && o.type !== 'endevent' && o.type !== 'intermediatethrowevent') {
                      return o
                    }
                  })

                  for (var i = 0; i < filteredProcesses.length; i++) {
                    actions.push(filteredProcesses[i]._id)
                  }

                  let actionsObj = {}
                  for (let i = 0; i < actions.length; i++) {
                    actionsObj[actions[i].toLowerCase()] = this.permissions
                  }
                  subscriptionNew.moduleResource.moduleName = 'workflow_' + this.$route.params.id
                  let registerAppModuleNew = actionsObj
                  subscriptionNew.moduleResource.registerAppModule = registerAppModuleNew
                  subscriptionNew.moduleResource.appRoles = userRolesArr
                  subscriptionNew.registeredAppModulesRole().then(resp => {
                    // let result = null
                    if (this.$route.params.id !== undefined) {
                      // if (this.flowObject.schema === this.oldFlow.schema) {
                      //   console.log('...........')
                      // } else {
                      //   this.$Notice.warning({title: 'You\'ve change schema of <b>' + this.flowObject.name + '</b>', desc: '<a>Click Here</a> Set permissions', duration: 0})
                      // }
                      // this.btnLoading = false
                      flowz.put(this.$route.params.id, this.flowObject).then(response => {
                        this.$Notice.success({title: 'Success..!', desc: 'Flow Updated..'})
                        this.$router.push({name: 'flow/list'})
                        localStorage.removeItem('BPMNXml')
                        this.btnLoading = false
                      }).catch(error => {
                        console.log(error)
                        this.$Notice.error({title: 'Error..!', desc: 'Flow Not Updated...'})
                        this.btnLoading = false
                      })
                    } else {
                      flowz.post(this.flowObject).then(response => {
                        this.$Notice.success({title: 'Success..!', desc: 'Flow Saved..'})
                        this.$router.push({name: 'flow/list'})
                        localStorage.removeItem('BPMNXml')
                        this.btnLoading = false
                      }).catch(error => {
                        console.log(error)
                        this.$Notice.error({title: 'Error..!', desc: 'Flow Not Saved...'})
                        this.btnLoading = false
                      })
                    }
                  }).catch(err => {
                    this.$Notice.error({title: 'Error..!', desc: 'Flow Not Saved. Try again.'})
                    console.log('Error: ', err)
                    this.btnLoading = false
                  })
                } else {
                  this.$Message.error('Nothing to Save !')
                  this.btnLoading = false
                }
              } else {
                this.$Message.error('Please Add Schema for Flow !')
                this.btnLoading = false
              }
            } else {
              this.$Message.error('Please Add Schema for Flow !')
              this.btnLoading = false
            }
          } else {
            this.$Message.error('Please Add Process name !')
            this.btnLoading = false
          }
        } else {
          this.btnLoading = false
        }
      },
      async initBPMN (data) {
        let plugins = await modelBpmnplugin.get()
        let types = _.map(plugins, plug => {
          return {
            'name': plug.pluginType,
            'isAbstract': true,
            'superClass': [
              'bpmn:FlowNode'
            ]
          }
        })
        if (types !== undefined) {
          camundaModdleDescriptor.types = _.concat(camundaModdleDescriptor.types, types)
          document.getElementById('js-canvas').innerHTML = ''
          this.bpmnModeler = new BpmnModeler({
            container: '#js-canvas',
            propertiesPanel: {
              parent: '#js-properties-panel',
              data: data
            },
            additionalPlugins: plugins,
            additionalModules: [
              propertiesPanelModule,
              propertiesProviderModule,
              customPaletteModule
            ],
            moddleExtensions: {
              // flowz: {
              //   'name': 'Camunda',
              //   'uri': 'http://camunda.org/schema/1.0/bpmn',
              //   'prefix': 'camunda',
              //   'xml': {
              //     'tagAlias': 'lowerCase'
              //   },
              //   'associations': [],
              //   'types': types
              // },
              camunda: camundaModdleDescriptor
            }
          })
          // console.log('this.bpmnXML', this.bpmnXML)
          this.bpmnModeler.importXML(this.bpmnXML, function (err) {
            if (err) {
              console.error(err)
            } else {
            }
          })
        }
        this.loading = false
      },
      storeXMLtolocalStorage () {
        let self = this
        this.bpmnModeler.saveXML({ format: true },
          function (e, xml) {
            if (xml) {
              self.$store.dispatch('setXMLtoLocalStorage', xml)
            }
          })
      },
      getTargetId (event, process) {
        if (event.hasOwnProperty('outgoing')) {
          if (!_.isArray(event.outgoing)) {
            event.outgoing = [event.outgoing]
          }
          return _.map(event.outgoing, (targetMap) => {
            return _.chain(process.sequenceFlow).filter((ftr) => {
              // console.log('ftr._id', ftr._id, targetMap)
              return ftr._id === targetMap.__text
            }).map((m) => {
              if (m._name !== undefined && m._name !== '') {
                return {
                  label: m._name,
                  id: m._targetRef
                  // outputid: m.extensionElements !== undefined ? m.extensionElements.myIOMapping.mapping._producer : ''
                }
              } else {
                return {
                  id: m._targetRef
                  // outputid: m.extensionElements !== undefined ? m.extensionElements.myIOMapping.mapping._producer : ''
                }
              }
            }).value()[0]
            // return { id: targetMap.__text }
          })
        } else {
          return []
        }
      },
      initFlow () {
        let tempVar = []
        emailTemplateModel.get(null, {
          'user': this.$store.state.user._id
        })
        .then((res) => {
          tempVar = res.data.data
        })
        .catch((err) => {
          console.log(err)
        })

        this.processVar = [
          new Promise((resolve, reject) => {
            schemaModel.get(null, {
              $paginate: false,
              isdeleted: false
            }).then((response) => {
              response.data.splice(0, 0, { title: '---select---', id: 0 })
              resolve(response.data)
            }).catch(error => {
              reject(error)
            })
          })
        ]

        Promise.all(this.processVar).then(async (response) => {
          if (this.$route.params.id !== undefined) {
            this.bpmnXML = flowz.get(this.$route.params.id).then(async (result) => {
              this.oldFlow = result.data
              this.bpmnXML = result.data.xml
              this.initBPMN({
                userId: this.$store.state.user._id,
                emailTemplate: tempVar,
                cdata: result.data,
                id: this.$route.params.id,
                schema: response[0],
                AddEntity: () => {
                  this.storeXMLtolocalStorage()
                  this.$router.push('/schema/new')
                },
                openTemplate: () => {
                  this.storeXMLtolocalStorage()
                  this.$router.push('/schema/edit/717fde77-032f-4ac0-bebe-7f5b16a658e5')
                }
              }) // Create bpmn
            })
          } else {
            this.initBPMN({
              userId: this.$store.state.user._id,
              emailTemplate: tempVar,
              schema: response[0],
              AddEntity: () => {
                this.storeXMLtolocalStorage()
                this.$router.push('/schema/new')
              },
              openTemplate: (selectedEntity) => {
                this.storeXMLtolocalStorage()
                this.$router.push('/schema/edit/' + selectedEntity)
              }
            }) // Create bpmn
          }
          let self = this
          if (self.$store.getters.getXML !== undefined && self.$store.getters.getXML !== '') {
            this.bpmnXML = self.$store.getters.getXML
            this.bpmnModeler.importXML(this.bpmnXML, function (err) {
              if (err) {
                console.error(err)
              } else {
              }
            })
          }
        }, reason => {
          this.$Notice.error({
            title: reason.message,
            desc: 'connection to the server timed out',
            duration: 0
          })
        })
      }
    },
    mounted () {
      this.initFlow()
    }
  }
</script>
<style lang="less">
  @import "../../../node_modules/bpmn-js-properties-panel/styles/properties";
  .upload-icon {
    position: relative;
    top: 11px;
    z-index: 2;
    right: 16px;
    font-size: 20px;
    float: right;
  }
  .palette-img > img {
    padding: 10px;
  }
</style>
