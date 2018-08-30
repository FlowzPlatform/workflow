<template>
  <div class="SchemaView">
  	<div class="container-fluid">

      <Tabs>
        <TabPane v-if="itsFirstState === true" label="Instances" icon="ios-list">
          <list-instances v-on:setValues="setValues"></list-instances>
          <div>
            <div class="row" v-if="id != null">
              <div class="col-md-10" id="top">
                <div class="row" style="margin-top: 15px;">
                  <div class="col-md-12">
                    <div class="ui-card">
                      <h3 class="formTitle">{{formTitle}}<span style="font-size:12px">&nbsp;&nbsp;({{item.id}})</span></h3>
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
              <div class="col-md-1 fixed-div">
                <strong>Jump To:</strong>
                <ul class="jumper-links">
                  <a href="#top" class="btn btn-info btn-block btnJumperLink"><li>Top</li></a>
                  <a :href="'#' + item" v-for="item in jumperLinks" class="btn btn-info btn-block btnJumperLink"><li>{{item}}</li></a>
                </ul>
                <!-- <pre>{{formSchemaInstance}}</pre> -->
              </div>
            </div>
          </div>
        </TabPane>
        <!-- <TabPane label="Data" icon="ios-albums">
          <b-row>
            <b-col md="6" class="my-1">
              <b-form-group horizontal label="Filter" class="mb-0">
                <b-input-group>
                  <b-form-input v-model="filter" placeholder="Type to Search" />
                  <b-input-group-append>
                    <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col md="4" class="my-1">
              <b-form-group horizontal label="Sort direction" class="mb-0">
                <b-input-group>
                  <b-form-select v-model="sortDirection" slot="append">
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                    <option value="last">Last</option>
                  </b-form-select>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col md="2" class="my-1">
              <b-form-group horizontal label="Per page" class="mb-0">
                <b-form-select :options="pageOptions" v-model="perPage" />
              </b-form-group>
            </b-col>
          </b-row>

          <b-table show-empty
                   stacked="md"
                   :items="items"
                   :fields="fields"
                   :current-page="currentPage"
                   :per-page="perPage"
                   :filter="filter"
                   :sort-by.sync="sortBy"
                   :sort-desc.sync="sortDesc"
                   :sort-direction="sortDirection"
                   @filtered="onFiltered"
          >
            <template slot="name" slot-scope="row">{{row.value.first}} {{row.value.last}}</template>
            <template slot="isActive" slot-scope="row">{{row.value?'Yes :)':'No :('}}</template>
            <template slot="actions" slot-scope="row">
              <!- We use @click.stop here to prevent a 'row-clicked' event from also happening  ->
              <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1">
                Info modal
              </b-button>
              <b-button size="sm" @click.stop="row.toggleDetails">
                {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
              </b-button>
            </template>
            <template slot="row-details" slot-scope="row">
              <b-card>
                <ul>
                  <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
                </ul>
              </b-card>
            </template>
          </b-table>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
            </b-col>
          </b-row>

          <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
            <pre>{{ modalInfo.content }}</pre>
          </b-modal>

          <div>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th width="50">#</th>
                  <th>Instance ID</th>
                  <th width="150">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(instance, index) in instanceEntries">
                  <td>{{(index + 1)}}</td>
                  <td>{{instance.id}}</td>
                  <td>
                    <button class="btn btn-sm btn-success"><i class="fa fa-play"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPane>-->
        <TabPane v-if="itsFirstState === false" label="Data" icon="ios-albums">
          <schemalist :schema="dataSchema" :data="dataData" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData"></schemalist>

          <div style="padding-left: 10px">
            <div class="row" v-if="id != null">
              <div class="col-md-10" id="top">
                <div class="row" style="margin-top: 15px;">
                  <div class="col-md-12">
                    <div class="ui-card">
                      <h3 class="formTitle">{{formTitle}}<span style="font-size:12px">&nbsp;&nbsp;({{item.id}})</span></h3>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12">
                    <schemasubform :schemainstance="formSchemaInstance"></schemasubform>
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
              <div class="col-md-1 fixed-div">
                <strong>Jump To:</strong>
                <ul class="jumper-links">
                  <a href="#top" class="btn btn-info btn-block btnJumperLink"><li>Top</li></a>
                  <a :href="'#' + item" v-for="item in jumperLinks" class="btn btn-info btn-block btnJumperLink"><li>{{item}}</li></a>
                </ul>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>

      <!-- <mycustom></mycustom> -->


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
    <div v-if="schemabinding">
      <schemasubformview ref="schemasubformview" :schemainstance="formSchemaInstance" id="schemasubformview"></schemasubformview>
    </div>
    <div v-if="email">
      <email :btnArr="btnArr" :sendDataEmail="sendDataEmail" :iid="item.id" v-on:on-done="emailService"></email>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import _ from 'lodash'
import axios from 'axios'

import ListInstances from './ListInstances'
import SchemaSubForm from './SchemaSubForm'
import SchemaSubFormView from './SchemaSubFormView'
import email from './email'

import flowzdataModal from '@/api/flowzdata'
import flowzModel from '@/api/flowz'

import schemalist from '@/pages/user/SchemaList'
import schemaModel from '@/api/schema'

import finstanceModal from '@/api/finstance'
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
      htmlcontent: false,
      schemabinding: false,
      flowzData: null,
      email: false,
      loading: false,
      formSchemaInstance: {
        data: [],
        entity: []
      },
      btnArr: {},
      schema: {},
      dataSchema: {},
      dataData: [],
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
      jumperLinks: SchemaSubForm.jumperLinks,
      flowData: null,
      bLoading: false,
      isMultiple: false,
      nextTarget: {
        value: '',
        options: []
      },
      configuration: true,
      dynamicData: true,
      instanceEntries: null,
      isEmailDone: false,
      itsFirstState: false,
      sendDataEmail: null,
      loadingEmail: true
    }
  },
  components: {
    'list-instances': ListInstances,
    'schemasubform': SchemaSubForm,
    'schemalist': schemalist,
    'email' : email,
    'schemasubformview': SchemaSubFormView
  },
  methods: {
    async emailService (item) {
      this.isEmailDone = true
      await this.handleSubmit('formSchemaInstance')
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
      await axios.get('https://api.flowzcluster.tk/eng/schema/' + id)
      .then(async (response) => {
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
      // alert('entity')
      var self = this
      var res = []
      var _res = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
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
      var response = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
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
      this.schema = response.data
      this.entity = response.data.entity
      this.formSchemaInstance.entity = this.schema.entity
      // this.formSchemaInstance.data[0] = {}
      for (let [index, entity] of self.formSchemaInstance.entity.entries()) {
        if (entity.customtype) {
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
        await this.handleAdd()
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
      $('html, body').animate({
          scrollTop: $("#top").offset().top
      }, 500);
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
      var self = this
      var obj = {}
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
        // obj.database = this.schema.database
      obj.Schemaid = this.schema.id
      // _.forEach(self.entity, async function (v) {
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

      // }
    },

    makeObj () {
      var obj = this.schema
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

    async handleSubmit (name) {
      let currentStateId = this.$route.params.stateid
      if(!this.isEmailDone){
        let currentStageObject = _.find(this.flowData.json.processList, {'id': currentStateId})
        let nextTargetId
        if (this.isMultiple) {
          nextTargetId = _.find(this.flowData.json.processList, {'id': this.nextTarget.value})
        } else {
          nextTargetId = _.find(this.flowData.json.processList, {'id': currentStageObject.target[0].id})
        }
        if (nextTargetId.type === 'sendproofmail') {
          this.id = null
          this.schemabinding = true
          setTimeout(() => {
            this.sendDataEmail = '<link rel="stylesheet" href="https://unpkg.com/iview@3.0.1/dist/styles/iview.css">' + ' <style> .ui-card{background-color: #fff; box-shadow: 0px 0px 25px #dadada; border-radius: 10px; padding: 10px 20px;}.card-title{text-transform: capitalize; color: #FFF; font-size: 18px; background-color: #292929; padding: 10px 30px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; margin-left: -20px; margin-bottom: 10px;}.btnAdd{background-color: #53CAE8; border-radius: 50px; font-size: 14px; text-transform: uppercase; color: #fff; border: none; font-style: italic;}.btnAdd:hover{background-color: #83d5ea; color: #fff;}.btnDelete{font-size: 14px; border-radius: 50px; color: #fff !important; position: absolute; bottom: 10px; right: 10px; background-color: #FF0000; width: 20px; height: 20px;}.btnDelete i{position: absolute; top: 4px; left: 5px;}.field-label{text-transform: capitalize;}.formTitle{text-transform: capitalize;}.jumper-links{list-style: none; font-size: 14px;}.jumper-links a{text-decoration: none; /*color: #53cae8;*/ text-align: left; font-weight: bold; text-transform: capitalize;}.fixed-div{position: fixed; right: 0;}.ivu-form-item-content{/*line-height: 15px !important;*/} </style>' + this.$refs.schemasubformview.$el.outerHTML
            this.email = true
          }, 1000)
          if (nextTargetId.target.length > 1) {
            let arr = {}
            for (let index = 0; index < nextTargetId.target.length; index++) {
              let target = _.find(this.flowData.json.processList, {'id': nextTargetId.target[index].id})
              arr[target.emailbutton.buttonLabel] = target.id
            }
            this.btnArr = arr
          } else {
            let arr = {}
            arr['approve'] = nextTargetId.target[0].id
            this.btnArr = arr
          }
        } else {
          this.saveDataMethod()
        }
      } else{
        this.saveDataMethod();
      }
    },
    async saveDataMethod () {
        // this.bLoading = true
        var obj = this.makeObj()
        this.validFlag = true
        this.validErr = []
        // var check = this.checkValidation(obj.data[0], this.entity)
        let allcheck = []
        for (let dobj of obj.data) {
          let flag = this.checkValidation(dobj, this.entity)
          allcheck.push(flag)
        }
        let check = _.indexOf(allcheck, false)
        // var check = this.checkValidation(obj.data[0], this.entity)
        this.$Loading.start()
        if (check === -1) {
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
          await flowzdataModal.post(saveObj).then(res => {
            this.id = null
            this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
            this.$Loading.finish()
            this.bLoading = false
            this.email = false
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
        } else {
          this.validErr = _.uniqBy(this.validErr, 'name')
          this.$Notice.error({title: 'Validation Error!'})
        }
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
      this.nextTarget.value = ''
      this.nextTarget.options = []
      this.isMultiple = false
      this.id = values.id
      if (values.id !== null) {
        this.item = values.item
        this.formTitle = values.formName
        this.flowData = values.flowzData
        let targetObj = _.find(values.flowzData.json.processList, {id: values.currentState})
        if (Object.keys(targetObj).length > 0) {
          if (targetObj.target.length > 1) {
            let opts = []
            for (let m of targetObj.target) {
              let label = _.find(values.flowzData.json.processList, {id: m.id}).name
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
        if (values.formData !== null, Object.keys(values.formData).length > 0) {
          this.fetch(this.id, values.formData)
        } else {
          this.fetch(this.id)
        }
      }
      // let arr = [values.formData]
      // this.formSchemaInstance.data = arr[0]
      // console.log('form instance data: ', this.formSchemaInstance.data)
      // this.nextState = values.nextState
      // this.currentState = values.currentState
    },

    async getFData (item) {
      // console.log('item: ', item)
      let returnData = null
      if (item) {
        let lastItem = _.last(item)
        if (lastItem.stageRecordId) {
          let stageRecordId = lastItem.stageRecordId
          await flowzdataModal.get(null, {
            id: stageRecordId
          }).then( (resData) => {
            // console.log('resultDatadadadaadd: ', resData.data[0].data)
            returnData = resData.data[0].data
          }).catch( (err) => {
            console.log('err: ', err)
          })
        }
      }
      return(returnData)
    },

    async init () {
      this.email = false
      this.htmlcontent = false
      this.id = null
      this.$Spin.show()

      let query = {
        fid: this.$route.params.id,
        currentStatus: this.$route.params.stateid,
        '$paginate': false
      }

      await flowzModel.get(this.$route.params.id, {
        $select: ['json']
      }).then(async res => {
        this.flowzData = res.data
        // if (this.$route.params.stateid) {
        //   let m = _.find(this.flowzData.json.processList, {id: this.$route.params.stateid})
        //   if (m && m !== null && Object.keys(m).length > 0) {
        //     this.breadItem.state = m.name
        //   }
        // }
        await finstanceModal.get(null, query).then(async resp => {
          if (resp.data.length === 0) {
            this.itsFirstState = true
            this.$Spin.hide()
          } else {
            // console.log('resp data: ', resp.data)
            this.itsFirstState = false
            this.instanceEntries = resp.data
            for ( let i = 0; i < this.instanceEntries.length; i++) {
              if (this.instanceEntries[i].stageReference.length > 0) {
                this.instanceEntries[i]['lastData'] = await this.getFData(this.instanceEntries[i].stageReference)
                this.instanceEntries[i].lastData['id'] = this.instanceEntries[i].id
              } else {
                this.itsFirstState = true
              }
            }
            if (this.itsFirstState === false) {
              this.dataData = _.map(this.instanceEntries, (o) => { return o.lastData })
            }
            this.$Spin.hide()
          }
        }).catch(err => {
          console.log('err', err)
          this.$Spin.hide()
        })

      }).catch(err => {
        console.log('....', err)
        this.$Spin.hide()
      })
    }
  },
  mounted () {
    flowzModel.get(null, {
      id: this.$route.params.id
    })
    .then( (res) => {
      // console.log('res flowz get call: ', res.data.data[0].json.processList)
      let taskData = _.find(res.data.data[0].json.processList, (o) => { return o.id == this.$route.params.stateid})
      let inputschemaId = taskData.inputProperty[0].entityschema.id
      schemaModel.getAll(inputschemaId).then(res => {
        this.dataSchema = res
        // console.log('Res:: ', res)
        // get flowz data
        // flowzdataModal.get(null, {
        //   fid: this.$route.params.id,
        //   state: this.$route.params.stateid,
        //   $paginate: false
        // }).then( (resultData) => {
        //   // console.log('FData: ', resultData)
        //   let finalData = _.map(resultData, (o) => { return o.data })
        //   console.log('Final Data: ', finalData)
        //   this.dataData = finalData
        // })
        this.init()
      }).catch(err => {
        console.error('Error: ', err)
      })
      // console.log('Task Data: ', inputschemaId)
    })
    // await finstanceModal.get(null, query).then(resp => {
    //   console.log('Instance response Data: ', resp)
    //   this.instanceEntries = resp.data
    // }).catch(err => {
    //   this.tableLoading = false
    //   this.instanceEntries = null
    //   console.log('err', err)
    // })
  },
  computed: {
  },
  watch: {
    '$route.params': function (value) {
      this.init()
    }
  },
  feathers: {
      'finstance': {
        created (data) {
          // console.log('created called from parent: ', data)
          // this.init()
          // let findIndex = _.findIndex(this.data, (o) => { return o.id })
          // if (findIndex !== -1) {
          //   this.data.push(data)
          // }
        },
        async updated (data) {
          // console.log('called on parent: ', data)
          if (data.currentStatus === this.$route.params.stateid) {
            data['lastData'] = await this.getFData(data.stageReference)
            data.lastData['id'] = data.id
            this.instanceEntries.push(data)
            this.dataData.push(data.lastData)
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
</style>
