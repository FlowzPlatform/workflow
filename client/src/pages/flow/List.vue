<template>
  <div class="flow">
    <row>
      <Button type="primary" style="float: right;margin-bottom: 2px;" @click="addNewFlow"><Icon type="plus" size="16"></Icon> Add</Button>
    </row>
    <!-- <div slot="content">
        <div class="schema-form ivu-table-wrapper">
            <div class="ivu-table ivu-table-border">
                <div class="ivu-table-body"> -->
                    <Table :columns="columns10" :data="flowzList"></Table>
                    <!-- <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Name</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell"><span>Notes</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Action</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="ivu-table-tbody">
                            <template v-if="flowzList.length > 0">
                            <tr class="ivu-table-row" v-for="(item, index) in flowzList">
                                <td>
                                <div class="ivu-table-cell">
                                 {{columns10}}
                                </div>
                                </td>
                                <td>
                                <div class="ivu-table-cell">
                                    {{item.ProcessName}}
                                </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                        {{item.notes}}
                                    </div>
                                </td>
                                <td>
                                    <div class="ivu-table-cell">
                                    <a @click="createNewInstance(index, item.id)" style="margin-right:8px"><Icon type="arrow-right-b" size="21" color="#2411c5"></Icon></a>
                                    <a style="margin-right:8px"><router-link :to="{name: 'flow/edit', params: {id: item.id}}"><Icon type="edit" size="17"></Icon></router-link></a>
                                    <a @click="deleteFlow(item.id)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                    <a @click="deleteFlow(item.id)"><Icon type="navicon-round" size="20"></Icon></a>
                                    </div>
                                </td>
                            </tr>
                            </template>
                            <template v-else>
                              <tr class="ivu-table-row">
                                <td colspan="3">
                                  <div class="ivu-table-cell" align="center">
                                    No record found
                                  </div>
                                </td>
                              </tr>
                            </template>
                        </tbody>
                    </table> -->
                <!-- </div>
            </div>
        </div> -->
    <!-- </div> -->
  </div>
</template>
<script>
import flowz from '@/api/flowz'
import _ from 'lodash'
const X2JS = require('x2js')
import schemamappingModel from '@/api/schemamapping'
import schemaModel from '@/api/schema'
import approvalModel from '@/api/approval'
import instanceModel from '@/api/flowzinstance'
import expandRow from './table-expand.vue'
export default {
  name: 'Flowz',
  components: { expandRow },
  data () {
    return {
      flowzList: [],
      columns10: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'Name',
          key: 'ProcessName'
        },
        {
          title: 'Notes',
          key: 'notes'
        },
        {
          title: 'Action',
          key: 'action',
          width: 400,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'arrow-right-b'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#2411c5'
                },
                on: {
                  click: () => {
                    this.createNewInstance(params.index, this.flowzList[params.index].id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'edit'
                },
                style: {
                  color: '#7DE144',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    this.$router.push('flow/edit/' + this.flowzList[params.index].id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'android-delete'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#e74c3c'
                },
                on: {
                  click: () => {
                    this.deleteFlow(this.flowzList[params.index].id)
                  }
                }
              }, '')
              // h('Button', {
              //   props: {
              //     type: 'text',
              //     size: 'large',
              //     icon: 'navicon-round'
              //   },
              //   style: {
              //     marginRight: '3px',
              //     padding: '0px',
              //     fontSize: '20px',
              //     color: '#00C851'
              //   },
              //   on: {
              //     click: () => {
              //       this.deleteFlow(this.flowzList[params.index].id)
              //     }
              //   }
              // }, '')
            ])
          }
        }
      ]
    }
  },
  mounted () {
    flowz.get()
    .then(response => {
      this.flowzList = response.data.data
      // console.log('this.flowzList', this.flowzList)
    })
    .catch(error => {
      console.log(error)
    })
  },
  methods: {
    async createNewInstance (index, id) {
      let generatedJson = await this.generateJson(this.flowzList[index].xml)
      // console.log('generatedJson', JSON.stringify(generatedJson))
      // console.log('generatedJson', generatedJson)
      generatedJson.fid = id
      generatedJson.createdOn = Date()
      instanceModel.post(generatedJson)
      .then(response => {
        // console.log('response.data', response.data)
        this.$router.push('/flow/instance/' + response.data.id)
      })
      .catch(error => {
        console.log(error)
      })
    },
    addNewFlow () {
      this.$store.dispatch('removeXMLtoLocalStorage')
      this.$router.push('/flow/new')
    },
    deleteFlow (id, inx) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          flowz.delete(id)
          .then(response => {
            this.$Notice.success({title: 'Success!!', desc: 'Flowz Deleted...'})
            this.flowzList.splice(inx, 1)
          })
          .catch(error => {
            this.$Notice.error({title: 'Error!!', desc: 'Flowz Not Deleted...'})
            console.log(error)
          })
        },
        onCancel: () => {
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
        var mergeModules = _.chain(jsonXML).filter((m) => {
          return typeof m === 'object'
        })
        .map((m) => {
          return _.isArray(m) ? m : [m]
        })
        .value()
        // generate process
        let result = await _.chain(_.union(...mergeModules))
        .filter((f) => {
          return f._id === d.id
        })
        .map(async (m) => {
          let _mapping = await self.getMapping(m, mergeModules)
          return {
            id: m._id,
            capacity: false,
            name: m._name,
            type: m.outgoing ? (m._name === 'recruiter' ? 'select' : 'task') : 'end',
            target: m.outgoing ? self.getTargetId(m, jsonXML) : [],
            mapping: (_.union(..._mapping)),
            inputProperty: await self.getProperties(m),
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
          capacity: false,
          name: m._name,
          type: 'start',
          target: self.getTargetId(m, process),
          mapping: [],
          inputProperty: await self.getProperties(m),
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
    async getProperties (proccess) {
      if (proccess.extensionElements && proccess.extensionElements.myProperty) {
        if (!_.isArray(proccess.extensionElements.myProperty.property)) {
          proccess.extensionElements.myProperty.property = [proccess.extensionElements.myProperty.property]
        }
        return await Promise.all(_.map(proccess.extensionElements.myProperty.property, async (m) => {
          return {
            id: m._id,
            entityschema: await schemaModel.getAll(m._entityschema),
            approvalClass: m._approvalClass !== undefined && m._approvalClass !== '0' ? await approvalModel.get(m._approvalClass).then(content => {
              return content.data
            }) : undefined,
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
            approvalClass: m._approvalClass !== undefined && m._approvalClass !== '0' ? await approvalModel.get(m._approvalClass).then(content => {
              return content.data
            }) : undefined,
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
  }
}
</script>