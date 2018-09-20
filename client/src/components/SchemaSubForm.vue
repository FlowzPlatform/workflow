<template>
  <div class="SchemaSubForm">
  	<div v-for="(item, index) in schemainstance.data" :key="index">
      <Form ref="formSchema" :model="schemainstance" style="padding: 5px 0">
        <Row class="ui-card">
            <div v-for="(field,inx) in schemainstance.entity">
                <template v-if="field.customtype">
                  <div v-if="schemainstance.hasOwnProperty('permission')">
                    <div v-if="schemainstance.permission[field.name].write || schemainstance.permission[field.name].read">
                      <div v-if="schemainstance.permission[field.name].write">
                        <Col :span="24" style="margin-bottom: 20px;" :id="field.name">
                          <FormItem :key="inx" style="margin-bottom:10px;">
                              <Row style="font-size:16px">
                                  <span class="card-title">{{field.name}}</span>
                                  
                              </Row>
                              <Row v-if="field.property.IsArray">
                                  <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                  <Button class="btnAdd" @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus"> Add ({{field.name}})</Button>
                              </Row>
                              <Row v-else>
                                  <SchemaSubFormView :schemainstance="getObject(inx, index, field.name, field.type)"></SchemaSubFormView>
                              </Row>
                          </FormItem>
                        </Col>
                      </div>
                      <div v-else>
                        <Col :span="24" style="margin-bottom: 20px;" :id="field.name">
                          <FormItem :key="inx" style="margin-bottom:10px;">
                              <Row style="font-size:16px">
                                  <span class="card-title">{{field.name}}</span>
                              </Row>
                              <SchemaSubFormView :schemainstance="getObject(inx, index, field.name, field.type)"></SchemaSubFormView>
                          </FormItem>
                        </Col>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <Col :span="24" style="margin-bottom: 20px;" :id="field.name">
                        <FormItem :key="inx" style="margin-bottom:10px;">
                            <Row style="font-size:16px">
                                <span class="card-title">{{field.name}}</span>
                            </Row>
                            <Row v-if="field.property.IsArray">
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                <Button class="btnAdd" @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus"> Add ({{field.name}})</Button>
                            </Row>
                            <Row v-else>
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                
                            </Row>
                        </FormItem>
                    </Col>
                  </div>
                  <!-- <div v-if="schemainstance.permission === null">
                    <Col :span="24" style="margin-bottom: 20px;" :id="field.name">
                        <FormItem :key="inx" style="margin-bottom:10px;">
                            <Row style="font-size:16px">
                                <span class="card-title">{{field.name}}</span>
                            </Row>
                            <Row v-if="field.property.IsArray">
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                <Button class="btnAdd" @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus"> Add ({{field.name}})</Button>
                            </Row>
                            <Row v-else>
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                
                            </Row>
                        </FormItem>
                    </Col>
                  </div> -->
                </template>
                <template v-else>
                  <div v-if="schemainstance.hasOwnProperty('permission')">
                      <div v-if="schemainstance.permission[field.name].write || schemainstance.permission[field.name].read">
                        <Col :span="12" style="padding:0px 20px 0px 2px" v-if="field.type !== 'file'">
                            <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                                <Row>
                                  <div v-if="schemainstance.permission[field.name].write">
                                    <Col :span="8" style="text-align: right; padding-right: 10px; padding-top: 10px;">
                                        <b class="field-label">{{field.name}}</b>
                                        <!-- {{schemainstance.permission[field.name]}} -->
                                    </Col>
                                    <Col :span="16" style="padding-top: 10px;">
                                        <Input v-if="field.type == 'textarea'" v-model="schemainstance.data[index][field.name]" type="textarea" :rows="schemainstance.data[index][field.numberoflines]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"/>
                                        <Input v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                        <Input v-if="field.type == 'currentuser'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                        <Input v-if="field.type == 'currenttime'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                        
                                        <InputNumber v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></InputNumber>
                                        
                                        <DatePicker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name"></DatePicker>
                                      
                                        <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name">
                                            <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                                        </Select>

                                        <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]"></Checkbox>
                                        <!-- <dynamicinput :type="(field.type) ? field.type : null" :bindmodel="(schemainstance.data[index][field.name]) ? schemainstance.data[index][field.name] : null " :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0) ? field.property.min : -Infinity" :max="(field.property.max > 0) ? field.property.max : Infinity" :options="(field.property.options) ? field.property.options : null" :field="field"></dynamicinput> -->
                                    </Col>
                                  </div>
                                  <div v-else>
                                    <Col :span="8" style="text-align: right; padding-right: 10px; padding-top: 10px;">
                                        <b class="field-label">{{field.name}}</b>
                                    </Col>
                                    <Col :span="16" style="padding-top: 10px;">
                                      {{schemainstance.data[index][field.name]}}
                                    </col>
                                  </div>
                                 </Row>
                            </FormItem>
                        </Col>
                        <Col :span="24" style="padding:0px 20px 0px 2px" v-else>
                            <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                                <Row>
                                  <div v-if="schemainstance.permission !== undefined">
                                    <!-- {{schemainstance.permission[field.name]}} -->
                                    <div v-if="schemainstance.permission[field.name].write  || schemainstance.permission[field.name].read">
                                      <div v-if="schemainstance.permission[field.name].write">
                                        <Col :span="2">
                                            <b>{{field.name}}</b>
                                        </Col>
                                        <Col :span="21" >
                                            <input class="form-control" type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false"/>
                                            <div v-if="schemainstance.data[index][field.name]" >
                                              <Progress v-if="stratProgress"  v-bind:percent="fileUploadProgress" :success-percent="30" />
                                              <div class="" v-for="(val, i) in schemainstance.data[index][field.name]">
                                                    <Row>
                                                        <Col :span="23"> <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 2px;" >{{val}}</a></Col>
                                                        <Col :span="1"  v-if="i >= oldFiles"><a href="#" style="color:red;float:right"  @click="removeSection(i, schemainstance.data[index][field.name])">&#10005;&nbsp;</a></Col>
                                                    </Row>          
                                                </div>
                                            </div>
                                        </Col>
                                        <Col :span="1">&nbsp;&nbsp;{{fileNumber}} / {{fileSize}}</Col>
                                      </div>
                                      <div v-else>
                                        <Col :span="2">
                                            <b>{{field.name}}</b>
                                        </Col>
                                        <Col :span="21" >
                                            <!-- <input class="form-control" type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false"/> -->
                                            <div v-if="schemainstance.data[index][field.name]" >
                                              <Progress v-if="stratProgress"  v-bind:percent="fileUploadProgress" :success-percent="30" />
                                              <div class="" v-for="(val, i) in schemainstance.data[index][field.name]">
                                                    <Row>
                                                        <Col :span="23"> <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 2px;" >{{val}}</a></Col>
                                                        <!-- <Col :span="1"><a href="#" style="color:red;float:right"  @click="removeSection(i, schemainstance.data[index][field.name])">&#10005;&nbsp;</a></Col> -->
                                                    </Row>          
                                                </div>
                                            </div>
                                        </Col>
                                        <!-- <Col :span="1">&nbsp;&nbsp;{{fileNumber}} / {{fileSize}}</Col> -->
                                      </div>
                                    </div>
                                  </div>
                                </Row>
                            </FormItem>
                        </Col>
                      </div>
                  </div>
                  <div v-else>
                    <Col :span="12" style="padding:0px 20px 0px 2px" v-if="field.type !== 'file'">
                          <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                              <Row>
                                <Col :span="8" style="text-align: right; padding-right: 10px; padding-top: 10px;">
                                    <b class="field-label">{{field.name}}</b>
                                </Col>
                                <Col :span="16" style="padding-top: 10px;">
                                    <Input v-if="field.type == 'textarea'" v-model="schemainstance.data[index][field.name]" type="textarea" :rows="schemainstance.data[index][field.numberoflines]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"/>
                                    <Input v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                    <Input v-if="field.type == 'currentuser'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                    <Input v-if="field.type == 'currenttime'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :max="(field.property.max > 0)?field.property.max : Infinity"></Input>
                                    
                                    <InputNumber v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></InputNumber>
                                    
                                    <DatePicker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name"></DatePicker>
                                  
                                    <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name">
                                        <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                                    </Select>

                                    <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]"></Checkbox>
                                    <!-- <dynamicinput :type="(field.type) ? field.type : null" :bindmodel="(schemainstance.data[index][field.name]) ? schemainstance.data[index][field.name] : null " :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0) ? field.property.min : -Infinity" :max="(field.property.max > 0) ? field.property.max : Infinity" :options="(field.property.options) ? field.property.options : null" :field="field"></dynamicinput> -->
                                </Col>
                              </Row>
                          </FormItem>
                      </Col>
                      <Col :span="24" style="padding:0px 20px 0px 2px" v-else>
                        <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                            <Row>
                                <Col :span="2">
                                    <b>{{field.name}}</b>
                                </Col>
                                <Col :span="21" >
                                    <input class="form-control" type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false"/>
                                    <div v-if="schemainstance.data[index][field.name]" >
                                      <Progress v-if="stratProgress"  v-bind:percent="fileUploadProgress" :success-percent="30" />
                                      <div class="" v-for="(val, i) in schemainstance.data[index][field.name]">
                                            <Row>
                                                <Col :span="23"> <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 2px;" >{{val}}</a></Col>
                                                <Col :span="1" v-if="i >= oldFiles"><a href="#" style="color:red;float:right"  @click="removeSection(i, schemainstance.data[index][field.name])">&#10005;&nbsp;</a></Col>
                                            </Row>          
                                        </div>
                                    </div>
                                </Col>
                                <Col :span="1">&nbsp;&nbsp;{{fileNumber}} / {{fileSize}}</Col>
                            </Row>
                        </FormItem>
                    </Col>
                    </div>
                </template> 
            </div>

            <div v-if="index != 0" style="float:right">
                <a @click="handleRemove(index)" class="btnDelete">
                    <!-- <i-icon type="trash-a" style="color:#e74c3c" size="20"></i-icon> -->
                    <i class="fa fa-minus"></i>
                </a>
            </div>
        </Row>
      </Form>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import moment from 'moment'
