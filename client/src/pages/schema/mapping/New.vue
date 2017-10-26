<template>
  <div class="SchemaMapping">
    <h5>Schema Mapping</h5>
    <Row style="padding:20px;">
        <Form ref="formMapping" :model="formMapping" :rules="ruleMapping" inline>
          <Row>
            <FormItem :label-width="75" prop="title" label="Title">
                <Input type="text" v-model.trim="formMapping.title" placeholder="Title" @on-blur="checkTitle"></Input>
                <div class="ivu-form-item-error-tip" v-if="checkTitleStatus" style="">Title Already Exist.</div>
            </FormItem>
            <FormItem :label-width="75" prop="producer" label="producer ">
                    <Select v-model="formMapping.producer" disabled style="width:200px">
                        <Option v-for="item in SourceOptionDt" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
            </FormItem>
            <!-- {{TargetOptionDt}} -->
            <FormItem :label-width="75" prop="consumer" label="consumer">
                  <Select v-model="formMapping.consumer" style="width:200px"  @on-change="mapStart">
                      <Option v-for="item in TargetOptionDt" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
            </FormItem>
            <FormItem :label-width="75" label="Notes">
                <Input v-model="formMapping.notes" type="textarea" placeholder="Notes..."></Input>
            </FormItem>
          </Row>
          <Row>
            <div class="schema-form ivu-table-wrapper">
            <div class="ivu-table ivu-table-border">
                <div class="ivu-table-body">
                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                        <colgroup>
                            <col width="35">
                                <col width="35">
                                    <col width="30">
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Producer Fields</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Consumer Fields</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell"><span>Transform</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="ivu-table-tbody">
                           <template v-for="(ent, index) in sourceSchemaEntity">
                              <tr class="ivu-table-row" >
                                  <td class="">
                                    <div class="ivu-table-cell">
                                      {{ ent.name }}  
                                      <span style="float:right" v-if="ent.customtype">
                                        <!-- {{ent.customtype}} -->
                                        <Icon type="log-in" style="font-size:15px"/>
                                      </span>
                                    </div>
                                  </td>
                                  <td class="">
                                  <!-- {{cascadDt}} -->
                                      <div class="ivu-table-cell" v-if="!ent.customtype">
                                          <Cascader v-if="formMapping.consumer" :data="cascadDt" v-model="formMapping.MapData[index].consumerField"></Cascader>
                                      </div>
                                      <div class="ivu-table-cell" v-if="ent.customtype">
                                      <div v-if="formMapping.consumer">
                                        <span v-if="customDtRecord[index].data.length != 0">
                                          <!-- {{customDtRecord}} -->
                                          <Select v-if="formMapping.consumer" v-model="formMapping.MapData[index].consumerField" style="width:200px">
                                              <Option v-for="opt in customDtRecord[index].data" :value="opt.value" :key="opt.value">{{ opt.label }}</Option>
                                          </Select>
                                        </span>
                                          <a v-if="formMapping.consumer" @click="saveTostore(ent.type)" style="color:#2d8cf0">
                                              Map
                                          </a>
                                        </div>
                                      </div>
                                  </td>
                                  <td class="">
                                    <div class="ivu-table-cell" v-if="!ent.customtype">
                                      <a v-if="formMapping.consumer" @click="openTrasformEditor(index)"><Icon type="edit"></Icon>
                                      </a>
                                    </div>
                                  </td>
                              </tr>
                              <tr v-if="formMapping.consumer && openTrasformEditorIndex === index">
                                <td colspan="3">
                                  <codemirror v-model='formMapping.MapData[index].transform' :options="editorOptions" @change="onEditorCodeChange(formMapping.MapData[index].transform, index)"></codemirror>
                                </td>
                              </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
          </Row>
          <Row style="padding-top:10px;">  
            <FormItem>
                <Button type="primary" @click="saveMapping('formMapping')">Save</Button>
                <Button type="ghost" @click="resetForm">Reset</Button>
            </FormItem>
          </Row>  
        </Form>
    </Row>
  </div>
  </div>
</template>

