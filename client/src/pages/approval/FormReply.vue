<template>
<div>
  <Row>
    <Col v-show="loading" class="demo-spin-col" span="24" style="margin-top:35px;">
        <Spin fix>
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>Loading..</div>
        </Spin>
    </Col>
  </Row>
  <Row>
    <Col v-show="!loading" span="24">
      <div v-if="isallow">
        <div v-if="lastLog.status === 'inputRequired' && isTemplate !== undefined && isAccess">
          <iframe id="filecontainer" allowtransparency="true" frameborder="0" @load="iframeload()" :src="html"></iframe>
        </div>
        <div v-else-if="lastLog.status === 'inputRequired' && isAccess">
          <schema-instance :id="currentEntitySchema.id" :processid="lastLog.job" :instanceid="$route.params.fiid" :lastLog="lastLog"></schema-instance>
        </div>
        <div v-show="lastLog.status !== 'inputRequired'">
          <div id="canvas" style="height: calc(100vh - 130px); min-height: 400px;"></div>
        </div>
        <Spin size="large" fix v-if="submitLoading">
          <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
          <div>Submiting..</div>
        </Spin>
      </div>
      <div v-else>
        Unuthorized User
      </div>
    </Col>
  </Row>
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
let messageEvent

export default {
  components: {'schema-instance': SchemaInstance},
  data () {
    return {
      notes: '',
      submitLoading: false,
      loading: true,
      flowInstance: {},
      // isAccess: false,
      isallow: false,
      // istemplate: false,
      // lastLog: {},
      entitySchema: {},
      isInputStatus: false
    }
  },
  computed: {
    html () {
      return _.chain(this.flowInstance.processList).find(f => {
        return f.id === this.lastLog.job
      }).result('inputProperty[0].entityschema.createTemplate').find(f => {
        return f.filename === this.isTemplate
      }).reduce((result, value, key) => {
        if (key === 'url') {
          // result = 'https://' + this.currentEntitySchema.userID + '.' + value[0] + '.' + config.grapesDomain + '/' + value[1] + '.html'
          // result = 'http://localhost/person.html'
          result = 'https://work247.flowzcluster.tk/' + value[1] + '.html'
          // result = 'http://localhost/' + value[1] + '.html'
          // result = 'http://592fd3b09df25d00f7a11393.67671226-1635-43e0-a1b8-30e6524805e2.flowzcluster.tk/'+ value[1]+ '.html'
        }
        return result
      }, '').value()
    },
    currentEntitySchema () {
      return _.chain(this.flowInstance.processList).find(f => {
        return f.id === this.lastLog.job
      }).result('inputProperty[0].entityschema').value()
    },
    lastLog () {
      return _.chain(this.flowInstance.process_log).orderBy(['lastModified'], ['desc']).head().value()
    },
    isTemplate () {
      return _.chain(this.flowInstance.processList).find(f => {
        return f.id === this.lastLog.job
      }).result('inputProperty[0].createTemplate').value()
    },
    isAccess () {
      return _.chain(this.flowInstance.processList).find(f => {
        return f.id === this.lastLog.job
      }).result('configurations').findIndex(f => {
        return f.key === 'allowedusers' && (_.indexOf(f.value.split(',').map(item => item.trim()), this.$store.state.user.email) >= 0)
      }).value() >= 0
    }
  },
  methods: {
    async iframeload () {
      let self = this
      let array = []
      // let custom = []
      let customSchema = []
      // for (let i = 0; i < self.currentEntitySchema.entity.length; i++) {
      //   // if (self.currentEntitySchema.entity[i].customtype === true) {
      //   if (self.currentEntitySchema.entity[i].type === 'object' || self.currentEntitySchema.entity[i].type === 'array') {
      //     // console.log('self.currentEntitySchema.entity[i]', self.currentEntitySchema.entity[i])
      //     custom = await self.getCustom(self.currentEntitySchema.entity[i].id, true)
      //     array.push({customtype: true, name: self.currentEntitySchema.entity[i].name, entity: custom})
      //     custom = await self.getCustom(self.currentEntitySchema.entity[i].id, false)
      //     customSchema.push(custom)
      //   } else {
      //     array.push({name: self.currentEntitySchema.entity[i].name})
      //     customSchema.push(self.currentEntitySchema.entity[i])
      //   }
      // }
      // console.log('entity:: ', array, ' formData :: ', self.lastLog.input, ' schema :: ', customSchema)
      for (let ent of self.currentEntitySchema.entity) {
        if (ent.type === 'object' || ent.type === 'array') {
          let mdata = await self.getCustomData(ent.entity)
          array.push({customtype: true, name: ent.name, entity: mdata.arr})
          customSchema.push(mdata.custom)
        } else {
          array.push({name: ent.name})
          customSchema.push(ent)
        }
      }
      console.log('entity:: ', array, ' formData :: ', self.lastLog.input, ' schema :: ', customSchema)
      document.getElementById('filecontainer').contentWindow.postMessage({
        entity: array,
        formData: self.lastLog.input,
        schema: customSchema,
        configs: { accesskey: process.env.accesskey, secretkey: process.env.secretkey }
      }, '*')
      // handle Listener Event
      messageEvent = function (event) {
        if (_.isArray(event.data)) {
          self.handleSubmit(event.data)
        }
        window.removeEventListener('message', messageEvent)
      }
      window.addEventListener('message', messageEvent)
    },
    async getCustomData (entity) {
      let array = []
      let customData = []
      for (let ent of entity) {
        if (ent.type === 'object' || ent.type === 'array') {
          let mdata = await this.getCustomData(ent.entity)
          array.push({customtype: true, name: ent.name, entity: mdata.arr})
          customData.push(mdata.custom)
        } else {
          array.push({name: ent.name})
          customData.push(ent)
        }
      }
      return {arr: array, custom: customData}
    },
    // async getCustom (id, flag) {
    //   let tempSchema
    //   let tempData = []
    //   let customData = []
    //   let data = []
    //   let self = this
    //   tempSchema = await self.getSchema(id)
    //   for (let i = 0; i < tempSchema.entity.length; i++) {
    //     if (tempSchema.entity[i].customtype === true) {
    //       tempData = await self.getCustom(tempSchema.entity[i].type, true)
    //       data.push({customtype: true, name: tempSchema.entity[i].name, entity: tempData})
    //       tempData = await self.getCustom(tempSchema.entity[i].type, false)
    //       customData.push(tempData)
    //     } else {
    //       data.push({name: tempSchema.entity[i].name, type: tempSchema.entity[i].type})
    //       customData.push(tempSchema.entity[i])
    //     }
    //   }
    //   return flag ? data : customData
    // },
    async getSchema (id) {
      var resp = await Schema.getThis(id).then((res) => {
        return res.data
      }).catch(err => {
        console.log(err)
        return {}
      })
      return resp
    },
    async handleSubmit (maindata) {
      this.submitLoading = true
      for (let [inx, mObj] of maindata.entries()) {
        console.log('inx', inx)
        mObj.Schemaid = this.currentEntitySchema.id
      }
      let dataObject1 = {
        'instanceid': this.$route.params.fiid,
        'data': maindata,
        'processid': this.lastLog.job,
        'jobId': this.lastLog.jobId
      }
      if (maindata.length > 0) {
        Instance.post(dataObject1)
        .then(response => {
          // this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
        })
        .catch(error => {
          console.log('Error', error)
          this.submitLoading = false
          this.$Notice.error({title: 'Error!', desc: 'Instance not saved...'})
        })
      } else {
        this.$Notice.error({
          title: 'Error..!',
          desc: 'Details are in bottom of page.'
        })
      }
    },
    async beforeinit (fid) {
      this.flowInstance = await flowInstance.getThis(fid).then(response => {
        return response.data
      }).catch(error => {
        if (error.response) {
          this.$Message.error(error.response.data)
        } else {
          this.$Message.error('Server not connected.')
        }
        return {}
      })
      // check authentication
      if (_.indexOf(this.flowInstance.allowedusers, this.$store.state.user.email) >= 0) {
        // allowed
        this.isallow = true
        var bpmnXML = await flowz.get(this.flowInstance.fid)
          .then(async response => {
            return response.data
          })
        await this.initBPMN(bpmnXML.xml)
        this.loading = false
      } else {
        // not allowed
        this.isallow = false
      }
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
          if (!err) {
            _.forEach(self.flowInstance.processList, function (process) {
              var lastProcess = _.chain(self.flowInstance.process_log).filter(f => {
                return f.job === process.id
              }).orderBy(['lastModified'], ['desc']).value()
              if (lastProcess.length > 0) {
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
            // console.log(event, 'on', e.element)
            let myData = _.find(self.flowInstance.processList, {id: e.element.id})
            if (myData !== undefined) {
              let checkallow = false
              if (e.element.type === 'bpmn:EndEvent') {
                checkallow = true
              } else {
                if (self.$store.state.user !== null && self.$store.state.user !== undefined) {
                  let configUser = myData.configurations
                  if (configUser.length !== 0) {
                    let getUsers = _.find(configUser, {key: 'allowedusers'})
                    if (getUsers !== undefined) {
                      let users = getUsers.value.split(',')
                      let checkuser = _.indexOf(users, self.$store.state.user.email)
                      if (checkuser !== undefined && checkuser >= 0) {
                        checkallow = true
                      }
                    }
                  }
                }
              }

              // data only shown if user is allowed by flow
              if (checkallow) {
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
            }
          })
        })
      }
    }
  },
  mounted () {
    this.beforeinit(this.$route.params.fiid)
  },
  feathers: {
    'flowz-instance': {
      async updated (data) {
        let self = this
        if (this.$route.params.fiid !== undefined && this.$route.params.fiid === data.id) {
          this.flowInstance = data
          _.forEach(self.flowInstance.processList, function (process) {
            var lastProcess = _.chain(self.flowInstance.process_log).filter(f => {
              return f.job === process.id
            }).orderBy(['lastModified'], ['desc']).value()
            if (lastProcess.length > 0) {
              viewer.get('canvas').addMarker(process.id, self.getCurrentStatus(lastProcess))
            }
          })
          this.submitLoading = false
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
    height: calc(100vh - 135px);
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
