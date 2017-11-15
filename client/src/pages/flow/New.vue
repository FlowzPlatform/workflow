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
          <div class="split" style="height: calc(100vh - 97.51px);">
            <div id="bpmn-panel" class="split split-horizontal">
              <div id="js-canvas" style="width: 100%;height: calc(100vh - 110px);position: relative;"></div>
            </div>
            <div id="bpmn-properties-panel" class="split split-horizontal">
              <Tooltip content="Save" placement="left" class="upload-icon">
                <a  @click="save">
                  <i class="fa fa-floppy-o"></i>
                </a>
              </Tooltip>
              <div id="js-properties-panel"></div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  // import config from '@/config'
  import schema from '@/api/schema'
  import approval from '@/api/approval'
  import emailtemplate from '@/api/emailtemplate'
  import schemamapping from '@/api/schemamapping'
  import modelBpmnplugin from '@/api/bpmnplugins'
  import Split from 'split.js'
  import flowz from '@/api/flowz'

  import 'diagram-js/assets/diagram-js.css'
  import 'bpmn-js/assets/bpmn-font/css/bpmn-embedded.css'
  
  import BpmnModeler from 'bpmn-js/lib/Modeler'
  
  import propertiesPanelModule from '../../../static/bpmn/bpmn-js-properties-panel'
  import propertiesProviderModule from '../../../static/bpmn/bpmn-js-properties-panel/lib/provider/camunda'
  import camundaModdleDescriptor from '../../../static/bpmn/camunda-bpmn-moddle/resources/camunda'
  import customPaletteModule from '@/bpmn-custom-module'
  const X2JS = require('x2js')
  // import $ from 'jquery'

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
      save () {
        let xmlData
        this.bpmnModeler.saveXML({ format: true },
          function (e, xml) {
            xmlData = xml
          })
        // console.log('xmlData', xmlData)
        let x2js = new X2JS()
        // console.log('x2js', x2js)
        let data = x2js.xml2js(xmlData)
        if (data.definitions.process._name !== undefined) {
          // console.log(data.name)
          let flowObject = {}
          flowObject.ProcessName = data.definitions.process._name
          flowObject.xml = xmlData
          // console.log('xmlData', xmlData)
          let result = null
          if (this.$route.params.id !== undefined) {
            result = flowz.put(this.$route.params.id, flowObject)
          } else {
            result = flowz.post(flowObject)
          }
          result.then(response => {
            this.$Notice.success({title: 'Success!!', desc: 'Mapping Saved...'})
            localStorage.removeItem('BPMNXml')
            this.$router.push('/flow')
          }).catch(error => {
            console.log(error)
            this.$Notice.error({title: 'Error!!', desc: 'Mapping Not Saved...'})
          })
        } else {
          this.$Message.error('Please Add Process name !')
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
      }
    },
    mounted () {
      Split(['#bpmn-panel', '#bpmn-properties-panel'], {
        sizes: [80, 20],
        minSize: [800, 200]
      })
      var process = [
        new Promise((resolve, reject) => {
          schema.get().then((response) => {
            response.data.splice(0, 0, { title: '---select---', id: 0 })
            resolve(response.data)
          }).catch(error => {
            reject(error)
          })
        }),
        new Promise((resolve, reject) => {
          approval.get().then((response) => {
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
          schemamapping.get().then((response) => {
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