<template>
  <div class="SchemaSubFormView">
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
                                <schemasubformView :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubformView>
                            </Row>
                            <Row v-else>
                                <schemasubformView :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubformView>
                            </Row>
                        </FormItem>
                    </Col>
                </template>
                <template v-else>
                    <Col :span="12" style="padding:0px 20px 0px 2px" v-if="field.type !== 'file'">
                        <FormItem :key="inx" style="margin-bottom:10px;">
                            <Row>
                                <Col :span="4">
                                    <b class="field-label">{{field.name}}</b>
                                </Col>
                                <Col :span="20">
                                    
                                    <label v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0)?field.property.min : -Infinity"></label>
                                    
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
                        <FormItem :key="inx" style="margin-bottom:10px;">
                            <Row>
                                <Col :span="2">
                                    <!-- <b>{{field.name}}</b> -->
                                </Col>
                                <Col :span="22">
                                    <label class="form-control" type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false" />
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
        </Row>
      </Form>
    </div>
  </div>
</template>

<script>

import $ from 'jquery'
import SchemaSubFormView from './SchemaSubFormView'
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
  name: 'schemasubformView',
  props: ['schemainstance'],
  data () {
    return {
      jumperLinks: []
    }
  },
  components: {
    'schemasubformView': SchemaSubFormView
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
          console.log('Error: ', error)
        })
      return arrObj
    },
    getObject (eIndex, dataIndex, fname, ftype) {
      var obj = {}
      obj.data = this.schemainstance.data[dataIndex][fname]
      obj.entity = this.schemainstance.entity[eIndex].entity[0].entity
      let indexx = $.inArray(fname, this.jumperLinks)
      if (indexx === -1) {
        this.jumperLinks.push(fname)
      }
      return obj
    },
    getObjectType (type) {
      return ['text', 'email', 'number', 'phone', 'boolean', 'date', 'dropdown', 'file'].indexOf(type) === -1
    }
  },
  mounted () {
    // setTimeout(() => {
    //   console.log('HTML CONTENT', this.$el.outerHTML)
    // }, 5000)
  },
  created () {
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
