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
      <div class="split" style="height: calc(100vh - 110px);">
      <div v-show="graph" id="canvas" style="height: calc(80vh - 350px);border: 1px solid rgb(233, 234, 236);">
      </div>
      <!-- <div id="vertical-split" class="split split-horizontal"> -->
        <div  v-if="list || graph" id="vertical-split" style="height: calc(90vh - 130px);position: relative; margin-top:10px">
          <Col :span="spanTable">
            <div class="schema-form ivu-table-wrapper" >
                  <div class="ivu-table ivu-table-border">
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
                                <template v-for="(item, index) in flowInstance">
                                  <tr class="ivu-table-row">
                                      <td  v-if="showProp == false">
                                          <div class="ivu-table-cell">
                                              {{item.id}}
                                          </div>
                                      </td>
                                      <td >
                                          <a @click="setProperties(item)">
                                              <div class="ivu-table-cell">
                                                  {{item.name}}
                                                  <div v-if="showProp" :class="getStatus(item)" style="float:right;"><Icon style="font-size:18px" :type="getIcon(item)" /></div>
                                              </div>
                                          </a>
                                      </td>
                                      <td v-if="showProp == false">
                                        <div class="ivu-table-cell">
                                          {{getStatus(item)}}
                                        </div>
                                      </td>
                                  </tr>
                                  <!-- <tr class="ivu-table-row">
                                    <td colspan="3" v-if="item.properties.length > 0 &&  getStatus(item) === 'inputRequired'">
                                      <div class="ivu-table-cell">
                                        <expandRow :row="item" :lastLog="getLastLog(item)"></expandRow>
                                      </div>
                                    </td>
                                  </tr> -->
                                </template>
                              </tbody>
                          </table>
                      </span>
                  </div>
              </div>
          </Col>
          <Col span="16" v-if="showProp">
              <div>
                  <div class="demo-tabs-style1" style="background: #eee;padding:16px;">
                      <Tabs type="card"  style="min-height: calc(90vh - 130px);">
                          <TabPane label="Form Data" name="formtab">
                            <div v-if="html && propData.inputProperty.length > 0 &&  getStatus(propData) === 'inputRequired'" class="schema-form ivu-table-wrapper" style="padding-top:15px">
                                <div class="ivu-table ivu-table-border">
                                    <span class="ivu-table-body">
                                        <table cellspacing="0" cellpadding="0" border="0" style="width:100%">
                                            <tbody class="ivu-table-tbody">
                                               <schemaTemplate :row="propData" :html="html"></schemaTemplate>
                                            </tbody>
                                        </table>
                                    </span>
                                </div>
                            </div>
                            <div v-else-if="propData.inputProperty.length > 0 &&  getStatus(propData) === 'inputRequired'" class="schema-form ivu-table-wrapper" style="padding-top:15px">
                                <div class="ivu-table ivu-table-border">
                                    <span class="ivu-table-body">
                                        <table cellspacing="0" cellpadding="0" border="0" style="width:100%">
                                            <tbody class="ivu-table-tbody">
                                               <template>
                                                <tr class="ivu-table-row">
                                                  <td >
                                                    <div class="ivu-table-cell">
                                                      <expandRow :row="propData" :lastLog="getLastLog(propData)"></expandRow>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </template>
                                            </tbody>
                                        </table>
                                    </span>
                                </div>
                            </div>
                            <div v-else>
                              <Table stripe :columns="getLogColumnsFormData(propData)" :data="getLogDataFormData(propData)"></Table>
                            </div>
                          </TabPane>
                          <TabPane label="Logs"  name="logtab">
                            <Table stripe :columns="getLogColumns(propData)" :data="getLogData(propData)"></Table>
                            <!-- <div v-if="yes" style="margin-top:15px">
                              <Table stripe :columns="getLogColumnsFormData(propData)" :data="getLogDataFormData(propData)"></Table>
                            </div> -->
                          </TabPane>
                          <Button type="primary" slot="extra" size="small" icon="close" @click="showProp = false"></Button>
                      </Tabs>
                  </div>
              </div>
          </Col>
        </div>
      <!-- </div> -->
    </div>
      <!-- <Table :columns="columns" :data="flowInstance"></Table> -->
      <!-- {{showProp}} -->
    </row>
  </div>
