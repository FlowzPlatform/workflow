<template>
  <div class="flow">
    <div style="margin:-15px;">
      <Row>
        <Col v-show="loading" class="demo-spin-col" span="24">
            <Spin fix>
                <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>
        </Col>
      </Row>
      <Row>
        <Col v-show="!loading" span="24">
          <Split style="height: calc(100vh - 97.51px);">
            <SplitArea :size="80" :minSize="800">
              <div id="js-canvas" style="width: 100%;height: calc(100vh - 110px);position: relative;"></div>
            </SplitArea >
            <SplitArea :size="20" :minSize="200">
              <Tooltip content="Save" placement="left" class="upload-icon">
                <a  @click="save">
                  <i class="fa fa-floppy-o"></i>
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
  import _ from 'lodash'
  import schemaModel from '@/api/schema'
  import approvalModel from '@/api/approval'
  import emailtemplate from '@/api/emailtemplate'
  import schemamappingModel from '@/api/schemamapping'
  import modelBpmnplugin from '@/api/bpmnplugins'
  import flowz from '@/api/flowz'
  
  import 'diagram-js/assets/diagram-js.css'
  import 'bpmn-js/assets/bpmn-font/css/bpmn-embedded.css'
  
  import BpmnModeler from 'bpmn-js/lib/Modeler'
  
  import propertiesPanelModule from '../../../static/bpmn/bpmn-js-properties-panel'
  import propertiesProviderModule from '../../../static/bpmn/bpmn-js-properties-panel/lib/provider/camunda'
  import camundaModdleDescriptor from '../../../static/bpmn/camunda-bpmn-moddle/resources/camunda'
  import customPaletteModule from '@/bpmn-custom-module'
  const X2JS = require('x2js')
  // let bpmnModeler = null
  export default {
    name: 'flow',
    data () {
      return {
        loading: true,
        bpmnModeler: null,
        bpmnXML: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"><bpmn:startEvent id="StartEvent_1" /></bpmn:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"><bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds x="173" y="102" width="36" height="36" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>'
      }
    },
    methods: {
      async save () {
        let xmlData
        this.bpmnModeler.saveXML({ format: true },
          function (e, xml) {
            xmlData = xml
          })
        console.log('xmlData', xmlData)
        let x2js = new X2JS()
        console.log('x2js', x2js)
        // let data = x2js.xml2js(xmlData)
        // if (data.definitions.process._name !== undefined) {
        //   // console.log(data.name)
        //   let flowObject = {}
        //   flowObject.ProcessName = data.definitions.process._name
        //   flowObject.xml = xmlData
        //   flowObject.json = await this.generateJson(xmlData)
        //   // console.log('xmlData', xmlData)
        //   let result = null
        //   if (this.$route.params.id !== undefined) {
        //     result = flowz.put(this.$route.params.id, flowObject)
        //   } else {
        //     result = flowz.post(flowObject)
        //   }
        //   result.then(response => {
        //     this.$Notice.success({title: 'Success!!', desc: 'Mapping Saved...'})
        //     localStorage.removeItem('BPMNXml')
        //     this.$router.push('/flow')
        //   }).catch(error => {
        //     console.log(error)
        //     this.$Notice.error({title: 'Error!!', desc: 'Mapping Not Saved...'})
        //   })
        // } else {
        //   this.$Message.error('Please Add Process name !')
        // }
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
              flowz: {
                'name': 'Camunda',
                'uri': 'http://camunda.org/schema/1.0/bpmn',
                'prefix': 'camunda',
                'xml': {
                  'tagAlias': 'lowerCase'
                },
                'associations': [],
                'types': types
              },
              camunda: camundaModdleDescriptor
            }
          })
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
      async generateJson (xml) {
        let self = this
        let x2js = new X2JS()
        let jsonXML = x2js.xml2js(xml)
        jsonXML = jsonXML.definitions.process
        console.log('jsonXML', jsonXML)
        let instanceObject = {}
        instanceObject.name = jsonXML._name
        instanceObject.start_delay = 3000
        // Add Start Events
        if (_.isArray(jsonXML.startEvent)) {
          instanceObject.start_states = _.map(jsonXML.startEvent, (d) => { return d._id })
        } else {
          instanceObject.start_states = [jsonXML.startEvent._id]
        }
        // convert object to array object
        if (!_.isArray(jsonXML.startEvent)) {
          jsonXML.startEvent = [jsonXML.startEvent]
        }
        instanceObject.processList = []
        // start process
        for (let item of instanceObject.start_states) {
          let processData = await self.getStartProcess(jsonXML)
          let process = _.find(processData, (f) => {
            return f.id === item
          })
          instanceObject.processList.push(process)
          // other all process base on start target id
          await self.getAllProcess(jsonXML, process, instanceObject.processList)
        }
        // convert uniq process
        instanceObject.processList = _.uniqBy(instanceObject.processList, 'id')
        return instanceObject
        // return instanceObject
      },
      async getAllProcess (jsonXML, process, processRef) {
        let self = this
        if (process === undefined) {
          return
        }
        for (let d of process.target) {
        // _.forEach(process.target, (d) => {
          // merge all module
          console.log('jsonXML', jsonXML)
          console.log('d', d)
          var mergeModules = _.chain(jsonXML).map((m, k) => {
            if (typeof m === 'object') {
              m = _.isArray(m) ? m : [m]
              m = _.map(m, im => {
                im.workerType = k
                return im
              })
            }
            return m
          }).filter((m, i) => {
            return typeof m === 'object'
          })
          // .map((m, i) => {
          //   return _.isArray(m) ? m : [m]
          // })
          .value()
          // console.log('mergeModules', mergeModules)
          // generate process
          let result = await _.chain(_.union(...mergeModules))
          .filter((f, i, k) => {
            // console.log('k', k)
            return f._id === d.id
          })
          .map(async (m) => {
            // console.log('m', m)
            let _mapping = await self.getMapping(m, mergeModules)
            console.log('m', m)
            return {
              id: m._id,
              capacity: (m._isFormInput) ? m._capacity : false,
              name: m._name,
              type: m.workerType, // m.outgoing ? (m._name === 'recruiter' ? 'select' : 'task') : 'end',
              target: m.outgoing ? self.getTargetId(m, jsonXML) : [],
              mapping: (_.union(..._mapping)),
              inputProperty: await self.getInputProperties(m),
              outputProperty: await self.getOutputProperties(m)
            }
          }).head()
          .value()
          processRef.push(result)
          await self.getAllProcess(jsonXML, result, processRef)
        }
      },
      async getStartProcess (process) {
        let self = this
        return await Promise.all(_.chain(process.startEvent)
        .map(async (m) => {
          return {
            id: m._id,
            capacity: (m._isFormInput) ? m._capacity : false,
            name: m._name,
            type: 'start',
            target: self.getTargetId(m, process),
            mapping: [],
            inputProperty: await self.getInputProperties(m),
            outputProperty: await self.getOutputProperties(m)
          }
        }).value())
      },
      getTargetId (event, process) {
        if (!_.isArray(event.outgoing)) {
          event.outgoing = [event.outgoing]
        }
        return _.map(event.outgoing, (targetMap) => {
          return _.chain(process.sequenceFlow).filter((ftr) => {
            return ftr._id === targetMap.__text
          }).map((m) => {
            return {
              id: m._targetRef,
              outputid: m.extensionElements !== undefined ? m.extensionElements.myIOMapping.mapping._producer : ''
            }
          }).value()[0]
          // return { id: targetMap.__text }
        })
      },
      async getInputProperties (proccess) {
        if (proccess.extensionElements && proccess.extensionElements.myInputs) {
          if (!_.isArray(proccess.extensionElements.myInputs.input)) {
            proccess.extensionElements.myInputs.input = [proccess.extensionElements.myInputs.input]
          }
          return await Promise.all(_.map(proccess.extensionElements.myInputs.input, async (m) => {
            console.log('m._approvalClass', m._approvalClass)
            return {
              id: m._id,
              entityschema: await schemaModel.getAll(m._entityschema),
              approvalClass: (m._approvalClass !== undefined && m._approvalClass !== '0') ? await approvalModel.get(m._approvalClass) : undefined,
              cancelLabel: m._cancelLabel,
              choice: m._choice,
              createTemplate: m._createTemplate,
              emailTemplate: m._emailTemplate,
              notes: m._notes,
              submitLabel: m._submitLabel,
              viewTemplate: m._viewTemplate
            }
          }))
        } else {
          return []
        }
      },
      async getOutputProperties (proccess) {
        if (proccess.extensionElements && proccess.extensionElements.myOutputs) {
          if (!_.isArray(proccess.extensionElements.myOutputs.output)) {
            proccess.extensionElements.myOutputs.output = [proccess.extensionElements.myOutputs.output]
          }
          return await Promise.all(_.map(proccess.extensionElements.myOutputs.output, async (m) => {
            return {
              id: m._id,
              entityschema: await schemaModel.getAll(m._entityschema),
              approvalClass: m._approvalClass !== undefined && m._approvalClass !== '0' ? await approvalModel.get(m._approvalClass) : undefined,
              cancelLabel: m._cancelLabel,
              choice: m._choice,
              createTemplate: m._createTemplate,
              emailTemplate: m._emailTemplate,
              notes: m._notes,
              submitLabel: m._submitLabel,
              viewTemplate: m._viewTemplate
            }
          }))
        } else {
          return []
        }
      },
      async getMapping (event, mergeModules) {
        var self = this
        if (!_.isArray(event.incoming)) {
          event.incoming = [event.incoming]
        }
        return await Promise.all(_.chain(_.union(...mergeModules))
          .filter((f) => {
            return _.filter(event.incoming, (i) => { return i.__text === f._id }).length > 0
          }).map(async (m) => {
            let sourceRef = m._sourceRef
            if (m.extensionElements && m.extensionElements.myIOMapping) {
              if (!_.isArray(m.extensionElements.myIOMapping.mapping)) {
                m.extensionElements.myIOMapping.mapping = [m.extensionElements.myIOMapping.mapping]
              }
              return await Promise.all(_.map(m.extensionElements.myIOMapping.mapping, async (m) => {
                var content = await schemamappingModel.get(m._schemamapping)
                content.data['sourceid'] = sourceRef // _.chain(_.union(...mergeModules)).find((fnd) => { return fnd._id === event.incoming.__text }).value()._sourceRef
                content.data.MapData = await Promise.all(_.map(content.data.MapData, async (schema) => {
                  return {
                    producerField: schema.producerField,
                    transform: schema.transform,
                    consumerField: schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
                  }
                }))
                content.data.MapData = self.mapDataConvertToSquenceFlow(content.data.MapData)
                return content.data
              }))
            } else {
              return []
            }
          }).value())
        // temp = await Promise.all(temp)
        // return temp
      },
      mapDataConvertToSquenceFlow (MapData) {
        let newMapData = []
        _.map(MapData, (m) => {
          if (_.isArray(m.consumerField)) {
            _.forEach(m.consumerField, (fe) => {
              if (!_.isArray(fe.consumerField)) {
                newMapData.push({
                  consumerField: _.reduceRight([fe.consumerTitle], function (memo, arrayValue) {
                    var obj = {}
                    obj[arrayValue] = memo
                    return obj
                  }, fe.consumerField),
                  transform: fe.transform,
                  producerField: _.reduceRight([fe.producerTitle], function (memo, arrayValue) {
                    var obj = {}
                    obj[arrayValue] = memo
                    return obj
                  }, fe.producerField)
                })
              }
            })
          } else {
            newMapData.push(m)
          }
        })
        return newMapData
      },
      async getMapData (mapId) {
        var content = await schemamappingModel.get(mapId)
        let producer = await schemaModel.get(content.data.producer)
        let consumer = await schemaModel.get(content.data.consumer)
        return await Promise.all(_.map(content.data.MapData, async (schema) => {
          var obj = {
            consumerTitle: consumer.data.title,
            producerTitle: producer.data.title,
            transform: schema.transform,
            producerField: schema.producerField,
            consumerField: schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
          }
          // obj[producer.data.title] = schema.producerField
          // obj[consumer.data.title] = schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
          return obj
        }))
      }
    },
    mounted () {
      var process = [
        new Promise((resolve, reject) => {
          schemaModel.get().then((response) => {
            response.data.splice(0, 0, { title: '---select---', id: 0 })
            resolve(response.data)
          }).catch(error => {
            reject(error)
          })
        }),
        new Promise((resolve, reject) => {
          approvalModel.get().then((response) => {
            resolve(response.map(f => ({ value: f.id, name: f.proccessname })))
          }).catch(error => {
            reject(error)
          })
        }),
        new Promise((resolve, reject) => {
          emailtemplate.get().then((response) => {
            resolve(response.data.data.map(f => ({ value: f.id, name: f.name })))
          }).catch(error => {
            reject(error)
          })
        }),
        new Promise((resolve, reject) => {
          schemamappingModel.get().then((response) => {
            resolve(response.data.data)
          }).catch(error => {
            reject(error)
          })
        })
      ]

      Promise.all(process).then(async (response) => {
        // response[0].splice(0, 0, { name: '---select---', value: 0 })
        response[1].splice(0, 0, { name: '---select---', value: 0 })
        response[2].splice(0, 0, { name: '---select---', value: 0 })
        if (this.$route.params.id !== undefined) {
          this.bpmnXML = flowz.get(this.$route.params.id).then(async (result) => {
            this.bpmnXML = result.data.xml
            await this.initBPMN({
              schema: response[0],
              approval: response[1],
              emailtemplate: response[2],
              schemamapping: response[3],
              AddEntity: () => {
                this.storeXMLtolocalStorage()
                this.$router.push('/schema/new')
              },
              createTemplate: () => {
                this.storeXMLtolocalStorage()
                this.$router.push('/schema/edit/717fde77-032f-4ac0-bebe-7f5b16a658e5')
              },
              openApprovalClass: () => {
                this.storeXMLtolocalStorage()
                this.$router.push('/approval')
              }
            }) // Create bpmn
          })
        } else {
          await this.initBPMN({
            schema: response[0],
            approval: response[1],
            emailtemplate: response[2],
            schemamapping: response[3],
            AddEntity: () => {
              this.storeXMLtolocalStorage()
              this.$router.push('/schema/new')
            },
            openTemplate: (selectedEntity) => {
              this.storeXMLtolocalStorage()
              this.$router.push('/schema/edit/' + selectedEntity)
            },
            openApprovalClass: () => {
              this.storeXMLtolocalStorage()
              this.$router.push('/approval')
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
  // #js-properties-panel {
  //   position: absolute;
  //   top: -15px;
  //   bottom: 0;
  //   right: -15px;
  //   width: 260px;
  //   z-index: 1;
  //   border-left: 1px solid #ccc;
  //   background: #f8f8f8;
  //   overflow: auto;
  //   &:empty {
  //     display: none;
  //   }
  //   > .djs-properties-panel {
  //     padding-bottom: 70px;
  //     min-height:100%;
  //   }
  // }
</style>