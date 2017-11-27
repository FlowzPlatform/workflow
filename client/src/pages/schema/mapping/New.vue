<template>
  <div class="SchemaMapping">
    <h5>Schema Mapping</h5>
    <Row style="padding:20px;">
        <Form ref="formMapping" :model="formMapping" :rules="ruleMapping" inline>
          <Row>
            <FormItem :label-width="75" prop="title" label="Title">
                <Input type="text" v-model="formMapping.title" placeholder="Title"></Input>
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
          <!-- {{sourceSchemaEntity}} -->
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
                                      <span style="float:right">{{ent.customtype}}</span>
                                    </div>
                                  </td>
                                  <td class="">
                                  <!-- {{formMapping.MapData}} -->
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
    <!-- <hr><hr><hr><hr><hr><hr>
    <div>TEMP:  {{$store.state.mappingTemp}}</div>
    <hr><hr><hr><hr><hr><hr>
    <div> FORMMAPPING:  {{formMapping}}</div> -->
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
      // code: '',
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
      testStoreAvail: {}
    }
  },
  async mounted () {
    console.log('Calling..1', this.formMapping.MapData)
    let schemaId = (this.$route.params.id !== '') ? this.$route.params.id : this.$route.params.mappingid
    let fetchData = await this.fetch(schemaId)
    console.log('fetchData', fetchData)
    var mappingId = this.$route.params.mappingid
    if (mappingId && schemaId && mappingId !== schemaId) {
      let schemaMappingData = await schemamapping.get(mappingId)
      let mappingData = schemaMappingData.data
      this.formMapping.mappingId = mappingId
      this.formMapping.title = mappingData.title
      this.formMapping.notes = mappingData.notes
      this.formMapping.consumer = mappingData.consumer
      this.formMapping.MapData = mappingData.MapData
      // let MapDataArray = []
      // if (Array.isArray(mappingData.MapData) && mappingData.MapData.length) {
      //   mappingData.MapData.forEach(function (mapdata, index) {
      //     let mappingObj = {
      //       consumerField: mapdata.consumerField,
      //       producerField: mapdata.producerField,
      //       transform: mapdata.transform,
      //       ctype: mapdata.ctype
      //     }
      //     MapDataArray.push(mappingObj)
      //   })
      //   this.formMapping.MapData = MapDataArray
      // }
    }
    console.log('Calling..2', this.formMapping.MapData)
  },
  methods: {
    saveTostore (nPath) {
      // alert('saveTostore')
      var self = this
      // console.log('before', this.formMapping, this.rid, nPath)
      // console.log('Temp storee Dt111111111111: ', this.$store.state.mappingTemp)
      // console.log('id', this.$route.params.id, Id)
      var mapTemp = this.$store.state.mappingTemp
      var flag = false
      _.forEach(mapTemp, function (obj, index) {
        console.log('#### producer ####', obj.producer)
        if (obj.producer === self.rid) {
          // alert('match' + index + JSON.stringify(obj))
          // self.$store.state.mappingTemp[index] = self.formMapping
          flag = true
        }
      })
      if (!flag) {
        // self.$store.state.mappingTemp.push(self.formMapping)
        // alert('Not_Found' + JSON.stringify(self.formMapping))
      }
      this.$store.dispatch('getMapTemp', {data: self.formMapping, status: flag})
      // setTimeout(function () {
        // alert('Routee')
        // self.$router.push('/schema-mapping/' + nPath + '/new')
      window.location.href = '/schema-mapping/' + nPath + '/new'
      // }, 10000)
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
    fetch (id) {
      var self = this
      this.rid = id
      self.resetData()
      return schema.get().then((response) => {
        // console.log('mapping', this.formMapping)
        // console.log('response from fetch', response)
        // var _formMapping = {}
        self.allSchema = response.data
        self._sourceSchema = _.find(self.allSchema, {_id: self.rid})
        self.sourceSchemaEntity = self._sourceSchema.entity
        // console.log('this.sourceSchemaEntity', this.sourceSchemaEntity)
        self.SourceOptionDt.push({value: self._sourceSchema._id, label: self._sourceSchema.title})
        self.formMapping.producer = self._sourceSchema._id
        self._targetSchema = self.allSchema // _.reject(self.allSchema, {_id: self.rid})
        self.TargetOptionDt = _.map(self._targetSchema, (m) => {
          return {value: m._id, label: m.title}
        })

        var checkDt = _.find(this.$store.state.mappingTemp, { 'producer': self.rid })
        // console.log('checkDt', JSON.stringify(checkDt))
        // for already try a new map for this instance
        if (checkDt !== undefined) {
          self.testStoreAvail = checkDt
          // console.log(checkDt.MapData, JSON.stringify(checkDt.MapData))
          // self.formMapping = checkDt
          self.formMapping.title = checkDt.title
          self.formMapping.notes = checkDt.notes
          self.mapStart(checkDt.consumer)
          // self.formMapping.MapData[1].transform = 123333
        } else {
          self.testStoreAvail = {}
        }
      })
    },
    resetData () {
      // alert('reset')
      this.SourceOptionDt = []
      this.TargetOptionDt = []
      this.formMapping.MapData = []
      this.formMapping.consumer = ''
      // this.formMapping.producer = ''
      this.formMapping.notes = ''
      this.formMapping.title = ''
      this._sourceSchema = {}
      this._targetSchema = []
      this.sourceSchemaEntity = []
      this.targetSchemaEntity = []
      this.cascadDt = []
      this.customDtRecord = []
    },
    mapStart (value) {
      var self = this
      // console.log('...........', this.testStoreAvail.consumer)
      if (this.testStoreAvail.consumer) {
        console.log('add')
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
        if (!self.$route.params.mappingid) {
          self.formMapping.MapData = []
        }
        self.customDtRecord = []
        self.cascadDt = []
        self.targetSchemaEntity = (_.find(self._targetSchema, {_id: self.formMapping.consumer})).entity
        _.forEach(self._sourceSchema.entity, function (ent, index) {
          if (!self.$route.params.mappingid) {
            self.formMapping.MapData.push({producerField: ent.name, consumerField: [], transform: '', ctype: ent.customtype})
          }
          if (ent.customtype) {
            var data5 = []
            schemamapping.get()
            .then(response => {
              console.log('response', response.data.data, ent.type)
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
    },
    getChildren (id) {
      var self = this
      let child = []
      schema.getThis(id).then((res) => {
        // console.log('ssf', res)
        _.forEach(res.data.entity, function (e, i) {
          // alert(e.customtype)
          if (e.customtype) {
            var s = self.getChildren(e.type)
            child.push({label: e.name, value: e.name, children: s})
          } else {
            child.push({label: e.name, value: e.name, children: []})
          }
        })
        // console.log('AAAAAAAA')
      })
      return child
    },
    saveMapping (name) {
      var self = this
      this.$refs[name].validate(async(valid) => {
        if (valid) {
          let actionResponse
          // remove non-selected mapping fields
          // for (var i = 0; i < this.formMapping.MapData.length; i++) {
          //   if (this.formMapping.MapData[i].consumerField.length < 1) {
          //     this.formMapping.MapData.splice(i, 1)
          //   }
          // }
          console.log(this.formMapping)
          if (this.formMapping.hasOwnProperty('mappingId')) {
            actionResponse = await schemamapping.update(this.formMapping, this.formMapping.mappingId)
          } else {
            actionResponse = await schemamapping.post(this.formMapping)
          }
          if (actionResponse.status === 'success') {
            this.$Notice.success({duration: 3, title: 'Success!!', desc: actionResponse.message})
            this.$router.push('/schema/' + this.$route.params.id + '/mapping/')
          } else {
            this.$Notice.error({duration: 3, title: 'Error!!', desc: actionResponse.message})
          }
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
</style>