</template>
<script>
import expandRow from '@/components/expand-process.vue'
import instance from '@/api/flowzinstance'
import schemaTemplate from '@/components/SchemaTemplate.vue'
import expandRow1 from './formdata-expand.vue'
import _ from 'lodash'
import Split from 'split.js'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer.js'
import flowz from '@/api/flowz'
import axios from 'axios'
import config from '../../../config'
// socket
let viewer, canvas
export default {
  components: { expandRow, schemaTemplate },
  data () {
    return {
      yes: false,
      flowInstance: [],
      flowInstanceLog: [],
      flowid: 0,
      bpmnXML: '',
      graph: false,
      list: true,
      html: '',
      entitySchema: {},
      showProp: false,
      propData: {},
      iconList: {
        created: 'ios-paper-outline',
        completed: 'checkmark',
        inputRequired: 'ios-help-outline',
        processing: 'load-a'
      }
    }
  },
  computed: {
    spanTable () {
      return this.showProp ? 8 : 24
    }
  },
  async mounted () {
    Split(['#canvas', '#vertical-split'], {
      direction: 'vertical'
    })

    let self = this
    // console.log(this.$route.params.id)
    await instance.getThis(this.$route.params.id)
    .then(response => {
      this.flowInstance = response.data.processList
      this.flowInstanceLog = response.data.process_log
      this.flowid = response.data.fid
    })
    .catch(error => {
      console.log(error)
    })
    await flowz.get(this.flowid)
    .then(response => {
      console.log('response.data.data.xml', response.data)
      this.bpmnXML = response.data.xml
      self.initBPMN()
    })
  },
  feathers: {
    'flowz-instance': {
      updated (data) { // update status using socket
        if (data.id === this.$route.params.id) {
          this.flowInstance = data.processList
          this.flowInstanceLog = data.process_log
          document.getElementById('canvas').innerHTML = ''
          this.initBPMN()
        }
      }
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    getLogColumns (propData) {
      var log = this.getLastLog(propData)
      var logs = this.getLastLogs(propData)
      var cols = []
      // var obj = {cols: this.getLogColumnsFormData(propData), formdata: this.getLogDataFormData(propData), rData: logs[params.index]}
      cols.push({type: 'expand',
        width: 50,
        render: (h, params) => {
          return h(expandRow1, {
            props: {
              row: {cols: this.getLogColumnsFormData(propData), formdata: this.getLogDataFormData(propData), rData: logs[params.index]}
            }
          })
        }
      })
      _.forEach(log, (v, k) => {
        if (k === 'job' || k === 'jobType' || k === 'lastModified' || k === 'status') {
          cols.push({title: k, key: k})
        }
      })
      // cols.push({title: 'icon',
      //   key: 'icon',
      //   render: (h, params) => {
      //     return h('div', [
      //       h('Button', {
      //         props: {
      //           type: 'text',
      //           size: 'large',
      //           icon: 'eye'
      //         },
      //         style: {
      //           // color: '#CC0000',
      //           marginRight: '3px',
      //           padding: '0px',
      //           fontSize: '20px'
      //         },
      //         on: {
      //           click: () => {
      //             // alert(11)
      //             this.yes = true
      //             // this.edit(params.row.id)
      //           }
      //         }
      //       }, '')
      //     ])
      //   }
      // })
      return cols
    },
    getLogData (propData) {
      var dt = []
      // var obj = {}
      let obj
      var logs = this.getLastLogs(propData)
      _.forEach(logs, (log, i) => {
        obj = {
          'job': log.job,
          'jobType': log.jobType,
          'lastModified': log.lastModified,
          'status': log.status
        }
        // _.forEach(log, (v, k) => {
        //   // if (k === 'job' || k === 'jobType' || k === 'lastModified' || k === 'status') {
        //   //   obj[k] = v
        //   // }
        // })
        dt.push(obj)
      })
      console.log('@@@@@@@@@@@@@@', dt)
      return dt
    },
    getLogColumnsFormData (propData) {
      var cols = []
      var log = this.getLastLog(propData)
      var obj = log.input
      var data = []
      _.forEach(obj, function (v, k) {
        data = Object.keys(v)
        // console.log('!!!!!!!!!', v['candidate name'])
      })
      _.forEach(data, function (value) {
        if (value === 'candidate name' || value === 'contact number' || value === 'id') {
          console.log('@@@@@@@@@@@@@@ee', value)
          cols.push({title: value, key: value})
        }
      })
      // _.forEach(log, (v, k) => {
      //   if (v === 'Name' || v === 'Email' || v === 'id') {
      //   }
      // })
      return cols
    },
    getLogDataFormData (propData) {
      var log = this.getLastLog(propData)
      var obj = log.input
      var data
      var dt = []
      _.forEach(obj, (v, k) => {
        // console.log('############', v.id, k)
      //   // if (k === 'Name' || k === 'Email' || k === 'id') {
      //   //   console.log('title', k)
      //   //   console.log('key', v)
        // data.push(v)
        data = {
          'candidate name': v['candidate name'],
          'contact number': v['contact number'],
          'id': v.id
        }

        dt.push(data)
      //   // }
      })
      console.log('@@@@@@@@@@@@@@', dt)
      return dt

      // var dt = []
      // // var obj = {}
      // var logs = this.getLastLogs(propData)
      // _.forEach(logs, (log, i) => {
      //   let obj = {
      //     'job': log.job,
      //     'jobType': log.jobType,
      //     'lastModified': log.lastModified,
      //     'status': log.status
      //   }
      //   // _.forEach(log, (v, k) => {
      //   //   // if (k === 'job' || k === 'jobType' || k === 'lastModified' || k === 'status') {
      //   //   //   obj[k] = v
      //   //   // }
      //   // })
      //   dt.push(obj)
      // })
      // return dt
    },
    getIcon (item) {
      var result = this.getStatus(item)
      if (result === 'created') {
        return this.iconList.created
      } else if (result === 'processing') {
        return this.iconList.processing
      } else if (result === 'inputRequired') {
        return this.iconList.inputRequired
      } else if (result === 'completed') {
        return this.iconList.completed
      }
    },
    setProperties (item) {
      let self = this
      if (item.inputProperty.length > 0) {
        if (item.inputProperty[0].createTemplate !== undefined) {
          if (item.inputProperty[0].entityschema.createTemplate.length > 0) {
            let templateObj = _.find(item.inputProperty[0].entityschema.createTemplate, ['filename', item.inputProperty[0].createTemplate])
            axios.get(templateObj.url)
              .then(function (response) {
                self.html = response.data
              })
              .catch(function (error) {
                console.log('Error...!', error)
              })
          } else {
            self.html = ''
          }
        }
        this.entitySchema = item.inputProperty[0].entityschema
      }
      import('../../../../static/js/form.js')
      import('../../../../static/js/checkbox.js')
      import('../../../../static/js/radiobutton.js')
      import('../../../../static/js/selectValue.js')
      this.showProp = true
      this.propData = item
    },
    getStatus (item) {
      var status = _.chain(this.flowInstanceLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === item.id }).reduce((result, value, key) => {
        if (key === 'status') {
          result = value
        }
        return result
      }, '').value()

      if (status === 'inputRequired') {
        this.setProperties(item)
      }
      if (status === 'mappingRequired') {
        console.log('mappingRequired-status', status)
        this.forwardmappingdata()
      }
      return status
    },
    getLastLog (item) {
      return _.chain(this.flowInstanceLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === item.id }).value()
    },
    getLastLogs (item) {
      // console.log('item', _.orderBy(_.filter(this.flowInstanceLog, function (o) { return o.job === item.id }), ['lastModified'], ['asc']))
      // return _.chain(this.flowInstanceLog).orderBy(['lastModified'], ['asc']).find((f) => { return f.job === item.id }).value()
      return _.orderBy(_.filter(this.flowInstanceLog, function (o) { return o.job === item.id }), ['lastModified'], ['asc'])
    },
    initBPMN () {
      let self = this
      viewer = new BpmnViewer({container: '#canvas'})
      viewer.importXML(this.bpmnXML, function (err) {
        if (err) {
          console.log('error rendering', err)
        } else {
          // console.log('self', self)
          _.forEach(self.flowInstanceLog, function (process) {
            canvas = viewer.get('canvas')
            canvas.addMarker(process.job, _.chain(self.flowInstanceLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === process.job }).value().status)
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
    },
    forwardmappingdata () {
      // console.log('config.serverURI', config.serverURI)
      let self = this
      _.forEach(self.flowInstance, (v, k) => {
        let lastLog = self.getLastLog(v)
        if (lastLog !== undefined && lastLog.status === 'mappingRequired') {
          // console.log('forwadamapping', lastLog)
          let dataObject = {
            'fId': self.$route.params.id,
            'input': lastLog.input[0].inputs,
            'isExternalInput': true,
            'jobId': lastLog.job
          }
          let uri = config.serverURI + '/addInputToJobQue'
          console.log('dataObject', dataObject)
          axios.post(uri, dataObject)
          .then(function (response) {
            console.log(response)
          })
          .catch(function (error) {
            console.log(error)
          })
        }
      })
    }
  }
}
</script>
<style>
  .demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content {
        height: inherit;
        margin-top: -16px;
    }
    .demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content > .ivu-tabs-tabpane {
        background: #fff;
        padding: 16px;
    }
    .demo-tabs-style1 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
        border-color: transparent;
    }

    .demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active {
        border-color: #fff;
    }
    .demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab{
        border-radius: 0;
        background: #fff;
    }
    .demo-tabs-style1 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active{
        border-top: 1px solid #3399ff;
    }
    .demo-tabs-style1 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active:before{
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background: #3399ff;
        position: absolute;
        top: 0;
        left: 0;
    }
    .ivu-table th {
      height: 44px;
      white-space: nowrap;
      overflow: hidden;
      background-color: #394263;
      color: #fff;
    }
    /*.ivu-table td:hover {
      background-color: #eee;
    }*/
    .created {
      color: rgba(255, 251, 0, 0.56) !important;
    }

    .processing {
      color: #1DA8D3 !important;
    }

    .completed {
      color: #1AE75E !important;
    }

    .inputRequired {
      color: #E71A24 !important;
    }
    .ivu-table-cell-expand i {
      font-size: 17px !important;
      margin-right: 0px !important;
    }
</style>
