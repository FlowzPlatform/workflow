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

        <!-- <div v-if="instanceEntries.length === 0 && itsFirstState === false">
          <p align="center">No Data</p>
        </div> -->
        
        <div v-if="itsFirstState === false">
          <tabs> 
          <TabPane v-if="this.$store.state.role === 1" :label="'Data ('+ dataTotal + ')'" icon="lock-combination">
          <schemalist v-if="this.$store.state.role === 1" :schema="dataSchema" :pageno="pageno" :datashow="'dataA'" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotal" :data="dataData" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>
          <!-- <schemalist v-if="this.$store.state.role === 2" :schema="dataSchema" :pageno="pageno" :datashow="'dataU'" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotal" :data="dataData2" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist> -->

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
          </TabPane>
          <TabPane v-if="this.$store.state.role === 2" :label="'Work Pool ('+ dataTotalUnclaim + ')'" icon="lock-combination">
            <schemalist :schema="dataSchema" :datashow="'dataU'" :pageno="pageno" v-on:on-paginate="pagination" v-on:on-handlepage="handlepage" :limit="limit" :skip="skip" :dataTotal="dataTotalUnclaim" :data="dataData2" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>
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
          </TabPane>
          <TabPane v-if="this.$store.state.role === 2" :label="'In Progress ('+ dataTotalClaim + ')'" icon="lock-combination">
            <schemalist v-if="this.$store.state.role === 2" :schema="dataSchema" :pageno="pageno" :datashow="'dataC'" v-on:on-paginate2="pagination2" v-on:on-handlepage2="handlepage2" :limit="limit" :skip="skip" :dataTotalClaim="dataTotalClaim" :data="dataClaim" :configuration="configuration" :instanceEntries="instanceEntries" :dynamicData="dynamicData" v-on:setValues="setValues" :flowzData="flowzData" v-on:sort-data="sortData" v-on:search-data="searchData"></schemalist>
          </TabPane>
          </Tabs>
        </div>
      </div>

      <!-- <mycustom></mycustom> -->
      <Spin size="large" fix v-if="dataLoading"></Spin>

		</div>

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
import $ from 'jquery'

import flowzdataModal from '@/api/flowzdata'
import flowzModel from '@/api/flowz'
import schemaModel from '@/api/schema'

