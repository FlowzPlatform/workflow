<template>
  <div>
  	<div style="display: block; width: 97%; box-shadow: 2px 2px 15px #DADADA; padding: 20px 10px; margin: 0px 0px; background-color: #FFF; border: 1px solid #CCC; border-radius: 5px;" v-for="(item, index) in schemainstance.data" :key="index">
      <div ref="formSchema" :model="schemainstance">
        <div >
            <div v-for="(field,inx) in schemainstance.entity" :style="getStyle(field)">
                <template v-if="field.customtype">
                    <div :id="field.name" style="display: block; width: 97%; margin-top: 20px;">
                        <div :key="inx">
                            <div>
                                <span style="text-transform: capitalize;color: #FFF;font-size: 18px;background-color: #292929;padding: 10px 30px;border-top-right-radius: 5px;border-bottom-right-radius: 5px;margin-left: -20px;margin-bottom: 10px;">{{field.name}}</span>
                            </div>
                            <div v-if="field.property.IsArray">
                              <table>
                                <schemasubformView :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubformView>
                              </table>
                            </div>
                            <div v-else>
                              <table>
                                <schemasubformView :schemainstance="getObject(inx, index, field.name, field.type)"></schemasubformView>
                              </table>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div v-if="field.type !== 'file'" style="display: block; width: 49%; margin-top: 5px;">
                        <div :key="inx">
                              <div style="display: inline-block; width: 49%;">
                                <b>{{field.name}}</b>
                              </div>
                                <div style="display: inline-block; width: 49%;">
                                  <label>{{schemainstance.data[index][field.name]}}</label>
                                </div>
                                
                                
                                <!-- <InputNumber v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></InputNumber>
                                
                                <DatePicker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name"></DatePicker>
                                
                                <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]" :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name">
                                    <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                                </Select>
                                <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]">{{field.name}}</Checkbox> -->

                                <!-- <dynamicinput :type="(field.type) ? field.type : null" :bindmodel="(schemainstance.data[index][field.name]) ? schemainstance.data[index][field.name] : null " :placeholder="(field.property.placeholder !== '') ? field.property.placeholder : field.name" :min="(field.property.min > 0) ? field.property.min : -Infinity" :max="(field.property.max > 0) ? field.property.max : Infinity" :options="(field.property.options) ? field.property.options : null" :field="field"></dynamicinput> -->
                                </div>
                            </div>
                        <!-- </div>
                    </div> -->
                    <div v-else style="display: block; width: 49%; margin-top: 5px;">
                        <div :key="inx">
                            <div>
                                <div style="display: block; width: 49%;">
                                    <b>{{field.name}}</b>
                                </div>
                                <div style="display: block; width: 49%;">
                                    <label type="file" v-if="field.type == 'file'"/>
                                    <!-- <div v-if="schemainstance.data[index][field.name]"> -->
                                      <div v-for="val in schemainstance.data[index][field.name]">
                                          <ul>
                                            <li>
                                              <a :href="val" target="_blank" style="color:black;padding:2px">{{val}}</a>
                                            </li>
                                          </ul>
                                      </div>
                                    <!-- </div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div v-else >
                        <div :key="inx">
                            <div>
                                <div >
                                    <b>{{field.name}}</b>
                                </div>
                                <div>
                                    <label type="file" v-if="field.type == 'file'"/>
                                    <div v-if="schemainstance.data[index][field.name]">
                                      {{schemainstance.data[index][field.name]}}
                                      <div v-for="val in schemainstance.data[index][field.name]">
                                            <ul>
                                              <li>
                                                <a :href="val" target="_blank" style="color:blue;padding:2px 15px;">{{val}}</a>
                                              </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> -->
                </template>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

// import $ from 'jquery'
import SchemaSubFormView from './SchemaSubFormView'
import axios from 'axios'
// import moment from 'moment'

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
    }
  },
  components: {
    'schemasubformView': SchemaSubFormView
  },
  methods: {
    getStyle (field) {
      if (field.customtype) {
        return 'display: inline-block; width: 97%; margin-top: 20px; background-color: rgba(0,0,0,0.2)'
      } else if (field.type === 'file') {
        return 'display: block; width: 97%; margin-top: 20px;'
      } else {
        return 'display: inline-block; width: 49%; margin-top: 20px;'
      }
    },
    // handleFileChange (e, index, fieldName) {
    //   let self = this
    //   var files = e.target.files || e.dataTransfer.files
    //   let allFiles = []
    //   if (files.length > 0) {
    //     // console.log('files', files[0])
    //     for (let i = 0; i < files.length; i++) {
    //       let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses' } })
    //       var params = {
    //         Key: moment().valueOf().toString() + i + files[i].name,
    //         ContentType: files[i].type,
    //         Body: files[i]
    //       }
    //       bucket.upload(params).on('httpUploadProgress', function (evt) {
    //       }).send(function (err, data) {
    //         if (err) {
    //           alert(err)
    //         } else {
    //           allFiles.push(data.Location)
    //         }
    //       })
    //     }
    //   }
    //   self.schemainstance.data[index][fieldName] = allFiles
    // },
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

  .field-label{
    text-transform: capitalize;
  }

  .formTitle{
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