<script>
let _ = require('lodash')
import schema from '@/api/schema'
import schemamapping from '@/api/schemamapping'
import VueCodeMirror from 'vue-codemirror'
import Vue from 'vue'
// import api from '../api'
Vue.use(VueCodeMirror)
export default {
  name: 'SchemaMapping',
  data () {
    return {
      openTrasformEditorIndex: -1,
      editorOptions: {
        tabSize: 4,
        mode: 'text/javascript',
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        // keyMap: 'sublime',
        extraKeys: { 'Ctrl': 'autocomplete' },
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        styleSelectedText: true,
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true }
      },
      ruleMapping: {
        title: [
          { required: true, message: 'Please Enter Title.', trigger: 'blur' }
        ],
        consumer: [
          { required: true, message: 'Please Select consumer.', trigger: 'blur' }
        ]
      },
      allSchema: [],
      SourceOptionDt: [],
      TargetOptionDt: [],
      _sourceSchema: {},
      _targetSchema: [],
      sourceSchemaEntity: [],
      targetSchemaEntity: [],
      cascadDt: [],
      customDtRecord: [],
      rid: '',
      formMapping: {
        title: '',
        producer: '',
        consumer: '',
        notes: '',
        MapData: []
      },
      testStoreAvail: {},
      checkTitleStatus: false
    }
  },
  mounted () {
    this.fetch(this.$route.params.id)
    // this.$store.state.mappingTemp = []
    // console.log('mouted id .... ', this.$route.params.id)
    // console.log('Temp Store Dt: ', this.$store.state.mappingTemp)
  },
  methods: {
    async checkTitle () {
      var TitleExist = false
      var response = await schemamapping.get()
      for (let item in response.data.data) {
        if (response.data.data[item].title === this.formMapping.title) {
          TitleExist = true
        }
      }
      this.checkTitleStatus = TitleExist
      return TitleExist
    },
    saveTostore (nPath) {
      var self = this
      var formData = self.formMapping
      this.$store.dispatch('setMapTemp', formData)
      self.$router.push('/schema/' + nPath + '/mapping/new')
      // window.location.href = '/schema/' + nPath + '/mapping/new'
    },
    openTrasformEditor (index) {
      if (this.openTrasformEditorIndex === index) {
        this.openTrasformEditorIndex = -1
        return false
      }
      this.openTrasformEditorIndex = index
    },
    onEditorCodeChange (newCode, index) {
      this.formMapping.MapData[index].transform = newCode
    },
    async fetch (id) {
      var self = this
      this.rid = id
      // console.log('this.$store.state.mappingTemp1111', JSON.stringify(this.$store.getters.MapTemp))
      let response = await schema.get()
      self.SourceOptionDt = []
      self.formMapping = {
        title: '',
        producer: self.rid,
        consumer: '',
        notes: '',
        MapData: []
      }
      self.allSchema = response.data
      self._sourceSchema = _.find(self.allSchema, {_id: self.rid})
      self.sourceSchemaEntity = self._sourceSchema.entity
      // console.log('this.sourceSchemaEntity', this.sourceSchemaEntity)
      self.SourceOptionDt.push({value: self._sourceSchema._id, label: self._sourceSchema.title})
      self.formMapping.producer = self._sourceSchema._id
      self._targetSchema = _.reject(self.allSchema, {_id: self.rid})
      self.TargetOptionDt = _.map(self._targetSchema, (m) => {
        return {value: m._id, label: m.title}
      })

      var checkDt = _.find(this.$store.state.mappingTemp, { 'producer': self.rid })
      // console.log('checkDt', JSON.stringify(checkDt))
      // for already try a new map for this instance
      if (checkDt !== undefined) {
        self.testStoreAvail = checkDt
        self.formMapping.title = checkDt.title
        self.formMapping.notes = checkDt.notes
        self.mapStart(checkDt.consumer)
      } else {
        self.testStoreAvail = {}
      }
    },
    resetData () {
      // alert('reset')
      this.SourceOptionDt = []
      this.TargetOptionDt = []
      this.formMapping.MapData = []
      this.formMapping = {
        title: '',
        producer: self.rid,
        consumer: '',
        notes: '',
        MapData: []
      }
      this._sourceSchema = {}
      this._targetSchema = []
      this.sourceSchemaEntity = []
      this.targetSchemaEntity = []
      this.cascadDt = []
      this.customDtRecord = []
    },
    mapStart (value) {
      // alert('mapStart' + value)
      if (value !== '') {
        var self = this
        // console.log('...........', this.testStoreAvail.consumer)
        if (this.testStoreAvail.consumer) {
          self.formMapping.consumer = value
          self.formMapping.MapData = this.testStoreAvail.MapData
          self.customDtRecord = []
          self.cascadDt = []
          self.targetSchemaEntity = (_.find(self._targetSchema, {_id: this.testStoreAvail.consumer})).entity
          _.forEach(self._sourceSchema.entity, function (ent) {
            if (ent.customtype) {
              var data5 = []
              schemamapping.get()
              .then(response => {
                response.data.data.forEach(function (result, i) {
                  if (result.producer === ent.type) {
                    data5.push({value: result.id, label: result.title})
                  }
                })
              })
              .catch(error => {
                console.log(error)
              })
              self.customDtRecord.push({data: data5})
            } else {
              var dt = []
              self.customDtRecord.push({data: dt})
            }
          })
          _.forEach(this.targetSchemaEntity, function (ent) {
            if (!ent.customtype) {
              self.cascadDt.push({label: ent.name, value: ent.name, children: []})
            } else {
              var _child = self.getChildren(ent.type)
              // console.log('_child', _child)
              self.cascadDt.push({label: ent.name, value: ent.name, children: _child})
            }
          })
          self.cascadDt.push({label: 'Custom', value: -1, children: []})
        } else {
          self.formMapping.consumer = value
          self.formMapping.MapData = []
          self.customDtRecord = []
          self.cascadDt = []
          self.targetSchemaEntity = (_.find(self._targetSchema, {_id: self.formMapping.consumer})).entity
          // console.log('self._sourceSchema', self._sourceSchema)
          // console.log('Calling.......................................................')
          _.forEach(self._sourceSchema.entity, function (ent) {
            self.formMapping.MapData.push({producerField: ent.name, consumerField: [], transform: '', ctype: ent.customtype})
            if (ent.customtype) {
              var data5 = []
              schemamapping.get()
              .then(response => {
                // console.log('response', response.data.data, ent.type)
                response.data.data.forEach(function (result, i) {
                  if (result.producer === ent.type) {
                    data5.push({value: result.id, label: result.title})
                  }
                })
              })
              .catch(error => {
                console.log(error)
              })
              self.customDtRecord.push({data: data5})
            } else {
              var dt = []
              self.customDtRecord.push({data: dt})
            }
          })
          // console.log('customDtRecord', self.customDtRecord)
          _.forEach(this.targetSchemaEntity, function (ent) {
            if (!ent.customtype) {
              self.cascadDt.push({label: ent.name, value: ent.name, children: []})
            } else {
              var _child = self.getChildren(ent.type)
              // console.log('_child', _child)
              self.cascadDt.push({label: ent.name, value: ent.name, children: _child})
            }
          })
          self.cascadDt.push({label: 'Custom', value: -1, children: []})
        }
      }
    },
    getChildren (id) {
      var self = this
      let child = []
      schema.getThis(id).then((res) => {
        _.forEach(res.data.entity, function (e, i) {
          if (e.customtype) {
            var s = self.getChildren(e.type)
            child.push({label: e.name, value: e.name, children: s})
          } else {
            child.push({label: e.name, value: e.name, children: []})
          }
        })
      })
      return child
    },
    saveMapping (name) {
      var self = this
      this.$refs[name].validate((valid) => {
        if (valid && !this.checkTitleStatus) {
          // console.log(this.formMapping)
          schemamapping.post(this.formMapping)
            .then(response => {
              this.$Notice.success({title: 'Success!!', desc: 'Mapping Saved...'})
              this.$router.go(-1)
            })
            .catch(error => {
              console.log(error)
              this.$Notice.error({title: 'Error!!', desc: 'Mapping Not Saved...'})
            })
        } else {
          // this.$Message.error('Error!')
        }
      })
      self.resetMapTemp()
    },
    resetForm () {
      this.resetData()
      this.fetch(this.rid)
      this.resetMapTemp()
    },
    resetMapTemp () {
      // alert('resetmap')
      var self = this
      _.forEach(self.$store.state.mappingTemp, function (obj, index) {
        if (obj.producer === self.rid) {
          // console.log('#### producer ####', index)
          self.$store.dispatch('delThisMapTemp', {index: index})
        }
      })
    }
  },
  watch: {
    '$route.params.id' (newId, oldId) {
      this.fetch(newId)
    }
  }
}
</script>
<style scoped>
  .CodeMirror{
    min-height: 80vh;
  }
  .InpurError {
    position: absolute;
    top: 100%;
    left: 0;
    line-height: 1;
    padding-top: 6px;
    color: #ed3f14;
  }
</style>