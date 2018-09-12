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
                                </div>
                            </div>
                    <div v-else style="display: block; width: 49%; margin-top: 5px;">
                        <div :key="inx">
                            <div>
                                <div style="display: block; width: 49%;">
                                    <b>{{field.name}}</b>
                                </div>
                                <div style="display: block; width: 49%;">
                                    <label type="file" v-if="field.type == 'file'"/>
                                      <div v-for="(val,i) in schemainstance.data[index][field.name].slice(1)">
                                          <ul>
                                            <li>
                                              <a :href="val" target="_blank" style="color:black;padding:2px">Attachment - {{i+1}}</a>
                                            </li>
                                          </ul>
                                      </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import schemaModel from '@/api/schema'
import SchemaSubFormView from './SchemaSubFormView'
// import axios from 'axios'

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
    async getChildData (id) {
      var arrObj = []
      var self = this
      await schemaModel.get(id)
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
    // console.log('Data: ', this.schemainstance)
  },
  created () {
  }
}

</script>

