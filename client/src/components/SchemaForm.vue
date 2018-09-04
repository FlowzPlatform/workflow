<template>
  <div class="schema-form"   style="">
    <!-- {{schemainstance.data}} -->
    <div v-for="(item, index) in schemainstance.data" :key="index" style="">
      <!-- {{schemainstance.data}} -->
      <Form ref="formSchema" :model="schemainstance" style="border:2px solid rgb(147, 180, 216);padding: 5px">
        <Row>
        <!-- :model="item"  -->
        <!-- <div style="cursor:-webkit-grabbing;">
            <Icon type="android-more-vertical" size="18"></Icon>
            <Icon type="android-more-vertical" size="18"></Icon>
        </div> -->

        <!-- <span v-if="item.data != undefined">
          <Form-item v-for="(field,inx) in item.entity" :key="inx" :prop="'entity.'+inx+'.value'" :show-message="true">  -->
            <!-- :rules="createRules(field)" -->
           <!--  <Input v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="item.data.options[0].Email" type="text" :placeholder="field.name"></Input>
            <Input-number v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="field.value" :type="field.type" :placeholder="field.name"></Input-number>
            <Date-picker v-if="field.type == 'date'" type="date" v-model="field.value" format="MM-dd-yyyy" :placeholder="field.name"></Date-picker>
            <Select v-if="field.type == 'dropdown'" v-model="field.value">
              <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
            </Select> -->
            <!-- <schema-form v-if="getObjectType(field.type)" :schema="schema.schema"></schema-form> -->
        <!-- </Form-item> -->
      <!--   </span> -->
        <!-- <span> -->
        <!-- v-else -->
        <!-- 'data.' + inx + '.' + field.name -->  <!-- schemainstance.data[index][field.name] -->
          <div v-for="(field,inx) in schemainstance.entity">
            <template v-if="field.customtype">
            <Col :span="24">
              <FormItem 
                :key="inx"
                style="margin-bottom:10px;"
                >
                <Row style="font-size:16px">
                  <b><u>{{field.name}}</u></b>
                </Row>
                <!-- <div style=""> -->
                  <Row v-if="field.property.IsArray">
                    <schema-form  :schemainstance="getObject(inx, index, field.name, field.type)"></schema-form>
                    <!-- {{val}} -->
                    <Button type="dashed" long @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus-round" style="float:right">Add ({{field.name}})</Button>
                  </Row>
                  <Row v-else>
                      <schema-form  :schemainstance="getObject(inx, index, field.name, field.type)"></schema-form>
                  </Row>
                <!-- </div> -->
              </FormItem>
            </Col>
            </template>
            <!-- :prop="'data[' + index + '][' + field.name + ']'" -->
                <!-- :show-message="true" -->
            <template v-else>
              <Col :span="12" style="padding:0px 2px 0px 2px" v-if="field.type !== 'file'">
                <FormItem 
                  :key="inx"
                  :rules="createRules(field)"
                  style="margin-bottom:10px;"
                  >
                  <Row>
                    <Col :span="4">
                      <b>{{field.name}}</b>
                    </Col>
                    <Col :span="20" >
                      <Input v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0)?field.property.min : -Infinity"></Input>
                      <!-- </div> -->
                      <Input-number v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></Input-number>
                      <DatePicker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name"></DatePicker>
                      <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name">
                        <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                      </Select>
                      <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]">{{field.name}}</Checkbox>
                      <!-- <input type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false"/> -->
                    </Col>
                  </Row>
                  <!-- <div style="border: 1px solid red"> -->
                </FormItem>
              </Col>
              <Col :span="24" style="padding:0px 2px 0px 2px" v-else>
                <FormItem
                :key="inx"
                :rules="createRules(field)"
                style="margin-bottom:10px;"
                >
                  <Row>
                    <Col :span="2">
                      <b>{{field.name}}</b>
                    </Col>
                    <Col :span="22">
                      <input type="file" v-if="field.type == 'file'" @change="handleFileChange($event, index, field.name)" :multiple="(field.property.isMultiple)? field.property.isMultiple: false"/>
                      <div v-if="schemainstance.data[index][field.name + 'List']">
                        <div class="list-group" v-for="val in schemainstance.data[index][field.name + 'List']" style="margin-bottom:0px;">
                            <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 15px;">{{val}}</a>
                           <div class="list-group" v-for="val in schemainstance.data[index][field.name]" style="margin-bottom:0px;">
                                            <a :href="val" class="list-group-item" target="_blank" style="color:blue;padding:2px 12px;" >{{val}}</a>
                                            <a href="#" style="color:red">&#10005;</a>
                                            <!-- {{val}} -->
                                        </div>                      
                        </div>

                      </div>
                      <!-- <div>{{schemainstance.data[index][field.name + 'List']}}</div> -->
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </template>
          </div>
          
        <!-- </span> -->
        <!-- <Form-item> -->
            <!-- <a @click="handleEdit(item)"><Icon type="edit" size="20"></Icon></Icon></a> -->
        <!-- </Form-item> -->
        <div v-if="index != 0" style="float:right">
            <a @click="handleRemove(index)"><Icon type="trash-a" style="color:#e74c3c" size="20"></Icon></a>
        </div>
      </Row>
      </Form>
    </div>
  <!-- {{schemainstance}} -->
  </div>
