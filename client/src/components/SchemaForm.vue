<template>
  <div class="schema-form"   style="border-left:3px solid rgb(147, 180, 216);">
    <!-- {{schemainstance.data}} -->
    <Form-item v-for="(item, index) in schemainstance.data" :key="index" style="padding-left:2px">
      <!-- {{schemainstance.data}} -->
      <Form ref="formSchema" :model="schemainstance" inline>
        <!-- :model="item"  -->
        <Form-item :model="item" style="cursor:-webkit-grabbing;">
            <Icon type="android-more-vertical" size="18"></Icon>
            <Icon type="android-more-vertical" size="18"></Icon>
        </Form-item>

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
        <span>
        <!-- v-else -->
        <!-- 'data.' + inx + '.' + field.name -->  <!-- schemainstance.data[index][field.name] -->
          <template v-for="(field,inx) in schemainstance.entity">
            <template v-if="field.customtype">
              <Form-item 
                :key="inx">
                <div style="">{{field.name}}
                  <div v-if="field.property.IsArray">
                    <schema-form  :schemainstance="getObject(inx, index, field.name, field.type)"></schema-form>
                    <Button type="dashed" long @click="handleAdd(inx, index, schemainstance.entity[inx].entity[0], schemainstance.data[index][field.name], field.name)" icon="plus-round">Add ({{field.name}})</Button>
                  </div>
                  <div v-else>
                    <schema-form  :schemainstance="getObject(inx, index, field.name, field.type)"></schema-form>
                  </div>
                </div>
              </Form-item>
            </template>
            <!-- :prop="'data[' + index + '][' + field.name + ']'" -->
                <!-- :show-message="true" -->
            <template v-else>
              <Form-item 
                :key="inx"
                :rules="createRules(field)">
                <!-- <div style="border: 1px solid red"> -->
                <Input :disabled="field.isDisabled" v-if="field.type == 'text' || field.type == 'email' || field.type == 'phone'" v-model="schemainstance.data[index][field.name]" type="text" :placeholder="field.name"></Input>
                <!-- </div> -->
                <Input-number v-if="field.type == 'number'" :min="(field.property.min > 0)?field.property.min : -Infinity" :max="(field.property.max > 0)?field.property.max : Infinity" v-model="schemainstance.data[index][field.name]" :type="field.type" :placeholder="field.name"></Input-number>
                <Date-picker v-if="field.type == 'date'" type="date" v-model="schemainstance.data[index][field.name]" format="MM-dd-yyyy" :placeholder="field.name"></Date-picker>
                <Select v-if="field.type == 'dropdown'" v-model="schemainstance.data[index][field.name]">
                  <Option v-for="dpd in field.property.options" :value="dpd" :key="dpd">{{ dpd }}</Option>
                </Select>
                <Checkbox v-if="field.type == 'boolean'" v-model="schemainstance.data[index][field.name]">{{field.name}}</Checkbox>
              </Form-item>
            </template>
          </template>
          
        </span>
        <Form-item>
            <!-- <a @click="handleEdit(item)"><Icon type="edit" size="20"></Icon></Icon></a> -->
        </Form-item>
        <Form-item v-if="index != 0">
            <a @click="handleRemove(index)"><Icon type="trash-a" style="color:#e74c3c" size="20"></Icon></a>
        </Form-item>
      </Form>
    </Form-item>
  <!-- {{schemainstance}} -->
  </div>
</template>

<script>
/*eslint-disable*/
import Schema from '../api/schema'
import SchemaForm from './SchemaForm'

  export default {
    name: 'schema-form',
    props: ['schemainstance'],
    components: {
      'schema-form': SchemaForm
      // draggable
    },
    mounted () {
      // console.log('this.schemainstance', this.schemainstance)
    },
    data () {
      return {
      }
    },
    methods: {
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
                console.log('child', self.getChildData(v.type))
                obj[v.name] = self.getChildData(v.type)
              } else {
                  if (v.type === 'number') {
                    obj[v.name] = 1
                  }
                  else {
                    obj[v.name] = ''
                  }
              }
            })
            arrObj.push(obj)
            // console.log('response', arrObj)
          })
          .catch(error => {
            console.log('Errorrr')
          }) 
        return arrObj
      },
      getObject (eIndex, dataIndex, fname, ftype) {
        var obj = {}
        obj.data = this.schemainstance.data[dataIndex][fname]
        // console.log('this.schemainstance.entity[eIndex]', this.schemainstance.entity[eIndex])
        obj.entity = this.schemainstance.entity[eIndex].entity[0].entity
        // console.log('recursive obj', obj)
        return obj
      },
      handleAdd (eIndex, dataIndex, ent, data, fname) {
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
        _.forEach(ent.entity, function(v) {
          if (v.customtype) {
            obj[v.name] = self.getChildData(v.type)
          } else {
            if (v.type === 'number') {
              obj[v.name] = 1
            }
            else {
              obj[v.name] = ''
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
        return ['text', 'email', 'number', 'phone', 'boolean', 'date', 'dropdown'].indexOf(type) === -1
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
    }
  }
</script>