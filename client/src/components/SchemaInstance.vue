f<template>
  <div class="schema-instance">
    <Form ref="formSchemaInstance" :model="formSchemaInstance">
      <!-- <Form-item 
        label="Title" 
        prop="name"
        :label-width="100"
        :rules="{required: true, message: 'Please enter your schema title', trigger: 'blur'}">
          <Input type="text" v-model="formSchemaInstance.name"></Input>
      </Form-item> -->
       <!-- <div class="drag">
        <draggable :list="formSchemaInstance.data">
          <transition-group>
            <div v-for="(element, i) in formSchemaInstance.data" :key="i">
                <schema-form :schemainstance="formSchemaInstance"></schema-form>
            </div>
          </transition-group>
        </draggable>
     </div> -->
     <schema-form :schemainstance="formSchemaInstance"></schema-form>
     <!--  <Form-item>
        <Row>
          <Col span="24"> -->
            <Button type="dashed" long @click="handleAdd" icon="plus-round">Add</Button>
            <!-- </Col>
          </Row>
        </Form-item> -->
      <Form-item>
        <Button type="primary" v-model="savebutton" @click="handleSubmit('formSchemaInstance')">{{ savebutton }}</Button>
        <Button type="ghost" @click="handleReset('formSchemaInstance')" style="margin-left: 8px">Reset</Button>
      </Form-item>
    </Form>
    <!-- {{formSchemaInstance.data}}
    <hr><hr><hr><hr><hr><hr>
    {{formSchemaInstance.entity}} -->
    <div v-if="validErr.length != 0" style="color: #a94442;background-color: #f2dede;border:1px solid #ebccd1;padding: 5px">
      <div v-for="item in validErr">
        <Icon type="record" style="font-size:10px"></Icon>
        {{item.name}} -- {{item.errmsg}}
      </div>
    </div>
  </div>
</template>

