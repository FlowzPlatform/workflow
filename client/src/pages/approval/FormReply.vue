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
      <!--  + this.$route.params.fiid + '&&pid=' + this.$route.params.pid + '' -->
      <ul class="error">
        <li v-for="item in err">{{item}}</li>
      </ul>
    </div>
    <!-- <div v-else-if="status === 'completed'"> -->
      <!-- Process Completed
      <Table size="small" :columns="cols" :data="showOutput"></Table>
    </div> -->
    <div v-else>
      <!-- Waiting.... -->
      <div id="canvas" style="height: 400px"></div>
    </div>
  </Card>
</div>
</template>
<script>
import config from '@/config'

// Models
import Schema from '@/api/schema'
import flowInstance from '@/api/flowzinstance'
import Instance from '@/api/instance'
import modelBpmnplugin from '@/api/bpmnplugins'
import flowz from '@/api/flowz'
// import ReceiveForm from '@/ap'
// import config from '@/config'process.env.accesskey import $ froprocess.env 'jquery'

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
      flowInstance: {}
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
          var temp = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]
          console.log('this.selectedProcess', this.selectedProcess)
          url = 'http://' + this.selectedProcess.inputProperty[0].entityschema.userID + '.' + temp.url[0] + '.' + config.grapesDomain + '/' + temp.url[1] + '.html'
          // console.log('this.selectedProcess.inputProperty[0].entityschema.createTemplate[index]', this.selectedProcess.inputProperty[0].entityschema.createTemplate[index])
          // url = 'http://' + this.$store.state.user._id + '.' + temp.url[0] + '.' + config.grapesDomain + '/' + temp.url[1] + '.html'
          // url = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index].url
          // url = url.substr(0, 4) + url.substr(5)
          // url = 'http://172.16.230.133/websites/59a8e0dd41dc17001aeb1e67/c6f938a9-41f0-49e1-aaf1-65f8ce94b4e9/public/index.html'
          // url = 'http://localhost/orderentry.html'
          // url = 'http://172.16.230.133/websites/59fb06376adc6b00242a5533/f3455e59-b6b5-4b74-b02b-f39038f73bd7/public/index.html'
        }
        // console.log('url', url)
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
      // await flowInstance.getThis(self.$route.params.fiid)
      // .then(async function (response) {
      //   // console.log('self.selectedProcess.inputProperty[0].entityschema', self.selectedProcess.inputProperty[0].entityschema)
      //   let getlastlog = _.chain(response.data.process_log).orderBy(['lastModified'], ['desc']).head().value()
      //   console.log('getlastlog', getlastlog)
      //   if (getlastlog !== undefined && getlastlog.status === 'inputRequired') {
      //     self.status = 'inputRequired'
      //     self.selectedProcess = await _.find(response.data.processList, ['id', getlastlog.job])
      //     // console.log('response.data.process_log', self.selectedProcess.inputProperty[0].entityschema.id)
      //     self.entitySchema = await self.getSchema(self.selectedProcess.inputProperty[0].entityschema.id)
      //     self.log = getlastlog
      //     // self.log = await _.chain(response.data.process_log).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === self.$route.params.pid }).value()
      //   }
      //   if (getlastlog !== undefined && getlastlog.status === 'completed') {
      //     self.status = 'completed'
      //     self.log = getlastlog
      //     self.status = 'completed'
      //     self.showOutput = getlastlog.output
      //     let obj = _.omit(getlastlog.output[0], ['_id', 'Schemaid'])
      //     self.cols = _.map(obj, (v, k) => {
      //       return { title: k, key: k }
      //     })
      //   }
      // })
      // .catch(function (error) {
      //   self.$Notice.error({title: 'Error..!', desc: error})
      // })
      // console.log('self.entitySchema.entity', self.entitySchema.entity)
      for (let i = 0; i < self.entitySchema.entity.length; i++) {
        if (self.entitySchema.entity[i].customtype === true) {
          custom = await self.getCustom(self.entitySchema.entity[i].type, true)
          array.push({customtype: true, name: self.entitySchema.entity[i].name, entity: custom})
          custom = await self.getCustom(self.entitySchema.entity[i].type, false)
          customSchema.push(custom)
        } else {
          array.push({name: self.entitySchema.entity[i].name})
          customSchema.push(self.entitySchema.entity[i])
        }
      }
      _.forEach(self.log.input, function (item) {
        data.push(item)
      })
      self.customSchema = customSchema
      console.log('Schema.............', self.entitySchema, self.customSchema)
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
    // method for validation purpos
    // async getValidate (event, schema) {
    //   let self = this
    //   let err = this.err
    //   let val, result, element, newSchema
    //   schema === undefined ? newSchema = self.customSchema : newSchema = schema
    //   let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
    //   let numberRegEx = '^[0-9]+$'
    //   let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
    //   await Object.keys(event).forEach(async function (key, index) {
    //     for (var i = 0; i < newSchema.length; i++) {
    //       if (key === newSchema[i].name || Array.isArray(newSchema[i])) {
    //         val = event[key]
    //         result = newSchema[i]
    //         element = {value: event[key], name: key, type: Array.isArray(event[key]) ? 'customtype' : newSchema[i].type}
    //         if (element.type === 'customtype') {
    //           self.getValidate(event[key][0], newSchema[i])
    //         } else {
    //           if (result.property.optional === false) {
    //             if (val === '' || val === null || val === undefined) {
    //               err.push(element.name + ' - is required..!')
    //               if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                 $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> required..!</div>')
    //               }
    //             } else {
    //               $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //             }
    //             if (result.property.regEx !== null || result.property.regEx !== undefined) {
    //               let pttrn = new RegExp(result.property.regEx)
    //               let regEx = pttrn.test(val)
    //               if (!regEx) {
    //                 err.push(element.name + ' - Enter proper format..!')
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter proper format..!</div>')
    //                 }
    //               } else {
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               }
    //             }
    //             if (element.type === 'date') {
    //               let inputDate = new Date(val)
    //               if (result.property.maxdate !== '') {
    //                 let maxDate = new Date(result.property.maxdate)
    //                 if (inputDate > maxDate) {
    //                   err.push(element.name + ' - Enter minimum date then ' + maxDate)
    //                   if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                     $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + maxDate + '</div>')
    //                   }
    //                 } else {
    //                   $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //                 }
    //               } else if (result.property.mindate !== '') {
    //                 let minDate = new Date(result.property.mindate)
    //                 if (inputDate < minDate) {
    //                   err.push(element.name + ' - Enter maximum date then ' + minDate)
    //                   if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                     $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + minDate + '</div>')
    //                   }
    //                 } else {
    //                   $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //                 }
    //               }
    //             }
    //             if (result.property.min !== 0 || result.property.max !== 0) {
    //               if (val.length > result.property.min && val.length > result.property.max) {
    //                 err.push(element.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.property.min + ' Maximum length :' + result.property.max + '</div>')
    //                 }
    //               } else if (val.length > result.property.max && val.length < result.property.min) {
    //                 err.push(element.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.property.min + ' Maximum length :' + result.property.max + '</div>')
    //                 }
    //               } else {
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               }
    //             }
    //             if (result.property.allowedValue.length > 0) {
    //               let check = _.includes(result.property.allowedValue, val)
    //               if (!check) {
    //                 err.push(element.name + ' - Allowed value are' + result.property.allowedValue)
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Allowed value are' + result.property.allowedValue + '</div>')
    //                 }
    //               } else {
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               }
    //             }
    //           }
    //           switch (element.type) {
    //             case 'email':
    //               let re = new RegExp(emailRegEx)
    //               let testEmail = re.test(val)
    //               if (testEmail) {
    //                 // temp[element.name] = val
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               } else {
    //                 err.push(element.name + ' - Enter valid email address..!')
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter valid email address..!</div>')
    //                 }
    //               }
    //               break
    //             case 'number':
    //               re = new RegExp(numberRegEx)
    //               testEmail = re.test(val)
    //               if (testEmail) {
    //                 // temp[element.name] = val
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               } else {
    //                 err.push(element.name + ' - Enter numbers only..!')
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter numbers only..!</div>')
    //                 }
    //               }
    //               break
    //             case 'date':
    //               re = new RegExp(dateRegEx)
    //               testEmail = re.test(val)
    //               if (testEmail) {
    //                 // temp[element.name] = val
    //                 $('input[name="' + element.name + '"]').parent().next('.validation').remove()
    //               } else {
    //                 err.push(element.name + ' - Invalid date format..!')
    //                 if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
    //                   $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Invalid date format..!</div>')
    //                 }
    //               }
    //               break
    //             default:
    //               console.log(element.name, ': ', val)
    //           }
    //         }
    //       }
    //     }
    //   })
    //   if (err.length > 0) { return false } else { return true }
    // },
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
      // if (getlastlog !== undefined && getlastlog.status === 'completed') {
      //   self.status = 'completed'
      //   self.showOutput = getlastlog.output
      //   let obj = _.omit(getlastlog.output[0], ['_id', 'Schemaid'])
      //   self.cols = _.map(obj, (v, k) => {
      //     return { title: k, key: k }
      //   })
      // }

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
                viewer.get('canvas').addMarker(process1.id, self.getCurrentStatus(lastProcess))
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
  async mounted () {
    let self = this
    // let validated
    this.init(self.$route.params.fiid)
    window.addEventListener('message', async function (event) {
      console.log('.......................... event.data :', event.data)
      self.err = []
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
          }
          _.forEach(self.flowInstance.processList, function (process) {
            var lastProcess = process.log[_.findLastKey(process.log)]
            if (lastProcess) {
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
/*.created {
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
}*/
.created:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: rgba(255, 251, 0, 0.56) !important;
}
.inputRequired:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #E71A24 !important;
}
.running:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #d5d835 !important;
}
.processing:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #1DA8D3 !important;
}
.completed:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #1AE75E !important;
}
.mappingRequired:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: #d5d835 !important;
}
</style>