import _ from 'lodash'
import schemaModel from '@/api/schema'
// let jumperLinks = [];
var AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.accesskey,
  secretAccessKey: process.env.secretkey
})
AWS.config.region = 'us-west-2'
export default {
  name: 'schemasubform',
  props: ['schemainstance'],
  data () {
    return {
      fileNumber: 0,
      fileSize: 0,
      fileUploadProgress: 0,
      stratProgress: false,
      jumperLinks: [],
      oldFiles: 0
    }
  },
  components: {
    schemasubform: (resolve) => { require(['./SchemaSubForm'], resolve) },
    SchemaSubFormView: (resolve) => { require(['./SchemaSubFormView'], resolve) }
  },
  methods: {
    async handleFileChange (e, index, fieldName) {
      let self = this
      var files = e.target.files || e.dataTransfer.files
      let allFiles = []
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          self.stratProgress = true
          self.fileSize = files.length
          let abc = await this.uploadToAWS(files[i], i)
          allFiles.push(abc)
        }
      }
      self.schemainstance.data[index][fieldName] = _.concat(self.schemainstance.data[index][fieldName], allFiles)
    },
    uploadToAWS (file, i) {
      let self = this
      return new Promise((resolve, reject) => {
        let bucket = new AWS.S3({
          params: { Bucket: 'airflowbucket1/obexpense/expenses' }
        })
        var params = {
          Key:
            moment()
              .valueOf()
              .toString() +
            i +
            file.name,
          ContentType: file.type,
          Body: file
        }
        bucket
          .upload(params)
          .on('httpUploadProgress', function (evt) {
            self.fileUploadProgress = parseInt(evt.loaded * 100 / evt.total)
          })
          .send(function (err, data) {
            if (err) {
              alert(err)
              reject(err)
            } else {
              self.fileNumber = i + 1
              self.fileUploadProgress = 0
              self.stratProgress = false
              resolve(data.Location)
            }
          })
      })
    },
    removeSection: function (index, imgarray) {
      imgarray.splice(index, 1)
    },
    getValidationProps (index, fieldName) {
      return 'data[' + index + '][' + fieldName + ']'
    },
    async getChildData (id) {
      var arrObj = []
      var self = this
      await schemaModel.get(id)
        .then(async (response) => {
          var _res = response.data
          var obj = {}
          // obj.id = self.getGuid()  // for guid for perticular row
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
                if (
                  v.property.defaultValue !== '' ||
                  v.property.defaultValue === 'true'
                ) {
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
          console.log('Error: ', error)
        })
      return arrObj
    },
    getObject (eIndex, dataIndex, fname, ftype) {
      // console.log('get obj called: ', dataIndex)
      var obj = {}
      obj.data = this.schemainstance.data[dataIndex][fname]
      obj.entity = this.schemainstance.entity[eIndex].entity[0].entity
      let indexx = $.inArray(fname, this.jumperLinks)
      if (indexx === -1) {
        this.jumperLinks.push(fname)
        this.$emit('updateJumperList', this.jumperLinks)
      }
      return obj
    },
    async handleAdd (eIndex, dataIndex, ent, data, fname) {
      var self = this
      // var self.$refs['formSchema'][0].validate()
      // self.$refs['formSchema'][0].validate((valid) => {
      //   alert(1)
      //   if (valid) {
      //     this.$Message.success('Success!')
      //   } else {
      //     this.$Message.error('Error!')
      //   }
      // })
      var obj = {}
      // obj.id = this.getGuid()
      // alert(ent.database)
      // obj.database = ent.database
      // obj.Schemaid = ent._id
      for (let v of ent.entity) {
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
            if (
              v.property.defaultValue !== '' ||
              v.property.defaultValue === 'true'
            ) {
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
      this.schemainstance.data[dataIndex][fname].push(obj)
    },
    // getGuid () {
    //   return (this.S4() + this.S4() + '-' + this.S4() + '-4' + this.S4().substr(0,3) + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4()).toLowerCase()
    // },
    // S4() {
    //     return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
    // },
    getObjectType (type) {
      return (
        [
          'text ',
          'email ',
          'number ',
          'phone ',
          'boolean ',
          'date ',
          'dropdown ',
          'file '
        ].indexOf(type) === -1
      )
    },
    createRules (row) {
      let rules = []
      if (row.type === 'email') {
        rules.push({ type: 'email', message: 'This field is email type.' })
      }
      if (row.type === 'phone') {
        rules.push({
          type: 'number',
          validator: (rule, value, callback) => {
            if (!value) {
              return callback(new Error('Please input the value'))
            }
            if (
              value.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
            ) {
              callback()
            } else {
              callback(new Error('Please input phone no'))
            }
          }
        })
      }
      if (row.property.optional === false) {
        rules.push({
          required: true,
          message: 'This field is required.',
          trigger: 'blur'
        })
      }
      if (row.property.min > 0 && row.type === 'text') {
        rules.push({
          type: 'string',
          min: row.property.min,
          message: 'min' + row.property.min + ' length req'
        })
      }
      if (row.property.max > 0 && row.type === 'text') {
        rules.push({
          type: 'string',
          max: row.property.max,
          message: 'max length ' + row.property.max + 'required.'
        })
      }
      if (row.property.allowedValue.length > 0) {
        rules.push({ type: 'enum', enum: row.property.allowedValue })
      }
      return rules
    },
    handleEdit (row) {},
    handleRemove (index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.schemainstance.data.splice(index, 1)
        },
        onCancel: () => {}
      })
    }
  },
  mounted () {
    this.oldFiles = this.schemainstance.data[0].Fileattachment.length
  },
  created () {}
}
</script>
<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.ui-card {
  background-color: #fff;
  box-shadow: 0px 0px 25px #dadada;
  border-radius: 10px;
  padding: 10px 20px;
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
  position: relative;
  z-index: 999;
}

.btnAdd {
  background-color: #53cae8;
  border-radius: 50px;
  font-size: 14px;
  text-transform: uppercase;
  color: #fff;
  border: none;
  font-style: italic;
}

.btnAdd:hover {
  background-color: #83d5ea;
  color: #fff;
}

.btnDelete {
  font-size: 14px;
  border-radius: 50px;
  color: #fff !important;
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #ff0000;
  width: 20px;
  height: 20px;
}

.btnDelete i {
  position: absolute;
  top: 4px;
  left: 5px;
}

.field-label {
  text-transform: capitalize;
}

.formTitle {
  text-transform: capitalize;
}

.jumper-links {
  list-style: none;
  font-size: 14px;
}

.jumper-links a {
  text-decoration: none;
  /*color: #53cae8;*/
  text-align: left;
  font-weight: bold;
  text-transform: capitalize;
}

.fixed-div {
  position: fixed;
  right: 0;
}

.badge {
  background-color: green;
  border: 1px solid black;
  padding: 2px;
  transition: 1s;
}

<style>
  .ivu-form-item-content{
    line-height: 15px !important;
  }

  /*.ivu-table td:nth-child(2){
    padding-left: 10px;
  }*/
</style>
