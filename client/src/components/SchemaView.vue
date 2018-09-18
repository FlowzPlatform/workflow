<template>
  <div class="SchemaView">
  	<div class="container-fluid" v-if="isFlowzLoaded === true">
      <div>
        <div v-if="itsFirstState === true">
          <!-- <list-instances :flowzData="flowzData" :instanceEntries="instanceEntries" v-on:setValues="setValues"></list-instances> -->
          <div>
            <div class="row">
              <div class="col-md-12" id="top">
                <div class="row" style="margin-top: 15px;">
                  <div class="col-md-12">
                    <div class="ui-card">
                      <h3 class="formTitle">{{flowzData.name}}
                        <!-- <span style="font-size:12px">&nbsp;&nbsp;({{item.id}})</span> -->
                      </h3>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12">
                    <schemasubform :schemainstance="formSchemaInstance"></schemasubform>
                    <!-- <i-button type="dashed" class="btnAdd" long @click="handleAdd" icon="plus-round">Add</i-button> -->
                    <div v-if="isMultiple">
                    <div class="row" style="margin-top: 15px;">
                      <div class="col-md-12">
                        <div class="ui-card">
                          <!-- <h3 class="formTitle">{{formTitle}}<span style="font-size:12px">&nbsp;&nbsp;({{item.id}})</span></h3> -->
                          <Row>
                            <Col :span="4">
                              <b class="field-label">Target</b>
                            </Col>
                            <Col :span="20">
                              <Select v-model="nextTarget.value" placeholder="Choose Target">
                                <Option v-for="dpd in nextTarget.options" :value="dpd.value" :key="dpd.value">{{ dpd.label }}</Option>
                              </Select>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div style="padding: 5px 0 5px 0">
                        <Button type="primary" @click="handleSubmit('formSchemaInstance')" :loading="bLoading">{{ savebutton }}</Button>
                        <!-- <Button @click="handleReset('formSchemaInstance')" style="margin-left: 10px">Reset</Button> -->
                    </div>

                    <div v-if="validErr.length != 0" style="color: #a94442;background-color: #f2dede;border:1px solid #ebccd1;padding: 5px">
                        <div v-for="item in validErr">
                            <!-- <i-icon type="record" style="font-size:10px"></i-icon> -->
                            <i class="fa fa-exclamation-triangle"></i>
                            {{item.name}} -- {{item.errmsg}}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-1 fixed-div">
                <strong>Jump To:</strong>
                <ul class="jumper-links">
                  <a href="#top" class="btn btn-info btn-block btnJumperLink"><li>Top</li></a>
                  <a :href="'#' + item" v-for="item in jumperLinks" class="btn btn-info btn-block btnJumperLink"><li>{{item}}</li></a>
                </ul>
              </div> -->
            </div>
          </div>
        </div>

        <div v-if="instanceEntries.length === 0">
          <p align="center">No Data</p>
        </div>
        
        <div v-if="itsFirstState === false && instanceEntries.length !== 0">
          <tabs> 
            <TabPane v-if="this.$store.state.role === 1" :label="dataCount" icon="lock-combination">
          <schemalist v-if="this.$store.state.role === 1" :schema="dataSchema" :pageno="pageno" :datashow="'dataA'" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotal" :data="dataData" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>
          <schemalist v-if="this.$store.state.role === 2" :schema="dataSchema" :pageno="pageno" :datashow="'dataU'" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotal" :data="dataData2" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>

          <div style="padding: 10px">
            <div class="row" v-if="id != null">
              <div class="col-md-12" id="top">
                <div class="row" style="margin-top: 15px;">
                  <div class="col-md-12">
                    <div class="ui-card">
                      <h3 class="formTitle">{{formTitle}}<span style="font-size:12px">&nbsp;&nbsp;({{item.id}})</span></h3>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12">
                    <schemasubform v-on:upadteJumperList="updateJumperList" :schemainstance="formSchemaInstance"></schemasubform>
                    <div v-if="isMultiple">
                    <div class="row" style="margin-top: 15px;">
                      <div class="col-md-12">
                        <div class="ui-card">
                          <Row>
                            <Col :span="4">
                              <b class="field-label">Target</b>
                            </Col>
                            <Col :span="20">
                              <Select v-model="nextTarget.value" placeholder="Choose Target">
                                <Option v-for="dpd in nextTarget.options" :value="dpd.value" :key="dpd.value">{{ dpd.label }}</Option>
                              </Select>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </div>
                    </div>
                    <div style="padding: 5px 0 5px 0">
                        <Button type="primary" @click="handleSubmit('formSchemaInstance')" :loading="bLoading">{{ savebutton }}</Button>
                    </div>

                    <div v-if="validErr.length != 0" style="color: #a94442;background-color: #f2dede;border:1px solid #ebccd1;padding: 5px">
                        <div v-for="item in validErr">
                            <i class="fa fa-exclamation-triangle"></i>
                            {{item.name}} -- {{item.errmsg}}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-1 fixed-div">
                <strong>Jump To:</strong>
                <ul class="jumper-links">
                  <a href="#top" class="btn btn-info btn-block btnJumperLink"><li>Top</li></a>
                  <a :href="'#' + item" v-for="item in jumperLinks" class="btn btn-info btn-block btnJumperLink"><li>{{item}}</li></a>
                </ul>
              </div> -->
            </div>
          </div>
          </tabPane>
          <TabPane v-if="this.$store.state.role === 2" :label="'Claim ('+ dataClaim.length + ')'" icon="lock-combination">
          <schemalist :schema="dataSchema" :datashow="'dataC'" :pageno="pageno" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotal" :data="dataClaim" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>
        </TabPane>
          </Tabs>
        </div>
      </div>

      <!-- <mycustom></mycustom> -->
      <Spin size="large" fix v-if="dataLoading"></Spin>

		</div>

		<!-- <template id="dynamicinput">
			<div>
				<i-input v-if="type == 'text' || type == 'email' || type == 'phone'" v-model="modelName" type="text" :placeholder="placeholder" :min="min"></i-input>
			  <input-number v-if="type == 'number'" :min="min" :max="max" v-model="modelName" :type="type" :placeholder="placeholder"></input-number>
			  <date-picker v-if="type == 'date'" type="date" v-model="modelName" :placeholder="placeholder"></date-picker>
			  <i-select v-if="type == 'dropdown'" v-model="modelName" :placeholder="placeholder">
			      <i-option v-for="dpd in options" :value="dpd" :key="dpd">{{ dpd }}</i-option>
			  </i-select>
			  <i-checkbox v-if="type == 'boolean'" v-model="modelName">{{field.name}}</i-checkbox>
			</div>
		</template> -->
    <!-- <Spin v-if="loadingEmail"></Spin> -->
    <div>
      <Spin v-if="loadEmail" size="large" fix></Spin>
      <div v-if="schemabinding">
      <schemasubformview ref="schemasubformview" :schemainstance="formSchemaInstance" id="schemasubformview"></schemasubformview>
    </div>
    <div v-if="email">
      <email :btnArr="btnArr" :flag="flag" :emailSchemaId="emailSchemaId" :sendDataEmail="sendDataEmail" :iid="item.id" v-on:on-done="emailService"></email>
    </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