</template>

<script>
/*eslint-disable*/
import moment from 'moment'
import Schema from '../api/schema'
import SchemaForm from './SchemaForm'
var AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.accesskey,
  secretAccessKey: process.env.secretkey
})
AWS.config.region = 'us-west-2'
  export default {
    name: 'schema-form',
    props: ['schemainstance'],
    components: {
      'schema-form': SchemaForm
      // draggable
    },
    mounted () {
    },
    data () {
      return {
      }
    },
    methods: {
      handleFileChange(e, index, fieldName) {
        let self = this
        var files = e.target.files || e.dataTransfer.files
        let allFiles = []
        if (files.length > 0) {
          for(let i = 0; i < files.length; i++) {
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
      getValidationProps (index, fieldName) {
        return 'data[' + index + '][' + fieldName + ']'
      },
      getChildData (id) {
        // alert(id)
        var arrObj = []
        var self = this
        Schema.getThis(id)
          .then(response => {
            var _res = response.data
            var obj = {}
            // obj.id = self.getGuid();  // for guid for perticular row
            // obj.database = _res.database
            // obj.Schemaid = _res._id
            _.forEach(_res.entity, function(v) {
              if (v.customtype) {
                obj[v.name] = self.getChildData(v.type)
              }  else {
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
            })
            arrObj.push(obj)
          })
          .catch(error => {
            console.log('Error', error)
          }) 
        return arrObj
      },
      getObject (eIndex, dataIndex, fname, ftype) {
        var obj = {}
        obj.data = this.schemainstance.data[dataIndex][fname]
        obj.entity = this.schemainstance.entity[eIndex].entity[0].entity
        return obj
      },
      handleAdd (eIndex, dataIndex, ent, data, fname) {
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
        // obj.id = this.getGuid();
        // alert(ent.database)
        // obj.database = ent.database
        // obj.Schemaid = ent._id
        _.forEach(ent.entity, function(v) {
          if (v.customtype) {
            obj[v.name] = self.getChildData(v.type)
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
        })
        this.schemainstance.data[dataIndex][fname].push(obj)
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
          rules.push({ type: 'string', min: row.property.min, message: 'min' + row.property.min +' length req' })
        }
        if (row.property.max > 0 && row.type === 'text') {
          rules.push({ type: 'string', max: row.property.max, message: 'max length ' + row.property.max + ' required.' })
        }
        if (row.property.allowedValue.length > 0) {
          rules.push({type: 'enum', enum: row.property.allowedValue})
        }
        return rules
      },
      handleEdit (row) {
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
    }
  }
</script>
<style>
  /*.ivu-form-item .ivu-form-item {
    margin-bottom: 10px !important;
  }*/
</style>