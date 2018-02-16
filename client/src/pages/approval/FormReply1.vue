<template>
<div style="background:#eee;padding: 20px">
  <Card :bordered="false">
    <p slot="title">Make Request</p>
    <p slot="extra" v-show="notes">Notes : {{ notes }}</p>
    
    <div v-if="status === 'inputRequired'">
      <div v-if="isdefault">
        <schema-instance :id="entitySchema.id" :processid="log.job" :instanceid="$route.params.fiid" :lastLog="log"></schema-instance>
      </div>
      <div v-else >
        <iframe id="filecontainer" allowtransparency="true" frameborder="0" @load="iframeload()" :src="html"></iframe>
      </div>
      <ul class="error">
        <li v-for="item in err">{{item}}</li>
      </ul>
    </div>
    <div v-else>
      <div id="canvas" style="height: 400px"></div>
    </div>
  </Card>
</div>
</template>
<script>
// import config from '@/config'

// Models
import Schema from '@/api/schema'
import flowInstance from '@/api/flowzinstance'
import Instance from '@/api/instance'
import modelBpmnplugin from '@/api/bpmnplugins'
import flowz from '@/api/flowz'
// import ReceiveForm from '@/ap'

// Lib
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer.js'
import _ from 'lodash'

// Components
import SchemaInstance from '../../components/SchemaInstance.vue'
import dynamicTable from './expand-FormReply.vue'

