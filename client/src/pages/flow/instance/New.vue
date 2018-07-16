<template>
  <div>
    <row>
      <div style="float:right">
        <Button type="primary" @click="back()" icon="chevron-left">Back</Button>
        <ButtonGroup>
          <Button type="primary" @click="graph = true, list = false" icon="pie-graph"></Button>
          <Button type="primary" @click="graph = false, list = true" icon="navicon-round"></Button>
         </ButtonGroup>
      </div>
    </row>
    <row>
      <Split style="height: calc(100vh - 162px);" :direction="'vertical'">
        <SplitArea :size="graph? 38 : 0">
          <div id="canvas" style="height: 95%"></div>
        </SplitArea>
        <SplitArea :size="graph? 60: 97"  v-if="list || graph" style="margin-top:10px">
          <Split style="height: 100%">
            <SplitArea :size="showProp? 25: 99.50">
              <div class="schema-form ivu-table-wrapper" >
                    <div class="ivu-table ivu-table-small ivu-table-border">
                        <span class="ivu-table-body">
                            <table cellspacing="0" cellpadding="0" border="0" style="width:100%">
                                <thead>
                                    <tr class=" ">
                                        <th class="" v-if="showProp == false">
                                            <div class="ivu-table-cell">
                                                <span>ID</span>
                                            </div>
                                        </th>
                                        <th class="">
                                            <div class="ivu-table-cell"><span>Process Name</span>
                                            </div>
                                        </th>
                                        <th class="" v-if="showProp == false">
                                            <div class="ivu-table-cell">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="ivu-table-tbody">
                                  <template v-for="(item, index) in flowInstance.processList">
                                    <template>
                                      <tr class="ivu-table-row">
                                          <td  v-if="showProp == false">
                                              <div class="ivu-table-cell">
                                                  {{item.id}}
                                              </div>
                                          </td>
                                          <td >
                                              <a @click="handleProcessClick(item)">
                                                  <div class="ivu-table-cell">
                                                      {{item.name}}
                                                      <!-- <div v-if="showProp" :class="getStatus(item)" style="float:right;"><Icon style="font-size:18px" :type="getIcon(item)" /></div> -->
                                                  </div>
                                              </a>
                                          </td>
                                          <td v-if="showProp == false">
                                            <div class="ivu-table-cell">
                                              {{getCurrentStatus(item.log)}}
                                              <!-- {{getStatus(item)}} -->
                                            </div>
                                          </td>
                                      </tr>
                                    </template>
                                    <template v-if="countJobs(item.log) > 0">
                                      <tr class="ivu-table-row">
                                        <td :colspan="showProp? 1:3" class="ivu-table-expanded-cell" style="padding: 4px 4px 4px 18px;">
                                          <div class="schema-form ivu-table-wrapper" >
                                            <div class="ivu-table ivu-table-border">
                                              <span class="ivu-table-body">
                                                  <table cellspacing="0" cellpadding="0" border="0" style="width:100%">
                                                    <tbody class="ivu-table-tbody">
                                                      <template v-for="(log, logkey) in item.log">
                                                        <tr @click="handleProcessClick(item, log)">
                                                          <td class="ivu-table-cell">
                                                            <div style="position: relative;">
                                                              <div style="padding-right: 8px;">
                                                                {{(logkey === 'undefined' ? item.name : logkey)}}
                                                              </div>
                                                              <div v-if="showProp" :class="getCurrentStatus(log)" style="position: absolute;right: -12px;top: 0px;"><Icon style="font-size:18px" :type="iconList[getCurrentStatus(log)]" /></div>
                                                            </div>
                                                          </td>
                                                          <td v-if="!showProp" class="ivu-table-cell" style="width: 150px;">
                                                            <div :class="getCurrentStatus(log)" style="text-transform: capitalize;">
                                                              {{getCurrentStatus(log)}}
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </template>
                                                    </tbody>
                                                  </table>
                                                </span>
                                              </div>
                                            </div>
                                        </td>
                                      </tr>
                                    </template>
                                  </template>
                                </tbody>
                            </table>
                        </span>
                    </div>
                </div>
            </SplitArea>
            <SplitArea :size="showProp? 75: 0">
                <div v-if="showProp">
                    <div style="padding:10px;">
                      <Tabs>
                        <TabPane label="Form Data" name="formtab">
                          <template v-if="selectedProcess.inputProperty && selectedProcess.inputProperty.length > 0 && selectedProcess.inputProperty[0].createTemplate && getCurrentStatus(selectedLogs) === 'inputRequired'">
                            <schemaTemplate :row="selectedProcess" :html="html" :log="lastLog"></schemaTemplate>
                          <!-- {{selectedProcess.inputProperty[0].createTemplate}} -->
                          </template>
                          <template v-else-if="getCurrentStatus(selectedLogs) === 'inputRequired'">
                            <expandRow :row="selectedProcess" :lastLog="getLastLog(selectedLogs)"></expandRow>
                          </template>
                          <template v-else>
                            <Table stripe :columns="getInputColumns()" :data="getLastLog(selectedLogs).input" size="small"></Table>
                          </template>
                        </TabPane>
                        <TabPane label="Logs"  name="logtab">
                          <Table stripe :columns="logColumns" :data="selectedLogs" size="small"></Table>
                        </TabPane>
                        <Button type="primary" slot="extra" size="small" icon="close" @click="showProp = false"></Button>
                      </Tabs>
                    </div>
                </div>
            </SplitArea>
          </Split>
        </SplitArea>
      </Split>
    </row>
  </div>