import finstanceModal from '@/api/finstance'
import dataQuerymodel from '@/api/dataquery'
import saveemailTemplate from '@/api/emailtemplate'
import schemalist from '@/pages/user/SchemaList'

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
      dataTotalUnclaim: 0,
      dataTotalClaim: 0,
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
      dataLoading: true,
      entriesTotal: 10
    }
  },
  components: {
    'list-instances': (resolve) => { require(['./ListInstances'], resolve) },
    'schemasubform': (resolve) => { require(['./SchemaSubForm'], resolve) },
    // 'schemalist': (resolve) => { require(['@/pages/user/SchemaList'], resolve) },
    'schemalist': schemalist,
    'email': (resolve) => { require(['./email'], resolve) },
    'schemasubformview': (resolve) => { require(['./SchemaSubFormView'], resolve) }
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
        // let firstState = this.flowzData.first
        // if (firstState === this.$route.params.stateid) {
        //   this.itsFirstState = true
        // } else {
        //   this.itsFirstState = false
        // }
        this.dataTotal = res.data.total
        if (res.data.data.length > 0) {
          this.instanceEntries = res.data.data
          this.dataData = this.instanceEntries
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
      this.entriesTotal = limit
      this.pageno = page
      this.populateTables()
      this.skip = 0
    },
    handlepage (skip, limit, size) {
      this.limit = size
      this.entriesTotal = size
      this.skip = 0
      this.populateTables()
    },
    pagination2 (skip, limit, page) {
      this.skip = skip
      this.limit = limit
      this.entriesTotal = limit
      this.pageno = page
      this.populateTables()
      this.skip = 0
    },
    handlepage2 (skip, limit, size) {
      this.limit = size
      this.entriesTotal = size
      this.skip = 0
      this.populateTables()
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
      var arrObj = []
      var self = this
      schemaModel.get(id)
      .then(async (response) => {
        var _res = response.data
        var obj = {}

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
              if (v.property.hasOwnProperty('dateformatselect')) {
                let fullDate = new Date()
                const year = fullDate.getFullYear()
                const month = fullDate.getMonth()
                const date = fullDate.getDate()
                const hour = fullDate.getHours()
                const minute = fullDate.getMinutes()
                const second = fullDate.getSeconds()
                if (v.property.dateformatselect === 'A') {
                  obj[v.name] = date + '/' + month + '/' + year + ' ' + hour + ':' + minute
                }
                if (v.property.dateformatselect === 'B') {
                  obj[v.name] = year + '/' + month + '/' + date + ' ' + hour + ':' + minute
                }
                if (v.property.dateformatselect === 'C') {
                  obj[v.name] = year + '/' + month + '/' + date + ' ' + hour + ':' + minute + ':' + second
                }
                if (v.property.dateformatselect === 'D') {
                  obj[v.name] = date + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second
                }
                if (v.property.dateformatselect === 'E') {
                  obj[v.name] = date + '/' + month + '/' + year
                }
                if (v.property.dateformatselect === 'F') {
                  obj[v.name] = year + '/' + month + '/' + date
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
      var self = this
      var res = []
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
      this.formSchemaInstance.data = []
      this.schema = this.currentSchema
      this.entity = this.currentSchema.entity
      let currentStageP = this.$route.params.stateid
      let currentStateP = this.flowzData.processList[currentStageP]
      if (currentStateP.hasOwnProperty('permission')) {
        this.formSchemaInstance.permission = []
        this.formSchemaInstance.permission = currentStateP.permission
      }

      this.formSchemaInstance.entity = this.schema.entity
      for (let [index, entity] of self.formSchemaInstance.entity.entries()) {
        if (entity.customtype === true) {
          self.formSchemaInstance.entity[index]['entity'] = await self.getChildEntity(entity.type)
        }
      }
      if (arr) {
        let m = [arr]
        this.formSchemaInstance.data = m
      } else {
        this.handleAdd()
      }

      this.$Loading.finish()
      setTimeout(() => {
        $('html, body').animate({
          scrollTop: $('#top').offset().top
        }, 500)
      }, 0)
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
              if (v.property.hasOwnProperty('dateformatselect')) {
                let fullDate = new Date()
                const year = fullDate.getFullYear()
                const month = fullDate.getMonth()
                const date = fullDate.getDate()
                const hour = fullDate.getHours()
                const minute = fullDate.getMinutes()
                const second = fullDate.getSeconds()
                if (v.property.dateformatselect === 'A') {
                  obj[v.name] = date + '/' + month + '/' + year + ' ' + hour + ':' + minute
                }
                if (v.property.dateformatselect === 'B') {
                  obj[v.name] = year + '/' + month + '/' + date + ' ' + hour + ':' + minute
                }
                if (v.property.dateformatselect === 'C') {
                  obj[v.name] = year + '/' + month + '/' + date + ' ' + hour + ':' + minute + ':' + second
                }
                if (v.property.dateformatselect === 'D') {
                  obj[v.name] = date + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second
                }
                if (v.property.dateformatselect === 'E') {
                  obj[v.name] = date + '/' + month + '/' + year
                }
                if (v.property.dateformatselect === 'F') {
                  obj[v.name] = year + '/' + month + '/' + date
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
      this.validFlag = true
      this.validErr = []
      let allcheck = []
      this.bLoading = true
      for (let dobj of this.formSchemaInstance.data) {
        let flag = this.checkValidation(dobj, this.entity)
        allcheck.push(flag)
      }
      this.check = _.indexOf(allcheck, false)
      if (this.check === -1) {
        this.$Loading.start()
        let fheaders = null
        let saveObj = {
          fid: this.$route.params.id,
          currentStatus: this.$route.params.stateid,
          data: this.formSchemaInstance.data[0]
        }
        if (this.$store.state.role === 2) {
          fheaders = {
            workflowid: 'workflow_' + this.flowzData.id,
            stateid: this.$route.params.stateid
          }
        }
        if (fheaders !== null) {
          finstanceModal.post(saveObj, null, fheaders)
          .then(res => {
            this.$Loading.finish()
            this.$Notice.success({title: 'Saved Successfully'})
            this.bLoading = false
            setTimeout(() => {
              $('html, body').animate({
                scrollTop: $('#top').offset().top
              }, 500)
            }, 0)
            this.init()
          }).catch(e => {
            this.$Loading.error()
            console.log('error', e)
            this.bLoading = false
            if (e.response.data.message) {
              this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
            } else {
              this.$Notice.error({duration: '3', title: e.message, desc: ''})
            }
          })
        } else {
          finstanceModal.post(saveObj)
          .then(res => {
            this.$Loading.finish()
            this.$Notice.success({title: 'Saved Successfully'})
            this.bLoading = false
            setTimeout(() => {
              $('html, body').animate({
                scrollTop: $('#top').offset().top
              }, 500)
            }, 0)
            this.init()
          }).catch(e => {
            this.$Loading.error()
            console.log('error', e)
            this.bLoading = false
            if (e.response.data.message) {
              this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
            } else {
              this.$Notice.error({title: 'Error', desc: e.message})
            }
          })
        }
      } else {
        this.validErr = _.uniqBy(this.validErr, 'name')
        this.$Notice.error({title: 'Validation Error!'})
        this.bLoading = false
      }
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
                  if (res.data.template === undefined) {
                    this.sendDataEmail = this.$refs.schemasubformview.$el.outerHTML
                    this.email = true
                    this.loadEmail = false
                  } else {
                    this.sendDataEmail = res.data.template + this.$refs.schemasubformview.$el.outerHTML
                    this.email = true
                    this.loadEmail = false
                  }
                }, 1000)
              })
              .catch((err) => {
                this.$Notice.error({duration: '3', title: err.message, desc: ''})
                setTimeout(() => {
                  this.sendDataEmail = this.$refs.schemasubformview.$el.outerHTML
                  this.email = true
                  this.loadEmail = false
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
        // this.saveInstanceData()
      } else {
        this.saveInstanceData()
      }
    },
    async saveDataMethod () {
      var obj = this.makeObj()
      this.$Loading.start()
      let mergeData = this.mergeFileList(obj.data, obj)
      obj.data = mergeData
      let fheaders = null
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
      if (this.$store.state.role === 2) {
        fheaders = {
          workflowid: 'workflow_' + this.flowzData.id,
          stateid: this.$route.params.stateid
        }
      }
      if (fheaders !== null) {
        flowzdataModal.post(saveObj, null, fheaders)
        .then(res => {
          this.id = null
          this.$Loading.finish()
          this.$Notice.success({title: 'Saved Successfully'})
          this.bLoading = false
          this.email = false
          this.validErr = []
          this.isEmailDone = false
        }).catch(e => {
          this.$Loading.error()
          console.log('error', e)
          this.bLoading = false
          this.email = false
          this.isEmailDone = false
          if (e.response.data.message) {
            this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
          } else {
            this.$Notice.error({duration: '3', title: e.message, desc: ''})
          }
        })
      } else {
        flowzdataModal.post(saveObj)
        .then(res => {
          this.$Loading.finish()
          this.$Notice.success({title: 'Saved Successfully'})
          this.bLoading = false
          setTimeout(() => {
            $('html, body').animate({
              scrollTop: $('#top').offset().top
            }, 500)
          }, 0)
          this.init()
        }).catch(e => {
          this.$Loading.error()
          console.log('error', e)
          this.bLoading = false
          if (e.response.data.message) {
            this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
          } else {
            this.$Notice.error({duration: '3', title: e.message, desc: ''})
          }
        })
      }
    },
    checkValidation (data, ent) {
      let self = this
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
                let patt0 = v.property.regEx
                let res0 = patt0.test(data[v.name])
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
              let patt1 = (v.property.regEx === '') ? new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$') : new RegExp(v.property.regEx)
              let res1 = patt1.test(data[v.name])
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
              let patt2 = (v.property.regEx === '') ? new RegExp('^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$') : new RegExp(v.property.regEx)
              let res2 = patt2.test(data[v.name])
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
        if (values.formData) {
          this.fetch(this.currentSchema.id, values.formData)
        } else {
          this.fetch(this.currentSchema.id)
        }
      }
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
        this.$Notice.error({duration: '3', title: err.message, desc: ''})
        this.dataLoading = false
        return
      })
    },

    getSchema () {
      return schemaModel.getAll(this.flowzData.schema).then(res => {
        return res
      }).catch(err => {
        this.$Notice.error({duration: '3', title: err.message, desc: ''})
        this.dataLoading = false
        return
      })
    },

    populateTables (schema) {
      this.formTitle = this.flowzData.processList[this.$route.params.stateid].name
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
      if (this.$store.state.role === 1) {
        dataQuerymodel.get(null, {
          $last: true,
          fid: this.$route.params.id,
          currentStatus: this.$route.params.stateid,
          $skip: this.skip,
          $limit: this.limit
        }).then(queryresp => {
          // console.log('queryresp: ', queryresp)
          // this.entriesTotal = queryresp.data.data.length
          this.isFlowzLoaded = true
          this.dataTotal = queryresp.data.total
          if (queryresp.data.data.length > 0) {
            this.instanceEntries = queryresp.data.data
            this.dataData = this.instanceEntries
            this.$Loading.finish()
            this.dataLoading = false
          } else {
            this.instanceEntries = []
            this.dataData = []
            this.dataData2 = []
            this.dataLoading = false
            this.$Loading.finish()
          }
        }).catch(err => {
          this.$Notice.error({duration: '3', title: err.message, desc: ''})
          this.$Loading.error()
          this.dataLoading = false
        })
      }
      if (this.$store.state.role === 2) {
        dataQuerymodel.get(null, {
          $last: true,
          fid: this.$route.params.id,
          currentStatus: this.$route.params.stateid,
          claimUser: '',
          $skip: this.skip,
          $limit: this.limit
        }).then(queryresp => {
          this.isFlowzLoaded = true
          if (queryresp.data.data.length > 0) {
            this.instanceEntries = queryresp.data.data
            this.dataTotalClaim = queryresp.data.total
            this.dataClaim = queryresp.data.data
            this.$Loading.finish()
            this.dataLoading = false
          } else {
            this.instanceEntries = []
            this.dataData = []
            this.dataData2 = []
            this.dataLoading = false
            this.$Loading.finish()
          }
        }).catch(err => {
          this.$Notice.error({duration: '3', title: err.message, desc: ''})
          this.$Loading.error()
          this.dataLoading = false
        })
        dataQuerymodel.get(null, {
          $last: true,
          fid: this.$route.params.id,
          currentStatus: this.$route.params.stateid,
          claimUser: this.$store.state.user._id,
          $skip: this.skip,
          $limit: this.limit
        }).then(queryresp => {
          this.isFlowzLoaded = true
          if (queryresp.data.data.length > 0) {
            this.instanceEntries = queryresp.data.data
            this.dataTotalUnclaim = queryresp.data.total
            this.dataData2 = queryresp.data.data
            this.$Loading.finish()
            this.dataLoading = false
          } else {
            this.instanceEntries = []
            this.dataData = []
            this.dataData2 = []
            this.dataLoading = false
            this.$Loading.finish()
          }
        }).catch(err => {
          this.$Notice.error({duration: '3', title: err.message, desc: ''})
          this.$Loading.error()
          this.dataLoading = false
        })
      }
    },

    async init () {
      this.dataLoading = true
      this.instanceEntries = []
      this.isFlowzLoaded = false
      this.$Loading.start()
      this.schemabinding = false
      this.email = false
      this.isMultiple = false
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
        return 'Work Pool (' + this.dataData2.length + ')'
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
            if (this.instanceEntries.length < this.entriesTotal) {
              let instanceObj = data
              let inx = _.findIndex(this.dataData, (o) => { return o.id === data.id })
              let lastEntryId = data.stageReference[data.stageReference.length - 1].stageRecordId
              if (lastEntryId !== undefined) {
                flowzdataModal.get(lastEntryId).then(res => {
                  // console.log('Response fdata: ', res)
                  instanceObj['data'] = res.data.data
                  instanceObj['iid'] = data.id
                  // this.instanceEntries.push(instanceObj)
                  this.dataData.splice(inx, 1)
                  this.dataData.push(instanceObj)
                  // console.log('Pushed data: ', this.instanceEntries, this.dataData)
                })
              }
            } else {
              // don't do anything
            }
            // this.init()
          } else if (this.$route.params.stateid === data.stageReference[(data.stageReference.length - 1)].StageName) {
            let inx = _.findIndex(this.instanceEntries, (o) => { return o.id === data.id })
            this.instanceEntries.splice(inx, 1)
            this.dataData = this.instanceEntries
          }
        }
        if (this.$store.state.role === 2) {
          if (data.claimuser === '') {
            this.dataClaim.push(data)
            this.populateTables()
          } else {
            this.dataData2.push(data)
            this.populateTables()
          }
        }
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

  .clickToCopy{
    cursor: pointer;
  }


</style>

<style>
.ivu-table-tip table td{
    text-align: left;
    padding-left: 20px;
  }
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

  /*.ivu-tabs .ivu-tabs-tabpane {
    margin-bottom: 20% !important;
  }*/
</style>