// Static - lib
import camundaModdleDescriptor from '../../../static/bpmn/camunda-bpmn-moddle/resources/camunda'
let viewer
export default {
  components: {'schema-instance': SchemaInstance},
  data () {
    return {
      loading: false,
      notes: '',
      input: [],
      selectedProcess: {},
      entitySchema: [],
      customSchema: [],
      URL: '',
      err: [],
      log: {},
      isdefault: false,
      status: 'waiting',
      showOutput: [],
      cols: [],
      flowInstance: {},
      move: ''
    }
  },
  computed: {
    html () {
      if (this.selectedProcess.inputProperty) {
        // console.log(this.selectedProcess.inputProperty[0].entityschema)
        let index = _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', this.selectedProcess.inputProperty[0].createTemplate])
        // console.log('index', index)
        let url = ''
        if (index !== -1) {
          // var temp = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]
          // console.log('this.selectedProcess', this.selectedProcess)
          // url = 'http://' + this.selectedProcess.inputProperty[0].entityschema.userID + '.' + temp.url[0] + '.' + config.grapesDomain + '/' + temp.url[1] + '.html'
          // console.log('this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]', this.selectedProcess.inputProperty[0].entityschema.createTemplate[index])
          // url = 'http://' + this.$store.state.user._id + '.' + temp.url[0] + '.' + config.grapesDomain + '/' + temp.url[1] + '.html'
          // url = 'http://localhost/person.html'
          url = 'http://localhost/multifile2.html'
        }
        return url
      }
    }
  },
  methods: {
    async iframeload () {
      // console.log('.......................... iframeload .................................')
      let self = this
      let array = []
      let data = []
      let custom = []
      let customSchema = []
      for (let i = 0; i < self.entitySchema.entity.length; i++) {
        if (self.entitySchema.entity[i].customtype === true) {
          custom = await self.getCustom(self.entitySchema.entity[i].type, true)
          array.push({customtype: true, name: self.entitySchema.entity[i].name, entity: custom})
          custom = await self.getCustom(self.entitySchema.entity[i].type, false)
          customSchema.push(custom)
        } else {
          array.push({name: self.entitySchema.entity[i].name, type: self.entitySchema.entity[i].type})
          customSchema.push(self.entitySchema.entity[i])
        }
      }
      _.forEach(self.log.input, function (item) {
        data.push(item)
      })
      self.customSchema = customSchema
      // console.log('Schema.............', self.entitySchema, self.customSchema)
      document.getElementById('filecontainer').contentWindow.postMessage({entity: array, formData: data, schema: self.customSchema, configs: { accesskey: process.env.accesskey, secretkey: process.env.secretkey }}, '*')
    },
    async getCustom (id, flag) {
      let tempSchema
      let tempData = []
      let customData = []
      let data = []
      let self = this
      tempSchema = await self.getSchema(id)
      for (let i = 0; i < tempSchema.entity.length; i++) {
        if (tempSchema.entity[i].customtype === true) {
          tempData = await self.getCustom(tempSchema.entity[i].type, true)
          data.push({customtype: true, name: tempSchema.entity[i].name, entity: tempData})
          tempData = await self.getCustom(tempSchema.entity[i].type, false)
          customData.push(tempData)
        } else {
          data.push({name: tempSchema.entity[i].name})
          customData.push(tempSchema.entity[i])
        }
      }
      return flag ? data : customData
    },
    async getSchema (id) {
      let data
      await Schema.getThis(id).then((res) => {
        data = res.data
      })
      // console.log('data...........', data)
      return data
    },
    async handleSubmit (maindata) {
      // let dataObject = {
      //   'fId': this.$route.params.fiid,
      //   'inputs': this.input,
      //   'job': this.$route.params.pid
      // }
      for (let [inx, mObj] of maindata.entries()) {
        console.log('inx', inx)
        mObj.Schemaid = this.entitySchema.id
      }
      let dataObject1 = {
        'instanceid': this.$route.params.fiid,
        'data': maindata,
        'processid': this.log.job,
        'jobId': this.log.jobId
      }
      // console.log(validated, maindata.length)
      if (maindata.length > 0) {
        // console.log('dataObject1', dataObject1)
        Instance.post(dataObject1)
        .then(response => {
          // console.log('response', response.data)
          this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
          // this.$Loading.finish()
        })
        .catch(error => {
          console.log('Error', error)
          this.$Notice.error({title: 'Error!', desc: 'Instance not saved...'})
          // this.$Loading.error()
        })
        // ReceiveForm.post(dataObject)
        // .then(response => {
        //   this.$Notice.success({title: 'Success..!', desc: 'Form request sent.'})
        //   this.$router.push('/')
        // })
        // .catch(err => {
        //   this.$Notice.success({title: 'Error..!', desc: err})
        // })
      } else {
        this.$Notice.error({
          title: 'Error..!',
          desc: 'Details are in bottom of page.'
        })
        this.input = []
      }
    },
    async init (fid) {
      let self = this
      let response = await flowInstance.getThis(fid)
      .then(function (response) {
        return response
      })
      .catch(function (error) {
        console.log('Error', error)
        self.$Notice.error({title: 'Error..!', desc: error})
        return {data: []}
      })
      self.flowInstance = response.data
      self.flowInstance.processList = _.chain(response.data.processList).map(m => {
        m.log = _.chain(response.data.process_log).filter(f => {
          return f.job === m.id
        }).orderBy(['lastModified'], ['desc']).groupBy('jobId').value()
        // this.handleMappingRequireStatus(m)
        return m
      }).value()
      let getlastlog = _.chain(response.data.process_log).orderBy(['lastModified'], ['desc']).head().value()
      console.log('getlastlog', getlastlog)
      if (getlastlog !== undefined && getlastlog.status === 'inputRequired') {
        self.status = 'inputRequired'
        self.selectedProcess = _.find(response.data.processList, ['id', getlastlog.job])
        self.entitySchema = await self.getSchema(self.selectedProcess.inputProperty[0].entityschema.id)
        self.log = getlastlog
        let index = _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', self.selectedProcess.inputProperty[0].createTemplate])
        if (index < 0) {
          this.isdefault = true
        }
      }

      // Get Flow
      var bpmnXML = await flowz.get(response.data.fid)
      .then(async response => {
        return response.data
      })
      // console.log('bpmnXML.xml...', bpmnXML.xml)
      // Init Bpmn
      await this.initBPMN(bpmnXML.xml)
    },
    getCurrentStatus (log) {
      return (log && log.length > 0) ? _.head(log).status : ''
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
            camunda: camundaModdleDescriptor
          }
        })
        viewer.importXML(xml, function (err) {
          if (err) {
            console.log('error rendering', err)
          } else {
            // console.log('...................................', self.flowInstance)
            // _.forEach(self.flowInstance.processList, function (process1) {
            for (let process1 of self.flowInstance.processList) {
              var lastProcess = process1.log[_.findLastKey(process1.log)]
              if (lastProcess) {
                console.log('process1.log', process1.id, self.getCurrentStatus(lastProcess))
                // viewer.get('canvas').addMarker(process1.id, 'red')
                if (self.getCurrentStatus(process1 && process1.id !== undefined && process1.id !== '' && lastProcess) !== '' && self.getCurrentStatus(lastProcess) !== undefined) {
                  viewer.get('canvas').addMarker(process1.id, self.getCurrentStatus(lastProcess))
                }
              }
            }
            // })
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
            // console.log(event, 'on', e.element.id)
            // self.showData(e.element.id)
            let myData = _.find(self.flowInstance.processList, {id: e.element.id})
            console.log('>>>>>>>>>>>>>>>>', self.flowInstance, myData)
            if (myData !== undefined) {
              let tData = []
              for (let k in myData.log) {
                tData.push(_.head(myData.log[k]))
              }
              let iCols = [{
                type: 'expand',
                width: 50,
                render: (h, params) => {
                  return h(dynamicTable, {
                    props: {
                      data: params.row.input
                    }
                  })
                }
              }, {
                title: 'Jobs',
                key: 'jobId'
              }]
              let oCols = [{
                type: 'expand',
                width: 50,
                render: (h, params) => {
                  return h(dynamicTable, {
                    props: {
                      data: params.row.output
                    }
                  })
                }
              }, {
                title: 'Jobs',
                key: 'jobId'
              }]
              self.$Modal.info({
                title: e.element.id,
                closable: true,
                width: '1200px',
                render: (h, params) => {
                  return ('div', {}, [
                    h('Tabs', {}, [
                      h('TabPane', {
                        props: {
                          label: 'Input',
                          icon: 'arrow-down-c'
                        }
                      }, [
                        h('Table', {
                          props: {
                            columns: iCols,
                            data: tData
                          }
                        })
                      ]),
                      h('TabPane', {
                        props: {
                          label: 'Output',
                          icon: 'arrow-up-c'
                        }
                      }, [
                        h('Table', {
                          props: {
                            columns: oCols,
                            data: tData
                          }
                        })
                      ])
                    ])
                  ])
                }
              })
            }
          })
        })
      }
    }
  },
  mounted () {
    this.init(this.$route.params.fiid)
  },
  created () {
    let self = this
    window.addEventListener('message', function (event) {
      console.log('.......................... event.data :', event.data)
      if (_.isArray(event.data)) {
        self.handleSubmit(event.data)
      }
    })
  },
  feathers: {
    'flowz-instance': {
      async updated (data) {
        // this.init(this.$route.params.fiid)
        let self = this
        if (this.$route.params.fiid !== undefined) {
          let response = await flowInstance.getThis(this.$route.params.fiid)
          .then(function (response) {
            return response
          })
          .catch(function (error) {
            console.log('Error', error)
            self.$Notice.error({title: 'Error..!', desc: error})
            return {data: []}
          })
          self.flowInstance = response.data
          self.flowInstance.processList = _.chain(response.data.processList).map(m => {
            m.log = _.chain(response.data.process_log).filter(f => {
              return f.job === m.id
            }).orderBy(['lastModified'], ['desc']).groupBy('jobId').value()
            // this.handleMappingRequireStatus(m)
            return m
          }).value()
          let getlastlog = _.chain(response.data.process_log).orderBy(['lastModified'], ['desc']).head().value()
          console.log('getlastlog', getlastlog)
          if (getlastlog !== undefined && getlastlog.status === 'inputRequired') {
            self.status = 'inputRequired'
            self.selectedProcess = _.find(response.data.processList, ['id', getlastlog.job])
            self.entitySchema = await self.getSchema(self.selectedProcess.inputProperty[0].entityschema.id)
            self.log = getlastlog
            let index = _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', self.selectedProcess.inputProperty[0].createTemplate])
            if (index < 0) {
              this.isdefault = true
            }
            location.reload()
          }
          _.forEach(self.flowInstance.processList, function (process) {
            var lastProcess = process.log[_.findLastKey(process.log)]
            if (lastProcess && process !== undefined && process.id !== undefined && self.getCurrentStatus(lastProcess) !== undefined && self.getCurrentStatus(lastProcess) !== '') {
              viewer.get('canvas').addMarker(process.id, self.getCurrentStatus(lastProcess))
            }
          })
        }
      }
    }
  }
}
</script>
<style>
.error {
  color: red;
}
iframe {
    min-height: 405px;
    width: 100%;
    background: #FFFFFF;
    padding: 0px;
}
.running:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #d5d835 !important;
}
.created:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: rgba(255, 251, 0, 0.56) !important;
}
.mappingRequired:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #d5d835 !important;
}
.inputRequired:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #E71A24 !important;
}
.processing:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #1DA8D3 !important;
}
.completed:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #1AE75E !important;
}
</style>