<script>
import SchemaForm from './SchemaForm'
import Schema from '../api/schema'
import Instance from '../api/instance'
import _ from 'lodash'
export default {
  name: 'schema',
  components: {
    'schema-form': SchemaForm
    // draggable
  },
  props: ['id', 'instanceid', 'processid', 'lastLog'],
  data () {
    return {
      loading: false,
      formSchemaInstance: {
        // name: '',
        data: [],
        entity: []
      },
      schema: {},
      entity: [],
      savebutton: 'Save',
      validFlag: true,
      validErr: []
    }
  },
  created () {
    if (this.id === undefined) {
      if (this.$route.params.schemaid === undefined) {
        this.savebutton = 'Update'
        this.fetch(this.$route.params.id)
      } else {
        this.fetch(this.$route.params.schemaid)
      }
    } else {
      this.fetch(this.id)
    }
  },
  methods: {
    getChildData (id) {
      // alert(id)
      var arrObj = []
      var self = this
      Schema.getThis(id)
        .then(response => {
          var _res = response.data
          var obj = {}
          // obj.id = self.getGuid();
          // obj.database = _res.database
          // obj.Schemaid = _res._id
          _.forEach(_res.entity, function (v) {
            if (v.customtype) {
              obj[v.name] = self.getChildData(v.type)
            } else {
              if (v.type === 'number') {
                obj[v.name] = 1
              } else if (v.type === 'boolean') {
                obj[v.name] = false
              } else {
                obj[v.name] = ''
              }
            }
          })
          arrObj.push(obj)
        })
        .catch(error => {
          console.log('Errorrr', error)
        })
      return arrObj
    },
    async getChildEntity (id) {
      // alert('entity')
      var self = this
      var res = []
      var _res = await Schema.getThis(id)
      for (let [index, entity] of _res.data.entity.entries()) {
        if (entity.customtype) {
          _res.data.entity[index]['entity'] = await self.getChildEntity(entity.type)
        }
      }
      res.push(_res.data)
      return res
    },
    async fetch (id) {
      const self = this
      // const result = await Schema.getAll(id)
      // console.log('result', result)
      var response = await Schema.getThis(id)
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
      this.schema = response.data
      this.entity = this.schema.entity
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
      // console.log('self.formSchemaInstance.data[0]', self.formSchemaInstance.data[0])
      // if (self.formSchemaInstance.data[0].length === 0) {
      this.handleAdd()
      // }
    },
    handleAdd () {
      var self = this
      var obj = {}
      if (this.lastLog !== undefined && this.lastLog.input.length !== 0) {
        _.forEach(self.lastLog.input, (obj) => {
          // obj = this.lastLog.input[0]
          // obj.database = this.schema.database
          obj.Schemaid = self.schema._id
          delete obj.id
          delete obj._id
          self.formSchemaInstance.data.push(obj)
        })
      } else {
        // obj.database = this.schema.database
        obj.Schemaid = this.schema._id
        // console.log('this.entity', this.entity)
        _.forEach(this.entity, function (v) {
          if (v.customtype) {
            obj[v.name] = self.getChildData(v.type)
          } else {
            if (v.type === 'number') {
              obj[v.name] = 1
            } else if (v.type === 'boolean') {
              obj[v.name] = false
            } else {
              obj[v.name] = ''
            }
          }
        })
        this.formSchemaInstance.data.push(obj)
      }
      // console.log('obj', obj)
    },
    makeObj () {
      var obj = this.schema
      obj.Schemaid = this.schema._id
      obj.data = this.formSchemaInstance.data
      return obj
    },
    handleSubmit (name) {
      var obj = this.makeObj()
      // console.log('QQQQQQQQQQQQ', obj.data[0])
      this.validFlag = true
      this.validErr = []
      var check = this.checkValidation(obj.data[0], this.entity)
      console.log('checkkkkkkkkkkkk', check)
      this.$Loading.start()
      if (check) {
        Instance.post({ instanceid: this.instanceid, processid: this.processid, data: obj.data })
        .then(response => {
          console.log('response', response.data)
          this.$Notice.success({title: 'success!', desc: 'Instance Saved...'})
          this.$Loading.finish()
        })
        .catch(error => {
          console.log('Error', error)
          this.$Notice.error({title: 'Error!', desc: 'Instance Not Saved...'})
          this.$Loading.error()
        })
      } else {
        this.$Notice.error({title: 'Validation Error!'})
      }
    },
    checkValidation (data, ent) {
      console.log('Validation....', data, ent)
      var self = this
      // var flag = true
      _.forEach(ent, function (v) {
        console.log(JSON.stringify(v))
        if (v.customtype) {
          // console.log('data[v.name]', data[v.name])
          _.forEach(data[v.name], (d) => {
            self.validFlag = self.checkValidation(d, v.entity[0].entity)
          })
        } else {
          if (v.property.optional !== true) {
            if (data[v.name] === '') {
              self.validErr.push({name: v.name, errmsg: 'Field is required.'})
              self.validFlag = false
            }
            if (v.type === 'email' && data[v.name] !== '') {
              var patt = (v.property.regEx === '') ? new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$') : new RegExp(v.property.regEx)
              var res = patt.test(data[v.name])
              if (!res) {
                self.validErr.push({name: v.name, errmsg: 'Invalid Email.'})
                self.validFlag = false
              }
            }
            if (v.type === 'phone' && data[v.name] !== '') {
              patt = new RegExp('^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$')
              res = patt.test(data[v.name])
              if (!res) {
                self.validErr.push({name: v.name, errmsg: 'Invalid Phone.'})
                self.validFlag = false
              }
            }
            if (v.type === 'number') {
              patt = new RegExp('^[0-9]+$')
              res = patt.test(data[v.name])
              // alert(data[v.name])
              if (!res) {
                self.validErr.push({name: v.name, errmsg: 'Invalid Number.'})
                self.validFlag = false
              }
            }
          }
        }
      })
      return self.validFlag
    },
    handleReset (name) {
      // this.$refs[name].resetFields()
      this.fetch(this.$route.params.schemaid)
    }
  },
  watch: {
    '$route.params.schemaid' (newId, oldId) {
      // fetch data
      this.fetch(newId)
    }
  }
}
</script>