// import axios from 'axios'
import $ from 'jquery'

import ListInstances from './ListInstances'
import SchemaSubForm from './SchemaSubForm'
import SchemaSubFormView from './SchemaSubFormView'
import email from './email'

import flowzdataModal from '@/api/flowzdata'
import flowzModel from '@/api/flowz'

import schemalist from '@/pages/user/SchemaList'
import schemaModel from '@/api/schema'

import finstanceModal from '@/api/finstance'
import dataQuerymodel from '@/api/dataquery'
import saveemailTemplate from '@/api/emailtemplate'
// const deepstream = require('deepstream.io-client-js')

// const DeepRecord = require('@/assets/js/deepstream/deepRecord')

// import _ form 'lodash'

// const client = deepstream('ws://204.48.26.167:6020').login()
// let instanceId = '39c53741_ec14_4ceb_a9db_97d7066cd424'
// let instanceListName = instanceId + 'List'
// let instanceName = 'NewWork247'
// let instanceList = client.record.getList(instanceListName)

// console.log('Data: ', instanceName, instanceList)

export default {
  name: 'SchemaView',
  props: {
    options: {
      type: Object
    }
  },
  data () {
    return {
      check: 0,
      dataClaim: [],
      loadEmail: false,
      skip: 0,
      limit: 10,
      dataTotal: 0,
      pageno: 1,
      isFlowzLoaded: false,
      htmlcontent: false,
      schemabinding: false,
      flowzData: null,
      email: false,
      loading: false,
      formSchemaInstance: {
        data: [],
        entity: []
      },
      flag: true,
      emailSchemaId: '',
      btnArr: {},
      schema: {},
      dataSchema: {},
      dataData: [],
      dataData2: [],
      entity: [],
      savebutton: 'Save',
      validFlag: true,
      validErr: [],
      id: null,
      item: null,
      nextState: null,
      currentState: null,
      instanceid: null,
      processid: null,
      lastLog: null,
      formTitle: null,
      jumperLinks: [],
      flowData: null,
      bLoading: false,
      isMultiple: false,
      nextTarget: {
        value: '',
        options: []
      },
      configuration: true,
      dynamicData: true,
      instanceEntries: [],
      isEmailDone: false,
      itsFirstState: true,
      sendDataEmail: null,
      loadingEmail: true,
      currentSchema: null,
      dataLoading: true
    }
  },
  components: {
    'list-instances': ListInstances,
    'schemasubform': SchemaSubForm,
    'schemalist': schemalist,
    'email': email,
    'schemasubformview': SchemaSubFormView
  },
  methods: {
    searchData (query) {
      this.dataLoading = true
      dataQuerymodel.get(null, {
        $last: true,
        fid: this.$route.params.id,
        currentStatus: this.$route.params.stateid,
        $skip: this.skip,
        $limit: this.limit,
        'id[$search]': '^' + query.text
      }).then(res => {
        this.isFlowzLoaded = true
        let firstState = this.flowzData.first
        if (firstState === this.$route.params.stateid) {
          this.itsFirstState = true
        } else {
          this.itsFirstState = false
        }
        this.dataTotal = res.data.total
        if (res.data.data.length > 0) {
          this.instanceEntries = res.data.data
          // let currentStateP = this.flowzData.processList[currentStageP]
          // if (currentStateP.hasOwnProperty('permission')) {
          //   this.formSchemaInstance.permission = []
          //   this.formSchemaInstance.permission = currentStateP.permission
          // }
          console.log('this.instanceEntries', this.instanceEntries)
          this.dataData = this.instanceEntries
          this.$Loading.finish()
          this.dataLoading = false
        } else {
          this.instanceEntries = []
          this.dataData = []
          this.itsFirstState = true
          this.dataLoading = false
          // this.$Spin.hide()
          this.$Loading.finish()
        }
      }).catch(err => {
        console.log('Error: ', err)
      })
    },
    sortData (object) {
    },
    emailService (item) {
      this.isEmailDone = true
      this.handleSubmit('formSchemaInstance')
    },
    pagination (skip, limit, page) {
      this.skip = skip
      this.limit = limit
      this.pageno = page
      this.init()
    },
    handlepage (skip, limit, size) {
      this.limit = size
      this.skip = 0
      this.init()
    },
    info (item, index, button) {
      this.modalInfo.title = `Row index: ${index}`
      this.modalInfo.content = JSON.stringify(item, null, 2)
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },
    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    async getChildData (id) {
      // alert(id)
      var arrObj = []
      var self = this
      schemaModel.get(id)
      .then(async (response) => {
        // var _res = this.currentSchema
        var _res = response.data
        var obj = {}

        // console.log("res.entity: ", _res.entity)
        // obj.id = self.getGuid();
        // obj.database = _res.database
        // obj.Schemaid = _res._id
        for (let v of _res.entity) {
          if (v.customtype) {
            obj[v.name] = await self.getChildData(v.type)
          } else {
            if (v.type === 'number') {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                if (v.property.min !== 0 && v.property.min !== '') {
                  obj[v.name] = v.property.min
                } else {
                  obj[v.name] = 1
                }
              }
            } else if (v.type === 'currentuser') {
              obj[v.name] = this.$store.state.user.fullname || this.$store.state.user.email
            } else if (v.type === 'currenttime') {
              obj[v.name] = new Date()
            } else if (v.type === 'boolean') {
              if (v.property.defaultValue !== '' || v.property.defaultValue === 'true') {
                obj[v.name] = true
              } else {
                obj[v.name] = false
              }
            } else if (v.type === 'file') {
              obj[v.name] = []
            } else {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                obj[v.name] = ''
              }
            }
          }
        }
        arrObj.push(obj)
      })
      .catch(error => {
        console.log('Error', error)
      })
      return arrObj
    },

    async getChildEntity (id) {
      var self = this
      var res = []
      // var _res = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
      let _res = await schemaModel.get(id).catch(err => {
        console.log('err', err)
      })
      for (let [index, entity] of _res.data.entity.entries()) {
        if (entity.customtype) {
          _res.data.entity[index]['entity'] = await self.getChildEntity(entity.type)
        }
      }
      res.push(_res.data)
      return res
    },

    async fetch (id, arr) {
      this.$Loading.start()
      const self = this
      // const result = await Schema.getAll(id)
      // var response = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
      // console.log('...........', id)
      // let response = currentSchema
      // console.log('response', response)
      // this.formTitle = response.data.title
      // if (this.lastLog === undefined) {
      this.formSchemaInstance.data = []
      // } else {
      //   if (this.lastLog.input.length === 0) {
      //     this.formSchemaInstance.data = []
      //   } else {
      //     // alert(1)
      //     this.formSchemaInstance.data = this.lastLog.input
      //   }
      // }
      this.schema = this.currentSchema
      this.entity = this.currentSchema.entity
      let currentStageP = this.$route.params.stateid
      let currentStateP = this.flowzData.processList[currentStageP]
      if (currentStateP.hasOwnProperty('permission')) {
        this.formSchemaInstance.permission = []
        this.formSchemaInstance.permission = currentStateP.permission
      }
      // console.log('this.formData.processList', currentStageP)

      this.formSchemaInstance.entity = this.schema.entity
      // this.formSchemaInstance.data[0] = {}
      for (let [index, entity] of self.formSchemaInstance.entity.entries()) {
        if (entity.customtype === true) {
          // console.log('Entity: ', entity)
          self.formSchemaInstance.entity[index]['entity'] = await self.getChildEntity(entity.type)
        }
        // else {
      //     if (self.lastLog && self.lastLog.input.length > 0 && self.lastLog.input[0][entity.name]) {
      //       self.formSchemaInstance.data[0][entity.name] = self.lastLog.input[0][entity.name]
      //       self.formSchemaInstance.entity[index]['isDisabled'] = true
      //     } else {
      //       self.formSchemaInstance.entity[index]['isDisabled'] = false
      //     }
      //   }
      }
      if (arr) {
        // console.log('_________________arr ', arr)
        let m = [arr]
        this.formSchemaInstance.data = m
      } else {
        this.handleAdd()
      }
      // if (self.formSchemaInstance.data[0].length === 0) {
      // if (this.lastLog !== undefined && this.lastLog.input.length !== 0) {
      //   for (let mdata of self.lastLog.input) {
      //     for (let ent of self.schema.entity) {
      //       if (ent.type === 'file') {
      //         mdata[ent.name + 'List'] = mdata[ent.name]
      //         mdata[ent.name] = []
      //       } else if (ent.customtype) {
      //         mdata[ent.name] = self.setFileList(mdata[ent.name], ent.entity[0])
      //       }
      //     }
      //   }
      //   self.formSchemaInstance.data = _.map(self.lastLog.input, (entry) => {
      //     entry.Schemaid = self.schema.id
      //     return _.chain(entry).omit(['id', '_id']).reduce((result, value, key) => {
      //       // if (_.isArray(value)) {
      //       //   result[key] = self.deleteId(value)
      //       // } else {
      //       result[key] = value
      //       // }
      //       return result
      //     }, {}).value()
      //   })
      //   // _.forEach(self.lastLog.input, (obj) => {
      //   //   // obj = this.lastLog.input[0]
      //   //   // obj.database = this.schema.database
      //   //   obj.Schemaid = self.schema.id
      //   //   delete obj.id
      //   //   delete obj._id
      //   //   self.formSchemaInstance.data.push(obj)
      //   // })
      // } else {
      // setTimeout(async ()=>{
      // await this.handleAdd()

      this.$Loading.finish()
      // setTimeout(() => {
      //   $('html, body').animate({
      //     scrollTop: $('#top').offset().top
      //   }, 500)
      // }, 0)

      // },4000)
      // }
      // }
    },

    deleteId (obj) {
      let self = this
      return _.map(obj, (entry) => {
        entry.Schemaid = self.schema.id
        return _.chain(entry).omit(['id', '_id']).reduce((result, value, key) => {
          if (_.isArray(value)) {
            result[key] = self.deleteId(value)
          } else {
            result[key] = value
          }
          return result
        }, {}).value()
      })
    },

    setFileList (mdata, entity) {
      for (let sdata of mdata) {
        for (let ent of entity.entity) {
          if (ent.type === 'file') {
            sdata[ent.name + 'List'] = sdata[ent.name]
            sdata[ent.name] = []
          } else if (ent.customtype) {
            sdata[ent.name] = this.setFileList(sdata[ent.name], ent.entity[0])
          }
        }
      }
      return mdata
    },

    async handleAdd () {
      try {
        var self = this
        var obj = {}
        obj.Schemaid = this.schema.id
        for (let v of self.entity) {
          if (v.customtype) {
            obj[v.name] = await self.getChildData(v.type)
          } else {
            if (v.type === 'number') {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                if (v.property.min !== 0 && v.property.min !== '') {
                  obj[v.name] = v.property.min
                } else {
                  obj[v.name] = 1
                }
              }
            } else if (v.type === 'currentuser') {
              obj[v.name] = this.$store.state.user.fullname || this.$store.state.user.email
            } else if (v.type === 'currenttime') {
              obj[v.name] = new Date()
            } else if (v.type === 'boolean') {
              if (v.property.defaultValue !== '' || v.property.defaultValue === 'true') {
                obj[v.name] = true
              } else {
                obj[v.name] = false
              }
            } else if (v.type === 'file') {
              obj[v.name] = []
            } else {
              if (v.property.defaultValue !== '') {
                obj[v.name] = v.property.defaultValue
              } else {
                obj[v.name] = ''
              }
            }
          }
        }
        this.formSchemaInstance.data.push(obj)
      } catch (e) {
        console.log('Error catched: ', e)
      }
    },

    makeObj () {
      const obj = this.schema
      obj.Schemaid = this.schema.id
      obj.data = this.formSchemaInstance.data
      return obj
    },

    mergeFileList (mdata, schema) {
      for (let sdata of mdata) {
        for (let ent of schema.entity) {
          if (ent.type === 'file') {
            if (sdata.hasOwnProperty(ent.name + 'List')) {
              for (let f of sdata[ent.name + 'List']) {
                sdata[ent.name].push(f)
              }
              delete sdata[ent.name + 'List']
            }
          } else if (ent.customtype) {
            sdata[ent.name] = this.mergeFileList(sdata[ent.name], ent.entity[0])
          }
        }
      }
      return mdata
    },

    createInstanceAndSave () {
      this.$Loading.start()
      let fheaders = null
      fheaders = {
        workflowid: 'workflow_' + this.flowzData.id,
        stateid: this.$route.params.stateid
      }

      let saveObj = {
        fid: this.$route.params.id,
        currentState: this.$route.params.stateid,
        data: this.formSchemaInstance.data
      }
      finstanceModal.post(saveObj, null, fheaders)
        .then(res => {
          this.$Loading.finish()
          this.$Notice.success({title: 'Saved Successfully'})
          setTimeout(() => {
            $('html, body').animate({
              scrollTop: $('#top').offset().top
            }, 500)
          }, 0)
          this.init()

        // this.$Notice.success({title: 'Instance Generated'})
        // let item = {
        //   fid: this.flowzData.id,
        //   iid: res.data.id,
        //   currentStatus: res.data.currentStatus
        // }
        // let values = {
        //   id: this.flowzData.schema,
        //   // item: item,
        //   formName: this.flowzData.name,
        //   currentState: this.flowzData.currentStatus,
        //   flowzData: this.flowzData,
        //   formData: null
        // }

        // this.validErr = []
        // this.email = false
        // this.schemabinding = false
        // this.nextTarget.value = ''
        // this.nextTarget.options = []
        // this.isMultiple = false
        // this.id = values.id
        // if (values.id !== null) {
        //   this.item = values.item
        //   this.formTitle = values.formName
        //   this.flowData = values.flowzData
        //   let targetObj = values.flowzData.processList[values.currentState]
        //   if (Object.keys(targetObj).length > 0) {
        //     if (targetObj.target.length > 1) {
        //       let opts = []
        //       for (let m of targetObj.target) {
        //         let label = values.flowzData.processList[m.id].name
        //         opts.push({
        //           label: label,
        //           value: m.id
        //         })
        //       }
        //       this.nextTarget.value = ''
        //       this.nextTarget.options = opts
        //       this.isMultiple = true
        //     }
        //   }
        //   // if (values.formData !== null, Object.keys(values.formData).length > 0) {
        //   // if (values.formData) {
        //   //   this.fetch(this.currentSchema.id, values.formData)
        //   // } else {
        //   //   this.fetch(this.currentSchema.id)
        //   // }
        // }

        // this.item = item
        // this.saveInstanceData()
        // this.$Loading.finish()
        }).catch(e => {
          this.$Loading.error()
          console.log('error', e)
          if (e.response.data.message) {
            this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
          } else {
            this.$Notice.error({title: 'Error', desc: 'Instace Not Generated'})
          }
        })
    },

    saveInstanceData () {
      let currentStateId = this.$route.params.stateid
      if (this.schema.hasOwnProperty('emailSchema')) {
        if (this.schema.emailSchema.action === true) {
          this.emailSchemaId = this.schema.emailSchema.schemaId
          this.flag = false
        }
      }
      let obj = this.makeObj()
      if (!this.isEmailDone) {
        let currentStageObject = this.flowData.processList[currentStateId]
        let nextTargetId
        if (this.isMultiple) {
          nextTargetId = this.flowData.processList[this.nextTarget.value]
        } else {
          nextTargetId = this.flowData.processList[currentStageObject.target[0].id]
        }
        if (nextTargetId.type === 'sendproofmail') {
          this.validFlag = true
          this.validErr = []
          let allcheck = []
          for (let dobj of obj.data) {
            let flag = this.checkValidation(dobj, this.entity)
            allcheck.push(flag)
          }
          this.check = _.indexOf(allcheck, false)
          if (this.check === -1) {
            this.loadEmail = true
            this.id = null
            this.schemabinding = true
            if (nextTargetId.hasOwnProperty('emailtemplate')) {
              saveemailTemplate.get(nextTargetId.emailtemplate)
              .then((res) => {
                setTimeout(() => {
                  this.sendDataEmail = res.data.template + this.$refs.schemasubformview.$el.outerHTML
                  this.email = true
                  this.loadEmail = false
                }, 1000)
              })
              .catch((err) => {
                setTimeout(() => {
                  this.sendDataEmail = this.$refs.schemasubformview.$el.outerHTML
                  this.email = true
                  this.loadEmail = false
                  console.log(err)
                }, 1000)
              })
            } else {
              setTimeout(() => {
                this.sendDataEmail = this.$refs.schemasubformview.$el.outerHTML
                this.email = true
                this.loadEmail = false
              }, 1000)
            }
            let flag = false
            if (nextTargetId.target.length > 1) {
              let arr = {}
              for (let index = 0; index < nextTargetId.target.length; index++) {
                let target = this.flowData.processList[nextTargetId.target[index].id]
                if (nextTargetId.target[index].hasOwnProperty('label')) {
                  arr[nextTargetId.target[index].label] = target.id
                  flag = true
                }
              }
              this.btnArr = arr
            } else {
              let arr = {}
              arr['approve'] = nextTargetId.target[0].id
              this.btnArr = arr
            }
            if (flag === false) {
              if (nextTargetId.target.length > 1) {
                let arr = {}
                for (let index = 0; index < nextTargetId.target.length; index++) {
                  let target = this.flowData.processList[nextTargetId.target[index].id]
                  arr[target.name] = target.id
                }
                this.btnArr = arr
              } else {
                let arr = {}
                arr['approve'] = nextTargetId.target[0].id
                this.btnArr = arr
              }
            }
          } else {
            this.validErr = _.uniqBy(this.validErr, 'name')
            this.$Notice.error({title: 'Validation Error!'})
          }
        } else {
          this.validFlag = true
          this.validErr = []
          let allcheck = []
          for (let dobj of obj.data) {
            let flag = this.checkValidation(dobj, this.entity)
            allcheck.push(flag)
          }
          this.check = _.indexOf(allcheck, false)
          if (this.check === -1) {
            this.saveDataMethod()
          } else {
            this.validErr = _.uniqBy(this.validErr, 'name')
            this.$Notice.error({title: 'Validation Error!'})
          }
        }
      } else {
        this.validFlag = true
        this.validErr = []
        let allcheck = []
        for (let dobj of obj.data) {
          let flag = this.checkValidation(dobj, this.entity)
          allcheck.push(flag)
        }
        this.check = _.indexOf(allcheck, false)
        if (this.check === -1) {
          this.saveDataMethod()
        } else {
          this.validErr = _.uniqBy(this.validErr, 'name')
          this.$Notice.error({title: 'Validation Error!'})
        }
      }
    },

    handleSubmit (name) {
      if (this.flowzData.first === this.$route.params.stateid) {
        this.createInstanceAndSave()
      } else {
        this.saveInstanceData()
      }
    },
    async saveDataMethod () {
      var obj = this.makeObj()
      // this.validFlag = true
      // this.validErr = []
      // let allcheck = []
      // for (let dobj of obj.data) {
      //   let flag = this.checkValidation(dobj, this.entity)
      //   allcheck.push(flag)
      // }
      // let check = _.indexOf(allcheck, false)
      this.$Loading.start()
      let mergeData = this.mergeFileList(obj.data, obj)
      obj.data = mergeData
        // let returnObj = await DeepRecord.deepRecord.instanceStageSubmit(client, this.item, obj.data[0])
      let saveObj = {
        fid: this.item.fid,
        iid: this.item.id,
        state: this.item.currentStatus,
        data: obj.data[0]
      }
      if (this.isMultiple) {
        saveObj.nextTarget = this.nextTarget.value
      }
      this.bLoading = true
        // this.bLoading = false
      flowzdataModal.post(saveObj).then(res => {
        this.id = null
        this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
        this.$Loading.finish()
        this.bLoading = false
        this.email = false
        this.validErr = []
        this.isEmailDone = false
      }).catch(err => {
        console.log('Error', err)
        this.$Loading.finish()
        this.bLoading = false
        this.email = false
        this.isEmailDone = false
        this.$Notice.error({title: 'Not Saved!'})
      })

        // let instanceObj = await DeepRecord.deepRecord.getRecordObject(client, this.item)
        // instanceObj.set('currentStatus', this.nextState)

        // axios.post('http://192.81.213.41:3033/eng/instance/', { data: obj.data })
        // .then(response => {
        //   this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
        //   this.$Loading.finish()
        // })
        // .catch(error => {
        //   console.log('Error', error)
        //   this.$Notice.error({title: 'Error!', desc: 'Instance not saved...'})
        //   this.$Loading.error()
        // })
    },
    checkValidation (data, ent) {
      var self = this
      // var flag = true
      for (let v of ent) {
        if (v.customtype) {
          for (let d of data[v.name]) {
            self.validFlag = self.checkValidation(d, v.entity[0].entity)
          }
        } else {
          if (!v.property.optional) {
            if (data[v.name] === '') {
              self.validErr.push({name: v.name, errmsg: 'Field is required.'})
              self.validFlag = false
            } else if (Array.isArray(data[v.name]) && data[v.name].length === 0) {
              self.validErr.push({name: v.name, errmsg: 'File is required.'})
              self.validFlag = false
            } else if (v.type === 'text') {
              if (v.property.regEx !== '') {
                var patt0 = v.property.regEx
                var res0 = patt0.test(data[v.name])
                if (!res0) {
                  self.validErr.push({name: v.name, errmsg: 'Invalid Email.'})
                  self.validFlag = false
                }
              } else if (v.property.max !== 0) {
                if (data[v.name].length > v.property.max) {
                  self.validErr.push({name: v.name, errmsg: 'max ' + v.property.max + ' characters allowed.'})
                  self.validFlag = false
                }
              } else if (v.property.allowedValue.length > 0) {
                let exist = _.indexOf(v.property.allowedValue, data[v.name])
                if (exist === -1) {
                  self.validErr.push({name: v.name, errmsg: 'Not Allowed Email, Please select allow one.'})
                  self.validFlag = false
                }
              }
            } else if (v.type === 'email' && data[v.name] !== '') {
              var patt1 = (v.property.regEx === '') ? new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$') : new RegExp(v.property.regEx)
              var res1 = patt1.test(data[v.name])
              if (!res1) {
                self.validErr.push({name: v.name, errmsg: 'Invalid Email.'})
                self.validFlag = false
              } else if (v.property.allowedValue.length > 0) {
                let exist = _.indexOf(v.property.allowedValue, data[v.name])
                if (exist === -1) {
                  self.validErr.push({name: v.name, errmsg: 'Not Allowed Email, Please select allow one.'})
                  self.validFlag = false
                }
              }
            } else if (v.type === 'phone') {
              var patt2 = (v.property.regEx === '') ? new RegExp('^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$') : new RegExp(v.property.regEx)
              var res2 = patt2.test(data[v.name])
              if (!res2) {
                self.validErr.push({name: v.name, errmsg: 'Invalid Phone.'})
                self.validFlag = false
              } else if (v.property.allowedValue.length > 0) {
                let exist = _.indexOf(v.property.allowedValue, data[v.name])
                if (exist === -1) {
                  self.validErr.push({name: v.name, errmsg: 'Not Allowed Phone, Please select allow one.'})
                  self.validFlag = false
                }
              }
            } else if (v.type === 'number') {
              if (v.property.allowedValue.length > 0) {
                let exist = _.indexOf(v.property.allowedValue, data[v.name])
                if (exist === -1) {
                  self.validErr.push({name: v.name, errmsg: 'Not Allowed Number, Please select allow one.'})
                  self.validFlag = false
                }
              }
            } else if (v.type === 'date') {
              if (v.property.mindate !== '' && v.property.maxdate !== '') {
                if (data[v.name] < v.property.mindate && data[v.name] > v.property.maxdate) {
                  self.validErr.push({name: v.name, errmsg: 'Date must in between ' + v.property.mindate + ' and ' + v.property.maxdate})
                  self.validFlag = false
                }
              } else if (v.property.mindate !== '') {
                if (data[v.name] < v.property.mindate) {
                  self.validErr.push({name: v.name, errmsg: 'Date must be greater than or equal ' + v.property.mindate + '.'})
                  self.validFlag = false
                }
              } else if (v.property.maxdate !== '') {
                if (data[v.name] > v.property.maxdate) {
                  self.validErr.push({name: v.name, errmsg: 'Date must be less than or equal ' + v.property.mindate + '.'})
                  self.validFlag = false
                }
              }
            }
          }
        }
      }
      return self.validFlag
    },

    handleReset (name) {
      // this.$refs[name].resetFields()
      this.fetch(this.$route.params.schemaid)
    },

    setValues (values) {
      this.validErr = []
      this.email = false
      this.schemabinding = false
      this.nextTarget.value = ''
      this.nextTarget.options = []
      this.isMultiple = false
      this.id = values.id
      if (values.id !== null) {
        this.item = values.item
        this.formTitle = values.formName
        this.flowData = values.flowzData
        let targetObj = values.flowzData.processList[values.currentState]
        if (Object.keys(targetObj).length > 0) {
          if (targetObj.target.length > 1) {
            let opts = []
            for (let m of targetObj.target) {
              let label = values.flowzData.processList[m.id].name
              opts.push({
                label: label,
                value: m.id
              })
            }
            this.nextTarget.value = ''
            this.nextTarget.options = opts
            this.isMultiple = true
          }
        }
        // if (values.formData !== null, Object.keys(values.formData).length > 0) {
        if (values.formData) {
          this.fetch(this.currentSchema.id, values.formData)
        } else {
          this.fetch(this.currentSchema.id)
        }
      }
      // let arr = [values.formData]
      // this.formSchemaInstance.data = arr[0]
      // this.nextState = values.nextState
      // this.currentState = values.currentState
    },

    getFData (item) {
      let returnData = null
      if (item) {
        let lastItem = _.last(item)
        if (lastItem.stageRecordId) {
          let stageRecordId = lastItem.stageRecordId
          flowzdataModal.get(null, {
            id: stageRecordId
          }).then((resData) => {
            returnData = resData.data[0].data
          }).catch((err) => {
            console.log('err: ', err)
          })
        }
      }
      return (returnData)
    },

    getFlowz () {
      return flowzModel.get(null, {
        id: this.$route.params.id
      })
      .then((res) => {
        return (res.data.data[0])
      }).catch(err => {
        console.log('Error: ', err)
        this.dataLoading = false
        return
      })
    },

    getSchema () {
      console.log('this.flowzData.schema', this.flowzData.schema)
      return schemaModel.getAll(this.flowzData.schema).then(res => {
        console.log(res)
        return res
      }).catch(err => {
        console.log('Error: ', err)
        this.dataLoading = false
        return
      })
    },

    populateTables (schema) {
      this.itsFirstState = false
      this.dataLoading = true
      let currentStageP = this.$route.params.stateid
      let currentStateP = this.flowzData.processList[currentStageP]
      this.dataSchema = this.currentSchema
      this.dataSchema.permission = {}
      this.dataSchema.permission = currentStateP.permission
      this.email = false
      this.htmlcontent = false
      this.id = null

      // let query = {
      //   fid: this.$route.params.id,
      //   currentStatus: this.$route.params.stateid,
      //   '$paginate': false
      // }

      // var settings = {
      //   'async': true,
      //   'url': 'https://api.flowzcluster.tk/eng/dataquery?$last=true&fid=' + this.$route.params.id + '&currentStatus=' + this.$route.params.stateid + '&$skip=0&$limit=10',
      //   'method': 'GET',
      // }

      // $.ajax(settings).done((queryresp) => {
      //   console.log('query response: ', queryresp)
      //   this.isFlowzLoaded = true
      //   let firstState = this.flowzData.first
      //   if (firstState === this.$route.params.stateid) {
      //     this.itsFirstState = true
      //   } else {
      //     this.itsFirstState = false
      //   }
      //   this.dataTotal = queryresp.data.total
      //   if (queryresp.data.length > 0) {
      //     this.instanceEntries = queryresp.data

      //     this.dataData = this.instanceEntries
      //     // this.$Spin.hide()
      //     this.$Loading.finish()
      //     this.dataLoading = false
      //   } else {
      //     this.instanceEntries = null
      //     this.dataData = []
      //     this.itsFirstState = true
      //     this.dataLoading = false
      //     // this.$Spin.hide()
      //     this.$Loading.finish()
      //   }
      // }).fail((err) => {
      //   console.error('Error: ', err)
      //   this.$Loading.error()
      //   this.dataLoading = false
      // });

      dataQuerymodel.get(null, {
        $last: true,
        fid: this.$route.params.id,
        currentStatus: this.$route.params.stateid,
        $skip: this.skip,
        $limit: this.limit
      }).then(queryresp => {
        this.isFlowzLoaded = true
        // let firstState = this.flowzData.first
        // if (firstState === this.$route.params.stateid) {
        //   this.itsFirstState = true
        // } else {
        //   this.itsFirstState = false
        // }
        this.dataTotal = queryresp.data.total
        if (queryresp.data.data.length > 0) {
          this.instanceEntries = queryresp.data.data
          if (this.$store.state.role === 2) {
            this.dataClaim = _.filter(this.instanceEntries, function (o) { return o.claimuser === '' })
            this.dataData2 = _.filter(this.instanceEntries, function (o) { return o.claimuser !== '' })
          } else {
            this.dataData = this.instanceEntries
          }
          // this.$Spin.hide()
          this.$Loading.finish()
          this.dataLoading = false
        } else {
          this.instanceEntries = []
          this.dataData = []
          // this.itsFirstState = true
          this.dataLoading = false
          // this.$Spin.hide()
          this.$Loading.finish()
        }
      }).catch(err => {
        console.error('Error: ', err)
        this.$Loading.error()
        this.dataLoading = false
      })
    },

    async init () {
      this.dataLoading = true
      this.instanceEntries = []
      this.isFlowzLoaded = false
      // this.itsFirstState = true
      this.$Loading.start()
      this.schemabinding = false
      this.email = false
      this.flowzData = await this.getFlowz()
      this.currentSchema = await this.getSchema()
      if (this.flowzData.first === this.$route.params.stateid) {
        this.itsFirstState = true
        await this.fetch(this.currentSchema.id)
        this.dataLoading = false
      } else {
        this.itsFirstState = false
        this.populateTables()
      }
      this.isFlowzLoaded = true
    },

    updateJumperList (objectArr) {
      this.jumperLinks = objectArr
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    dataCount () {
      if (this.$store.state.role === 2) {
        return 'Data (' + this.dataData2.length + ')'
      }
      if (this.$store.state.role === 1) {
        return 'Data (' + this.dataData.length + ')'
      }
    }
  },
  watch: {
    '$route.params': function (value) {
      this.init()
    },
    '$store.state.updateView': function (value) {
      this.init()
    }
  },
  feathers: {
    'finstance': {
      created (data) {
      },
      updated (data) {
        if (this.$store.state.role === 1) {
          if (data.currentStatus === this.$route.params.stateid) {
            // // data = data.data
            // // data.data['iid'] = data.id
            // // this.instanceEntries.push(data)
            // // this.dataData.push(data.data)
            // let StageName = data.stageReference[(data.stageReference.length - 1)].StageName

            // setTimeout(() => {
            //   flowzdataModal.get(null, {
            //     iid: data.id,
            //     state: StageName
            //   }).then((resData) => {
            //     // console.log('Form Data: ', resData)
            //     data.data = resData.data[0].data
            //     data.data['iid'] = data.id

            //     console.log('Data: ', data)
            //     this.instanceEntries.push(data)
            //     this.dataData.push(data.data)
            //   }).catch((err) => {
            //     console.log('err: ', err)
            //   })
            // }, 2000)
            this.init()
          } else if (this.$route.params.stateid === data.stageReference[(data.stageReference.length - 1)].StageName) {
            let inx = _.findIndex(this.instanceEntries, (o) => { return o.id === data.id })
            this.instanceEntries.splice(inx, 1)
            this.dataData = this.instanceEntries
          }
        }
        if (this.$store.state.role === 2) {
          if (data.claimuser === '') {
            this.dataClaim.push(data)
            this.init()
          } else {
            this.dataData2.push(data)
            this.init()
          }
          // if (data.currentStatus === this.$route.params.stateid) {
          //   data = data.data
          //   data.data['iid'] = data.id
          //   this.dataClaim.push(data.data)
          // }
        }
        // this.init()
        // console.log('updated called: ', data)
        // _.remove(this.data, (o) => { return o.id === data.id })
      },
      removed (data) {
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.SchemaForm{
		padding: 20px 0;
		background: url(https://imgur.com/WUXSREB.png);
	}

	.ui-card{
		background-color: #fff;
		box-shadow: 0px 0px 25px #dadada;
		border-radius: 10px;
		padding: 10px 20px;
	}

	.card-title{
		text-transform: capitalize;
		color: #FFF;
		font-size: 18px;
		background-color: #292929;
		padding: 10px 30px;
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
		margin-left: -20px;
		margin-bottom: 10px;
	}

	.btnAdd{
		background-color: #53CAE8;
		border-radius: 50px;
		font-size: 14px;
		text-transform: uppercase;
		color: #fff;
		border: none;
		font-style: italic;
	}

	.btnAdd:hover{
		background-color: #83d5ea;
		color: #fff;
	}

	.btnDelete{
		font-size: 14px;
		border-radius: 50px;
		color: #fff !important;
		position: absolute;
		bottom: 10px;
		right: 10px;
		background-color: #FF0000;
		width: 20px;
		height: 20px;
	}

	.btnDelete i{
		position: absolute;
	top: 4px;
	left: 5px;
	}

	.field-label{
		text-transform: capitalize;
	}

	.formTitle{
		text-transform: capitalize;
	}

	.jumper-links{
		list-style: none;
		font-size: 14px;
	}

	.jumper-links a{
		text-decoration: none;
		/*color: #53cae8;*/
		text-align: left;
		font-weight: bold;
		text-transform: capitalize;
	}

	.fixed-div{
		position: fixed;
		right: 0;
    /*top: 250px;*/
	}

	.ivu-form-item-content{
		/*line-height: 15px !important;*/
	}


</style>

<style>
  .ivu-modal-body{
    max-height: 550px !important;
    overflow-y: auto !important;
  }

  #schemasubformview{
    display: none;
  }
  .demo-spin-container{
    	display: inline-block;
        width: 200px;
        height: 100px;
        position: relative;
        border: 1px solid #eee;
    }
</style>
