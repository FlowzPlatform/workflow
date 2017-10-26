<template>
  <div>
    <row>
      <div style="float:right">
        <ButtonGroup>
          <Button type="primary" @click="graph = true, list = false" icon="pie-graph"></Button>
          <Button type="primary" @click="graph = false, list = true" icon="navicon-round"></Button>
      </ButtonGroup>
      </div>
    </row>
    <row>
      <div v-show="graph" id="canvas" style="width: 100%;height: calc(90vh - 130px);position: relative;">
      </div>
      <div  v-if="list" style="height: calc(90vh - 130px);position: relative; margin-top:10px">
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
                          </TabPane>
                          <TabPane label="Logs"  name="logtab">
                            <Table stripe :columns="getLogColumns(propData)" :data="getLogData(propData)"></Table>
                          </TabPane>
                          <Button type="primary" slot="extra" size="small" icon="close" @click="showProp = false"></Button>
                      </Tabs>
                  </div>
              </div>
          </Col>
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
import _ from 'lodash'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer.js'
import flowz from '@/api/flowz'
import axios from 'axios'
// socket
let viewer, canvas
export default {
  components: { expandRow, schemaTemplate },
  data () {
    return {
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
    let self = this
    // console.log(this.$route.params.id)
    await instance.getThis(this.$route.params.id)
    .then(response => {
      // console.log('response instance', response)
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
        this.flowInstance = data.processList
        this.flowInstanceLog = data.process_log
        document.getElementById('canvas').innerHTML = ''
        this.initBPMN()
      }
    }
  },
  methods: {
    getLogColumns (propData) {
      var log = this.getLastLog(propData)
      var cols = []
      _.forEach(log, (v, k) => {
        if (k === 'job' || k === 'jobType' || k === 'lastModified' || k === 'status') {
          cols.push({title: k, key: k})
        }
      })
      return cols
    },
    getLogData (propData) {
      var dt = []
      // var obj = {}
      var logs = this.getLastLogs(propData)
      _.forEach(logs, (log, i) => {
        let obj = {
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
      return dt
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
          console.log('self', self)
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
</style>