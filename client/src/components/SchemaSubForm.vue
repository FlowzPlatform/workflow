<template>
  <div class="SchemaSubForm">
  	<div v-for="(item, index) in schemainstance.data" :key="index">
      <Form ref="formSchema" :model="schemainstance" style="padding: 5px 0">
        <Row class="ui-card">
            <div v-for="(field,inx) in schemainstance.entity">
                <template v-if="field.customtype">
                    <Col :span="24" style="margin-bottom: 20px;" :id="field.name">
                        <FormItem :key="inx" style="margin-bottom:10px;">
                            <Row style="font-size:16px">
                                <span class="card-title">{{field.name}}</span>
                            </Row>
                            <Row v-if="field.property.IsArray">
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                                <Button class="btnAdd" @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus-round"> <i class="fa fa-plus"></i> Add ({{field.name}})</Button>
                            </Row>
                            <Row v-else>
                                <schemasubform :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubform>
                            </Row>
                        </FormItem>
                    </Col>
                </template>
                <template v-else>
                    <Col :span="12" style="padding:0px 20px 0px 2px" v-if="field.type !== 'file'">
                        <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                            <Row>
                                <Col :span="4">
                                    <b class="field-label">{{field.name}}</b>
                                </Col>
                                <Col :span="20">
                                    
                                    <Input v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0)?field.property.min : -Infinity"></Input>
                                    
                                    <InputNumber v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></InputNumber>
                                    
                                    <DatePicker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name"></DatePicker>
                                    
                                    <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name">
                                        <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                                    </Select>
                                    <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]">{{field.name}}</Checkbox>

                                    <!-- <dynamicinput :type="(field.type) ? field.type : null" :bindmodel="(schemainstance.data[index][field.name]) ? schemainstance.data[index][field.name] : null " :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0) ? field.property.min : -Infinity" :max="(field.property.max > 0) ? field.property.max : Infinity" :options="(field.property.options) ? field.property.options : null" :field="field"></dynamicinput> -->
                                </Col>
                            </Row>
                        </FormItem>
                    </Col>
                    <Col :span="24" style="padding:0px 20px 0px 2px" v-else>
                        <FormItem :key="inx" :rules="createRules(field)" style="margin-bottom:10px;">
                            <Row>
                                <Col :span="2">
                                    <!-- <b>{{field.name}}</b> -->
                                </Col>
                                <Col :span="22">
                                    <input class="form-control" type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false" />
                                    <div v-if="schemainstance.data[index][field.name + 'List']">
                                        <div class="list-group" v-for="val in schemainstance.data[index][field.name + 'List']" style="margin-bottom:0px;">
                                            <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 15px;">{{val}}</a>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </FormItem>
                    </Col>
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
import SchemaSubForm from './SchemaSubForm'
import axios from 'axios'
import moment from 'moment'
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
      jumperLinks: []
    }
  },
  components: {
    'schemasubform': SchemaSubForm
  },
  methods: {
    handleFileChange (e, index, fieldName) {
      let self = this
      var files = e.target.files || e.dataTransfer.files
      let allFiles = []
      if (files.length > 0) {
        // console.log('files', files[0])
        for (let i = 0; i < files.length; i++) {
          let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses' } })
          var params = {
            Key: moment().valueOf().toString() + i + files[i].name,
            ContentType: files[i].type,
            Body: files[i]
          }
          bucket.upload(params).on('httpUploadProgress', function (evt) {
            console.log('Uploaded :: ' + parseInt((evt.loaded * 100) / evt.total) + '%')
          }).send(function (err, data) {
            if (err) {
              alert(err)
            } else {
              allFiles.push(data.Location)
            }
          })
        }
      }
      self.schemainstance.data[index][fieldName] = allFiles
    },
    getValidationProps (index, fieldName) {
      return 'data[' + index + '][' + fieldName + ']'
    },
    async getChildData (id) {
      // alert(id)
      var arrObj = []
      var self = this
      await axios.get('https://api.flowzcluster.tk/eng/schema/' + id)
        .then(async (response) => {
          var _res = response.data
          var obj = {}
          // obj.id = self.getGuid();  // for guid for perticular row
          // obj.database = _res.database
          // obj.Schemaid = _res._id
          for (let v of _res.entity) {
            if (v.customtype) {
              // console.log('child', self.getChildData(v.type))
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
          // console.log('response', arrObj)
        })
        .catch(error => {
          console.log('Error: ', error)
        })
      return arrObj
    },
    getObject (eIndex, dataIndex, fname, ftype) {
      // console.log('get object: ', fname)
      var obj = {}
      obj.data = this.schemainstance.data[dataIndex][fname]
      // console.log('this.schemainstance.entity[eIndex]', this.schemainstance.entity[eIndex])
      obj.entity = this.schemainstance.entity[eIndex].entity[0].entity
      let indexx = $.inArray(fname, this.jumperLinks)
      if (indexx === -1) {
        this.jumperLinks.push(fname)
      }
      console.log('recursive obj', obj)
      return obj
    },
    async handleAdd (eIndex, dataIndex, ent, data, fname) {
      console.log('Called')
      // console.log('Data', data, ent)
      var self = this
      // console.log('self.$refs', self.$refs['formSchema'])
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
      // obj.id = this.getGuid();
      // alert(ent.database)
      // obj.database = ent.database
      // obj.Schemaid = ent._id
      // console.log("###########: ", ent);
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
      this.schemainstance.data[dataIndex][fname].push(obj)
      console.log('schemainstance: ', this.schemainstance.data)
    },
    // getGuid () {
    //   return (this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0,3) + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4()).toLowerCase()
    // },
    // S4() {
    //     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    // },
    getObjectType (type) {
      return ['text', 'email', 'number', 'phone', 'boolean', 'date', 'dropdown', 'file'].indexOf(type) === -1
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
            if (value.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
              callback()
            } else {
              callback(new Error('Please input phone no'))
            }
          }
        })
      }
      if (row.property.optional === false) {
        rules.push({required: true, message: 'This field is required.', trigger: 'blur'})
      }
      if (row.property.min > 0 && row.type === 'text') {
        rules.push({ type: 'string', min: row.property.min, message: 'min' + row.property.min + ' length req' })
      }
      if (row.property.max > 0 && row.type === 'text') {
        rules.push({ type: 'string', max: row.property.max, message: 'max length ' + row.property.max + ' required.' })
      }
      if (row.property.allowedValue.length > 0) {
        rules.push({type: 'enum', enum: row.property.allowedValue})
      }
      // console.log('rules', rules)
      return rules
    },
    handleEdit (row) {
      console.log(row)
    },
    handleRemove (index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.schemainstance.data.splice(index, 1)
        },
        onCancel: () => {
        }
      })
    }
  },
  mounted () {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  },
  created () {
    console.log('created >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

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
