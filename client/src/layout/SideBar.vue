<template>
  <div style="width: inherit;">
    <div  style="background: rgb(54, 62, 79); height: 100%; position: fixed;width: inherit;">
      <Row style="padding: 16.3px 10px;border-bottom: 1px solid #15171b;">
        <Col :span="20" :offset="2">
          <Col :span="3">
            <Row type="flex" justify="start" align="middle">
              <a @click="$store.state.sidenavtoggle = !$store.state.sidenavtoggle">
                <Icon type="navicon-round" :size="24"></Icon>
              </a>
            </Row>
          </Col>
          <Col :span="21">
            <Row type="flex" justify="end" align="middle">
              <Tooltip :content="pinNvaigationContent" placement="left">
                <div :style="stylesPin">
                  <a @click="$store.state.sidenavpin = !$store.state.sidenavpin">
                    <Icon type="pin" :size="24" ></Icon>
                  </a>
                </div>
              </Tooltip>
            </Row>
          </Col>
        </Col>
      </Row>
      <Row style="padding: 10px;">
        <Col span="12">
          <!-- <Dropdown trigger="click" @on-click='handleCommand' style="margin-left: 20px;">
            <a href="javascript:void(0)" class="list">Sort By
                <Icon type="arrow-down-b"></Icon>
            </a>
            <DropdownMenu slot="list">
                <DropdownItem name="asc">A-Za-z</DropdownItem>
                <DropdownItem name="desc">z-aZ-A</DropdownItem>
            </DropdownMenu>
          </Dropdown> -->
          <Select @on-change="handleCommand" placeholder="Sort By" size="small" style="width:200px;margin-left: 20px;">
            <!-- <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option> -->
            <Option value="asc"><span>A-Za-z</span>
              <span style="float:right;">Ascending</span>
            </Option>
            <Option value="desc"><span>z-aZ-A</span>
              <span style="float:right;">Descending</span>
            </Option>
        </Select>

        </Col>
        <Col span="12">
          <Row type="flex" justify="end" align="middle">
            <Col>
            <!--   <router-link to="/schema/new"> -->
                <Button type="default" size="small" icon="plus-round" @click="addNewFlow">Add</Button>
              <!-- </router-link> -->
            </Col>
          </Row>
        </Col>
      </Row>
      <Menu theme="dark" width="auto" style="overflow: auto;height: calc(100% - 104px);">
        <template v-if="loading" align="center">
          <div class="demo-spin-col">
            <Spin size="large">
              <div class="loader">
                <icon type="load-c" size=18 class="demo-spin-icon-load"></icon>
              </div>
            </Spin>
          </div>
        </template>
        <Menu-item :name="index" v-for="(item, index) in flowz" :key="index">
              <img :src="rethink" class="schema-icon">
              <!-- <img v-else-if="item.iconpath === 'rethink'" :src="rethink" class="schema-icon">
              <img v-else-if="item.iconpath === 'elastic'" :src="elastic" class="schema-icon">
              <img v-else-if="item.iconpath === 'nedb'" :src="nedb" class="schema-icon">
              <img v-else :src="item.iconpath" class="schema-icon"> -->
              <span>
                {{item.ProcessName}}
              </span>
              <div class="menu-action-icon">
                <Tooltip content="Create instance" placement="top">
                  <a @click="createNewInstance(index, item.id)" style="margin-right:8px">
                    <Icon type="arrow-right-b" size="21" color="#003399"></Icon>
                  </a>
                 <!--  <router-link :to="{name: 'schema/edit', params: {id: item._id}}" exact>
                      <Icon type="ios-compose-outline" class="ficon edit"></Icon>
                  </router-link> -->
                </Tooltip>
                <Tooltip content="Edit" placement="top">
                  <a style="margin-right:8px">
                    <router-link :to="{name: 'flow/edit', params: {id: item.id}}">
                    <Icon type="edit" size="17" color="#00cc00"></Icon>
                    </router-link>
                  </a>
                  <!-- <router-link :to="{name: 'schema/mapping/list', params: {id: item._id}}">
                    <Icon type="arrow-swap" class="ficon transform"></Icon>
                  </router-link> -->
                </Tooltip>
                <Tooltip content="Delete" placement="top">
                <a @click="deleteFlow(item.id)">
                  <Icon type="android-delete" size="20" color="#e74c3c"></Icon>
                </a>
                 <!--  <a @click="handleRemove(index)">
                    <Icon type="android-delete" class="ficon delete"></Icon>
                  </a> -->
                </Tooltip>
              </div>
        </Menu-item>
      </Menu>
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
  import api from '../api'
  const X2JS = require('x2js')
  import schemaModel from '@/api/schema'
  import schemamappingModel from '@/api/schemamapping'
  // import approvalModel from '@/api/approval'
  import instanceModel from '@/api/flowzinstance'
  import mongo from '../assets/images/mongo.png'
  import rethink from '../assets/images/rethink.png'
  import elastic from '../assets/images/elasticsearch.png'
  import nedb from '../assets/images/nedb.png'
  import flowz from '@/api/flowz'
  const _ = require('lodash')
  export default {
    data () {
      return {
        orderby: 'asc',
        flowzList: [],
        mongo,
        rethink,
        elastic,
        nedb,
        deleteSchemaValue: 'softdel',
        loading: true
      }
    },
    created () {
      // this.$store.dispatch('getSchema')
      // this.$store.dispatch('getSettings')
      this.$store.dispatch('getFlowzdata')
    },
    computed: {
      // schema () {
      //   // console.log('allSchema from sidebar computed', this.$store.getters.allSchema, this.$store.getters.allSettings)
      //   var _data = this.$store.getters.allSchema
      //   var _settings = this.$store.getters.allSettings
      //   if (_data.length > 0) {
      //     _.map(_data, function (obj) {
      //       // console.log('obj', obj)
      //         _.forEach(_settings[obj.database[0]], function(res, i){
      //           var instance = _.find(res, {id: obj.database[1]})

      //             if (instance.upldIcn === '') {
      //               obj.iconpath = obj.database[0]
      //             } else {
      //               obj.iconpath = instance.upldIcn
      //             }
      //         })
      //     })
      //     console.log(_data)
      //     return _.orderBy(_data, [checkcase => checkcase.title.toLowerCase()], [this.orderby])
      //   } else {
      //     return []
      //   }
      // },
      flowz () {
        var _flowz = this.$store.getters.flowzData
        this.flowzList = _flowz
        if(_flowz.length > 0) {
          console.log('flowz data', _flowz)
          this.loading = false
          return _.orderBy(_flowz, [checkcase => checkcase.ProcessName.toLowerCase()], [this.orderby])
        } else {
          this.loading = false
          return []
        }
      },
      stylesPin () {
        let style = {}
        if (this.$store.state.sidenavpin) {
          style.transform = 'rotate(90deg)'
        }
        return style
      },
      pinNvaigationContent () {
        return !this.$store.state.sidenavpin ? 'Pin nvaigation' : 'Unpin nvaigation'
      }
    },
    methods: {
      addNewFlow () {
        this.$store.dispatch('removeXMLtoLocalStorage')
        this.$router.push('/admin/flow/new')
      },
      handleRemove (index) {
        this.$Modal.confirm({
          title: 'Confirm, Are you sure you want to delete?',
          // content: '<p>Are you sure you want to delete?</p>',
          width: 500,
          render: (h, params) => {
              return h('RadioGroup', {
                  props: {
                    vertical: true,
                    value: this.deleteSchemaValue,
                    size: 'large'
                  },
                  style: {
                    paddingTop: '20px'
                  },
                  on: {
                    'on-change': (value) => {
                      this.deleteSchemaValue = value
                      console.log('this.deleteSchemaValue', this.deleteSchemaValue)
                      // console.log(this.mongoDt[params.index].isenable);
                    }
                  }
              }, [
                h('Radio', {
                  props: {
                    size: 'large',
                    label: 'harddel'
                  }
                }, 'Delete Schema Permanently?? (With all instance Data)'),
                h('Radio', {
                  props: {
                    size: 'large',
                    label: 'softdel'
                  }
                }, 'Delete Schema Temporary? (Without instance Data)')
              ])
          },
          onOk: () => {
            if(this.deleteSchemaValue == 'softdel') {
              // alert(this.deleteSchemaValue)
              api.request('delete', '/schema/' + this.schema[index]._id+'?type='+this.deleteSchemaValue)
                .then(response => {
                  this.$Notice.success({title: 'Success!!', desc:'Schema Deleted...'});
                  this.$store.dispatch('getSchema')
                  // this.schema = response.data
                  // console.log(response.data)
                  // this.schema.splice(index, 1)
                })
                .catch(error => {
                  this.$Notice.error({title: 'Error!!', desc:'Schema Not Deleted...'});
                  console.log(error)
                })
            }
            else if(this.deleteSchemaValue == 'harddel') {
              // alert(this.deleteSchemaValue)
              api.request('delete', '/schema/' + this.schema[index]._id+'?type='+this.deleteSchemaValue)
                .then(response => {
                  // this.schema = response.data
                  // this.schema.splice(index, 1)
                })
                .catch(error => {
                  console.log(error)
                })
            }
            else {
              this.$Message.error('Error!!');
            }
            // api.request('delete', '/schema/' + this.schema[index]._id)
            // .then(response => {
            //   // this.schema = response.data
            //   this.schema.splice(index, 1)
            // })
            // .catch(error => {
            //   console.log(error)
            // })
            // this.formSchema.entity.splice(index, 1)
          },
          onCancel: () => {
            this.deleteSchemaValue = 'softdel'
          }
        })
      },
      // setData (name, url, id) {
      //   var obj = {name: name, url: url, id: id}
      //   var self = this
      //   var flag = 0
      //   // console.log(obj)
      //   // console.log(this.$store.state.tabdata.length)
      //   this.$store.state.tabdata.forEach(function (result, i) {
      //     if (result.id === id) {
      //       flag = 1
      //       self.$store.state.activetab = i
      //       self.$router.push(result.url)
      //     }
      //   })
      //   if (flag === 0) {
      //     this.$store.dispatch('getTabdata', obj)
      //     this.$store.state.activetab = this.$store.state.tabdata.length - 1
      //     this.$router.push(url)
      //   }
      // },
      handleCommand (name) {
        this.orderby = name
      },
      async createNewInstance (index, id) {
        let generatedJson = await this.generateJson(this.flowzList[index].xml)
        generatedJson.fid = id
        instanceModel.post(generatedJson)
        .then(response => {
          // console.log('response.data', response.data)
          this.$router.push('/admin/flow/instance/' + response.data.id)
        })
        .catch(error => {
          console.log(error)
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
              capacity: 1,
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
          capacity: 1,
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
            id: m._targetRef
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
    }
  }
</script>

<style>
  .menu-item {
    background-color: #2b4c77;
  }
  .ficon {
    font-size: 16px;
  }
  .play {
    color:#00C851;
  }
  .list {
    color:#ffbb33;
  }
  .edit {
    color:#2BBBAD;
    font-weight:800;
  }
  .delete {
    color: #CC0000;
  }
  .transform {
    color: #00C851;
  }
  .el-dropdown-menu__item {
    text-align: center;
  }
 /* .ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title{
    position: initial;
  }*/
  .schema-icon {
    width: 16px;
    height: 16px;
    margin-right:5px;
  }
  .menu-action-icon {
    float: right;
    display: none;
  }
  .menu-action-icon > div {
    margin-right:2px;
  }
  .ivu-menu-item:hover .menu-action-icon{
    display: block;
  }
  .ivu-select-dropdown {
    z-index: 905;
  }
  .demo-spin-col{
    height: auto;
    margin-top: 10px;
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
</style>
