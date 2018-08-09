<template>
  <div class="SchemaView">
  	<div class="container-fluid">

      <!-- <mycustom></mycustom> -->

  		<list-instances v-on:setValues="setValues"></list-instances>

			<div>
				<div class="row" v-if="id != null">
					<div class="col-md-10" id="top">
						<div class="row" style="margin-top: 15px;">
		    			<div class="col-md-12">
		    				<div class="ui-card">
		    					<h3 class="formTitle">{{formTitle}}</h3>
		    				</div>
		    			</div>
		    		</div>

		    		<div class="row">
		    			<div class="col-md-12">
		    				<schemasubform :schemainstance="formSchemaInstance"></schemasubform>
						    <!-- <i-button type="dashed" class="btnAdd" long @click="handleAdd" icon="plus-round">Add</i-button> -->

						    <div style="padding: 5px 0 5px 0">
						        <Button type="primary" @click="handleSubmit('formSchemaInstance')">{{ savebutton }}</Button>
						        <Button @click="handleReset('formSchemaInstance')" style="margin-left: 10px">Reset</Button>
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
					<div class="col-md-2 fixed-div">
						<strong>Jump To:</strong>
						<ul class="jumper-links">
							<a href="#top" class="btn btn-info btn-block btnJumperLink"><li>Top</li></a>
							<a :href="'#' + item" v-for="item in jumperLinks" class="btn btn-info btn-block btnJumperLink"><li>{{item}}</li></a>
						</ul>
						<!-- <pre>{{formSchemaInstance}}</pre> -->
					</div>
				</div>
			</div>
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

  </div>
</template>

<script>

import _ from 'lodash'
import axios from 'axios'

import ListInstances from './ListInstances'
import SchemaSubForm from './SchemaSubForm'

const deepstream = require('deepstream.io-client-js')

const DeepRecord = require('@/assets/js/deepstream/deepRecord')

const client = deepstream('ws://167.99.233.211:6020').login()
let instanceId = '39c53741_ec14_4ceb_a9db_97d7066cd424'
let instanceListName = instanceId + 'List'
let instanceName = 'NewWork247'
let instanceList = client.record.getList(instanceListName)

console.log('Data: ', instanceName, instanceList)