</template>
<script>
import axios from 'axios'
import config from '@/config'

// Models
import modelBpmnplugin from '@/api/bpmnplugins'
import flowz from '@/api/flowz'
import instance from '@/api/flowzinstance'

// Components
import expandRow from '@/components/expand-process.vue'
import schemaTemplate from '@/components/SchemaTemplate.vue'

// Lib
import _ from 'lodash'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer.js'

// Static - lib
import camundaModdleDescriptor from '../../../../static/bpmn/camunda-bpmn-moddle/resources/camunda'

let viewer
export default {
  components: { expandRow, schemaTemplate },
  data () {
    return {
      flowInstance: {},
      graph: false,
      list: true,
      showProp: false,
      selectedProcess: {},
      lastLog: {},
      selectedLogs: [],
      iconList: {
        running: 'ios-ionic-outline ivu-load-loop',
        created: 'ios-paper-outline',
        completed: 'checkmark',
        inputRequired: 'ios-help-outline',
        processing: 'load-a',
        SendForApproval: 'paper-airplane'
      },
      logColumns: [{
        title: 'job',
        key: 'job'
      }, {
        title: 'jobId',
        key: 'jobId'
      }, {
        title: 'jobType',
        key: 'jobType'
      }, {
        title: 'lastModified',
        key: 'lastModified'
      }, {
        title: 'status',
        key: 'status'
      }]
    }
  },
  async mounted () {
    // console.log('-->', this.selectedProcess)
    await this.init()
  },
  asyncComputed: {
    async html () {
      if (this.selectedProcess.inputProperty && this.selectedProcess.inputProperty.length > 0 && this.selectedProcess.inputProperty[0].createTemplate) {
        let index = await _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', this.selectedProcess.inputProperty[0].createTemplate])
        // var url = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index].url
        // url = url.substr(0, 4) + url.substr(5)
        var temp = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]
          // console.log('this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]', this.selectedProcess.inputProperty[0].entityschema.createTemplate[index])
        return 'http://' + this.$store.state.user._id + '.' + temp.url[0] + '.' + config.grapesDomain + '/' + temp.url[1] + '.html'
        // var promise = await axios.get(url)
        // return promise.data
        // return url
      }
    }
  },
  feathers: {
    'flowz-instance': {
      async updated (data) { // update status using socket
        let self = this
        if (data.id === this.$route.params.id) {
          data.processList = _.chain(data.processList).map(m => {
            m.log = _.chain(data.process_log).filter(f => {
              return f.job === m.id
            }).orderBy(['lastModified'], ['desc']).groupBy('jobId').value()

            // handle mapping required
            // self.handleMappingRequireStatus(m)
            return m
          }).value()
          this.flowInstance = data
          if (this.selectedProcess && _.keys(this.selectedProcess).length > 0) {
            this.selectedProcess = _.find(this.flowInstance.processList, f => {
              return f.id === this.selectedProcess.id
            })
            this.selectedLogs = this.selectedProcess.log[this.selectedLogs[0].jobId]
          }
        }
        _.forEach(self.flowInstance.processList, function (process) {
          var lastProcess = process.log[_.findLastKey(process.log)]
          if (lastProcess) {
            viewer.get('canvas').addMarker(process.id, self.getCurrentStatus(lastProcess))
          }
        })
      }
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    async init () {
      // Get Flow Instance
      this.flowInstance = await instance.getThis(this.$route.params.id)
        .then(response => {
          response.data.processList = _.chain(response.data.processList).map(m => {
            m.log = _.chain(response.data.process_log).filter(f => {
              return f.job === m.id
            }).orderBy(['lastModified'], ['desc']).groupBy('jobId').value()
            // this.handleMappingRequireStatus(m)
            return m
          }).value()
          return response.data
        })
        .catch(error => {
          console.log(error)
        })

      // Get Flow
      var bpmnXML = await flowz.get(this.flowInstance.fid)
      .then(async response => {
        return response.data
      })
      // Init Bpmn
      await this.initBPMN(bpmnXML.xml)
    },
    async initBPMN (xml) {
      let self = this

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
        viewer = new BpmnViewer({
          container: '#canvas',
          additionalPlugins: plugins,
          additionalModules: [
            require('@/bpmn-custom-module/viewindex')
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
        viewer.importXML(xml, function (err) {
          if (err) {
            console.log('error rendering', err)
          } else {
            _.forEach(self.flowInstance.processList, function (process) {
              var lastProcess = process.log[_.findLastKey(process.log)]
              if (lastProcess) {
                console.log('>>>>>>>>>>>>>>>>>>>>......', process.id, self.getCurrentStatus(lastProcess))
                viewer.get('canvas').addMarker(process.id, self.getCurrentStatus(lastProcess))
              }
            })
          }
        })
        var eventBus = viewer.get('eventBus')

        // you may hook into any of the following events
        var events = [
          // 'element.hover',
          // 'element.out',
          'element.click'
          // 'element.dblclick',
          // 'element.mousedown',
          // 'element.mouseup'
        ]
        events.forEach(function (event) {
          eventBus.on(event, function (e) {
            // e.element = the model element
            // e.gfx = the graphical element
            console.log(event, 'on', e.element.id)
          })
        })
      }
    },
    getCurrentStatus (log) {
      return (log && log.length > 0) ? _.head(log).status : ''
    },
    getLastLog (logs) {
      return _.head(logs)
    },
    countJobs (log) {
      return _.size(log)
    },
    getInputColumns (entity) {
      let self = this
      if (this.selectedProcess.inputProperty && this.selectedProcess.inputProperty.length > 0 && this.selectedProcess.inputProperty[0].entityschema.entity) {
        return _.map(self.selectedProcess.inputProperty[0].entityschema.entity, m => {
          return {title: m.name, key: m.name}
        })
      } else {
        return _.map(this.getLastLog(this.selectedLogs).input[0], (m, k) => {
          return {title: k, key: k}
        })
      }
    },
    async handleProcessClick (item, log) {
      this.showProp = true
      this.selectedProcess = item
      this.selectedLogs = log
      this.lastLog = this.getLastLog(this.selectedLogs)
    },
    handleMappingRequireStatus (data) {
      // handle mapping required
      if (data.log && _.keys(data.log).length > 0) {
        console.log('data', data)
        _.forEach(data.log, f => {
          if (this.getCurrentStatus(f).toLowerCase() === 'mappingrequired') {
            console.log('f', f)
            let _lastLog = this.getLastLog(f)
            let dataObject = {
              'fId': this.$route.params.id,
              'input': _lastLog.input[0].inputs,
              'isExternalInput': true,
              // 'isMapping': true,
              'jobId': _lastLog.jobId,
              'job': _lastLog.job
            }
            console.log('dataObject', dataObject)
            let uri = config.serverURI + '/addInputToJobQue'
            axios.post(uri, dataObject)
            .then(response => {
              console.log(response)
            })
            .catch(error => {
              console.log(error)
            })
          }
        })
      }
    }
  }
}
</script>
<style>
    .created {
      color: rgba(255, 251, 0, 0.56) !important;
    }

    .processing {
      color: #1DA8D3 !important;
    }

    .running {
      color: #d5d835 !important;
    }


    .completed {
      color: #1AE75E !important;
    }

    .inputRequired {
      color: #E71A24 !important;
    }
</style>