export default {
  name: 'SchemaView',
  props: {
    options: {
      type: Object
    }
  },
  data () {
    return {
      loading: false,
      formSchemaInstance: {
        data: [],
        entity: []
      },
      schema: {},
      entity: [],
      savebutton: 'Save',
      validFlag: true,
      validErr: [],
      // id: '2f12480c-22bf-4223-aa18-87cf76b0166b',
      // id: 'a2fa8564-ff55-4755-ada7-5b8299a25913',
      id: null,
      item: null,
      nextState: null,
      currentState: null,
      instanceid: null,
      processid: null,
      lastLog: null,
      formTitle: null,
      jumperLinks: SchemaSubForm.jumperLinks
    }
  },
  components: {
    'list-instances': ListInstances,
    'schemasubform': SchemaSubForm
  },
  methods: {
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
      // console.log(arrObj)
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
      // console.log('result', result)
      var response = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
      console.log('Cluster response: ', response)
      // this.formTitle = response.data.title
      // console.log('this.lastLog', JSON.stringify(this.lastLog))
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
      // console.log('response.data', response.data)
      this.schema = response.data
      // console.log("^^^^^^^^^^^^^^: ",response.data)
      this.entity = response.data.entity
      // console.log("&&&&&&&&&&&&&&&&&: ", this.entity)
      this.formSchemaInstance.entity = this.schema.entity
      // this.formSchemaInstance.data[0] = {}
      for (let [index, entity] of self.formSchemaInstance.entity.entries()) {
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>', index, entity)
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
        this.formSchemaInstance.data = arr
      }
      // console.log('self.formSchemaInstance.data[0]', self.formSchemaInstance.data[0])
      // if (self.formSchemaInstance.data[0].length === 0) {
      // if (this.lastLog !== undefined && this.lastLog.input.length !== 0) {
      //   for (let mdata of self.lastLog.input) {
      //     for (let ent of self.schema.entity) {
      //       if (ent.type === 'file') {
      //         mdata[ent.name + 'List'] = mdata[ent.name]
      //         mdata[ent.name] = []
      //         // console.log(mdata, ent.name)
      //       } else if (ent.customtype) {
      //         mdata[ent.name] = self.setFileList(mdata[ent.name], ent.entity[0])
      //       }
      //     }
      //     // console.log(mdata)
      //   }
      //   // console.log('self.lastLog.input', self.lastLog.input)
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
      //   // console.log('self.formSchemaInstance.data', self.formSchemaInstance.data)
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
      await this.handleAdd()
      this.$Loading.finish()
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
      // console.log('mdata', mdata, entity)
      for (let sdata of mdata) {
        for (let ent of entity.entity) {
          if (ent.type === 'file') {
            sdata[ent.name + 'List'] = sdata[ent.name]
            sdata[ent.name] = []
            // console.log(mdata, ent.name)
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
      //         // console.log(mdata, ent.name)
      //       } else if (ent.customtype) {
      //         mdata[ent.name] = self.setFileList(mdata[ent.name], ent.entity[0])
      //       }
      //     }
      //     // console.log(mdata)
      //   }
      //   // console.log('self.lastLog.input', self.lastLog.input)
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
      //   // console.log('self.formSchemaInstance.data', self.formSchemaInstance.data)
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
      // console.log('this.entity', this.entity)
      // _.forEach(self.entity, async function (v) {
      for (let v of self.entity) {
        // console.log("%%%%%%%%%%%%%%%%: ", self.entity)
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
      // console.log('this.formSchemaInstance.data', JSON.stringify(this.formSchemaInstance.data))

      // }
      // console.log('obj', obj)
    },

    makeObj () {
      // console.log('this.schema', this.schema)
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
      var obj = this.makeObj()
      this.validFlag = true
      this.validErr = []
      // var check = this.checkValidation(obj.data[0], this.entity)
      let allcheck = []
      // console.log("entity: ", this.entity)
      for (let dobj of obj.data) {
        let flag = this.checkValidation(dobj, this.entity)
        allcheck.push(flag)
      }
      let check = _.indexOf(allcheck, false)
      // console.log('mergeData', mergeData, obj.data)
      // var check = this.checkValidation(obj.data[0], this.entity)
      // console.log('checkkkkkkkkkkkk', check, obj.data[0], this.entity)
      this.$Loading.start()
      if (check === -1) {
        let mergeData = this.mergeFileList(obj.data, obj)
        obj.data = mergeData

        console.log('Data: ', obj.data[0])

        let returnObj = await DeepRecord.deepRecord.instanceStageSubmit(client, this.item, obj.data[0])
        console.log('Data: ', returnObj)
        // let instanceObj = await DeepRecord.deepRecord.getRecordObject(client, this.item)
        // instanceObj.set('currentStatus', this.nextState)

        this.$Notice.success({title: 'success!', desc: 'Instance saved...'})
        this.$Loading.finish()

        this.id = null

        // axios.post('http://192.81.213.41:3033/eng/instance/', { data: obj.data })
        // .then(response => {
        //   // console.log('response', response.data)
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
      // console.log('Validation....', data, ent)
      var self = this
      // var flag = true
      for (let v of ent) {
        if (v.customtype) {
          // console.log('data[v.name]', data[v.name])
          console.log('Data V: ', v)
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
      console.log('Values: ', values)
      this.id = values.id
      this.item = values.item
      this.formTitle = values.formName
      let arr = [values.formData]
      // this.formSchemaInstance.data = arr[0]
      // console.log('form instance data: ', this.formSchemaInstance.data)
      // this.nextState = values.nextState
      // this.currentState = values.currentState
      this.fetch(this.id, arr)
    }
  },
  mounted () {
    // console.log('DeepRecord: ', DeepRecord)
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
