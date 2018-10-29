<style lang="less">
  .schema-form-input{
    .ivu-input{
      border-width:0px;
          resize: none;
      &:hover{
        border-width:1px;
        border-color:#ccc;
      }
      &:focus, &:hover + &:focus{
        border-width:1px;
        border-color:none;
      }
    }
    .ivu-select-selection{
      border-width:0px;
      &:hover{
        border-width:1px;
        border-color:#ccc;
      }
      &:focus{
        border-width:1px;
        border-color:none;
      }
    }
  }
  .no-margin{
    margin:0px;
  }
</style>
<template>
  <div class="schema">
   <!--  <Row>
      <Button type="primary" size="small" @click="back()" icon="chevron-left">Back</Button>
    </Row> -->
    <Row>
      <Col>
          <Row  style="margin: 10px 0;">
            <Col :span="2">
              <Button type="ghost" @click="back()" icon="chevron-left">Back</Button>
              
            </Col>
            <Col :span="22">
              <div align="right">
                  <Button type="ghost" @click="handleReset('formSchema')" style="margin-left: 8px">Reset</Button>
                  <Button type="primary" :loading="loading" @click="handleSubmit('formSchema')">
                      <span v-if="!loading && !formSchema.id">Save</span>
                      <span v-else-if="!loading && formSchema.id">Update</span>
                      <span v-else>Loading...</span>
                  </Button>
              </div>
            </Col>
          </Row>
          
        <Form ref="formSchema" :model="formSchema">
          <Form-item
            v-if="!formSchema.id"
            label="Schema Title"
            prop="title"
            :label-width="100"
            :rules="titlerules">
              <Input type="text" v-model.trim="formSchema.title"></Input>
          </Form-item>
          <Form-item
            v-if="formSchema.id"
            label="Schema Title"
            :label-width="100"
            >
              <Input type="text" v-model="formSchema.title" disabled></Input>
          </Form-item>
          <div class="schema-form ivu-table-wrapper">
            <div class="ivu-table ivu-table-border">
                <div class="ivu-table-body">
                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                        <colgroup>
                            <col width="25">
                                <col width="25">
                                    <col width="15">
                                        <col width="25">
                                            <col width="10">
                        </colgroup>
                        <thead>
                            <tr>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Name</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Type</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell"><span>Property</span>
                                    </div>
                                </th>
                                <th class="">
                                    <div class="ivu-table-cell"><span>Notes</span>
                                    </div>
                                </th>
                                <th class="ivu-table-column-center">
                                    <div class="ivu-table-cell"><span>Action</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="ivu-table-tbody">
                            <tr class="ivu-table-row" v-for="(item, index) in formSchema.entity">
                                <td class="">
                                    <div class="ivu-table-cell">
                                         <Form-item
                                        :prop="'entity.' + index + '.name'"
                                        :rules="entityrules"
                                        >
                                          <Input type="text" v-model.trim="item.name" placeholder="name" size="small" class="schema-form-input"></Input>
                                        </Form-item>
                                    </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                      <!-- {{item.type}} -->
                                      <Select size="small" v-model="item.type" @on-change="checktype(item.type, index)" class="schema-form-input">
                                          <Option v-for="t in setTypes" :value="t.value" :key="t.value">{{ t.label }}</Option>
                                      </Select>
                                    </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                      <Poptip placement="right">
                                        <a><Icon type="edit"></Icon></a>
                                        <div slot="title"><h3>Property</h3></div>
                                        <div slot="content">
                                          <Form-item v-if="activatedProperty(index,'numberoflines')" label="Lines" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.numberoflines" :min="1"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'format')" label="Format" :label-width="80" class="no-margin">
                                            <Input size="small" v-model="item.property.format"></Input>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'lengthofdigits')" label="Length" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.lengthofdigits" :min="1"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'startfrom')" label="Start From" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.startfrom" :min="1"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'min')" label="Min" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.min"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'max')" label="Max" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.max"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'mindate')" label="Min Date" :label-width="80" class="no-margin">
                                            <!-- <Input-number size="small" v-model="item.property.mindate"></Input-number> -->
                                            <DatePicker type="date" placeholder="Select date"  v-model="item.property.mindate"></DatePicker>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'maxdate')" label="Max Date" :label-width="80" class="no-margin">
                                            <!-- <Input-number size="small" v-model="item.property.maxdate"></Input-number> -->
                                            <DatePicker type="date" placeholder="Select date"  v-model="item.property.maxdate"></DatePicker>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'allowedValue')" label="Allowed Value" :label-width="80" class="no-margin">
                                            <input-tag :tags="item.property.allowedValue"></input-tag>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'options')" label="Options" :label-width="80" class="no-margin">
                                            <input-tag :tags="item.property.options"></input-tag>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'defaultValue')" label="Default Value" :label-width="80" class="no-margin">
                                            <Input size="small" v-model="item.property.defaultValue"></Input>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'regEx')" label="regEx" :label-width="80" class="no-margin">
                                            <Input size="small" v-model="item.property.regEx"></Input>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'placeholder')" label="Placeholder" :label-width="80" class="no-margin">
                                            <Input size="small" v-model="item.property.placeholder"></Input>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'IsArray')" label="" class="no-margin">
                                            <Checkbox v-model="item.property.IsArray">Is Array</Checkbox>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'isMultiple')" label="" class="no-margin">
                                            <Checkbox v-model="item.property.isMultiple">Multiple</Checkbox>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'optional')" label="" :label-width="80" class="no-margin">
                                            <Checkbox v-model="item.property.optional">Optional</Checkbox>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'dateformat')" label="Date" :label-width="80" class="no-margin">
                                            <Select v-model="item.property.dateformatselect" style="width:200px; height: 150px">
                                                <Option v-for="item in dateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                            </Select>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'prefix')" label="Prefix" :label-width="80" class="no-margin">
                                            <Input size="small" v-model="item.property.prefix"></Input>
                                          </Form-item>
                                        </div>
                                      </Poptip>
                                    </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                        <Input type="textarea" v-model="item.notes" placeholder="Notes..." size="small" class="schema-form-input"></Input>
                                    </div>
                                </td>
                                <td class="ivu-table-column-center">
                                    <div class="ivu-table-cell">
                                      <Tooltip content="Remove" placement="top">
                                        <a @click="handleRemove(index)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                      </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="ivu-table-tip" style="display: none;">
                    <table cellspacing="0" cellpadding="0" border="0">
                        <tbody>
                            <tr>
                                <td><span>No filter data</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
          <Form-item>
              <Row>
                  <Col span="24">
                      <Button type="dashed" long @click="handleAdd" icon="plus-round">Add</Button>
                  </Col>
              </Row>
          </Form-item>
          <Form-item>
            <Collapse>
            <Panel name="2">
              Email Schema
              <p slot="content">
                <table cellspacing="0" cellpadding="0" border="0" style="width: 100%; border:1px solid #eee">
                  <colgroup>
                    <col width="50">
                        <col width="50">
                  </colgroup>
                  <thead>
                      <tr>
                          <th class="">
                              <div class="ivu-table-cell">
                                  <span>Select</span>
                              </div>
                          </th>
                          <th class="">
                              <div class="ivu-table-cell">
                                  <span>Action</span>
                              </div>
                          </th>
                      </tr>
                  </thead>
                  <tbody class="ivu-table-tbody">
                      <tr class="ivu-table-row" >
                          <td class="">
                              <div class="ivu-table-cell">
                                    <Select size="small" v-model="formSchema.emailSchema.schemaId" class="schema-form-input">
                                        <Option v-for="t in cutomtypes" :value="t.value" :key="t.value">{{ t.label }}</Option>
                                    </Select>
                              </div>
                          </td>
                          <td class="">
                              <div class="ivu-table-cell">
                                  <Checkbox v-model="formSchema.emailSchema.action"></Checkbox>
                              </div>
                          </td>
                      </tr>
                  </tbody>
                </table>
              </p>
            </Panel>
            </Collapse>
          </Form-item>
        </Form>
        <div style="margin-top: 10px;">
          <Button type="primary" :loading="loading" @click="handleSubmit('formSchema')">
            <span v-if="!loading && !formSchema.id">Save</span>
            <span v-else-if="!loading && formSchema.id">Update</span>
            <span v-else>Loading...</span>
          </Button>
          <Button type="ghost" @click="handleReset('formSchema')" style="margin-left: 8px">Reset</Button>
        </div>
      </Col>
    </Row>
  </div>

</template>

<script>
// import InputTag from 'vue-input-tag'
import schemaModal from '@/api/schema'
import _ from 'lodash'

export default {
  name: 'schema',
  components: {'input-tag': (resolve) => { require(['vue-input-tag'], resolve) }},
  data () {
    const validateTitle = async(rule, value, callback) => {
      let isexist = _.findIndex(this.cutomtypes, {label: value})
      if (isexist !== -1) {
        callback(new Error('Already Exist....'))
      } else {
        callback()
      }
    }
    const validateEntField = async(rule, value, callback) => {
      // eslint-disable-next-line
      var patt = new RegExp(/\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\>|\?|\/|\"|\;|\:/)
      var _res = patt.test(value)
      if (_res) {
        callback(new Error('Invalid Input'))
      } else {
        if (value === 'id' || value === '_id') {
          callback(new Error('Not allowed. Please enter another name.'))
        } else {
          callback()
        }
      }
    }
    return {
      dateList: [
        {
          value: 'A',
          label: 'dd/mm/yyyy hh:mm'
        },
        {
          value: 'B',
          label: 'yyyy/mm/dd hh:mm'
        },
        {
          value: 'C',
          label: 'yyyy/mm/dd hh:mm:s'
        },
        {
          value: 'D',
          label: 'dd/mm/yyyy hh:mm:s'
        },
        {
          value: 'E',
          label: 'dd/mm/yyyy'
        },
        {
          value: 'F',
          label: 'yyyy/mm/dd'
        }
      ],
      model1: '',
      loading: false,
      formSchema: {
        title: '',
        entity: [
          {
            name: '',
            type: 'text',
            customtype: false,
            property: {
              min: 0,
              max: 0,
              mindate: '',
              maxdate: '',
              allowedValue: [],
              defaultValue: '',
              placeholder: '',
              helper: '',
              regEx: '',
              optional: true,
              options: [],
              IsArray: false,
              isMultiple: true,
              dateformatselect: '',
              prefix: ''
            },
            notes: ''
          }
        ],
        emailSchema: {
          action: false,
          schemaId: ''
        }
      },
      defaultType: [
        {
          value: 'text',
          label: 'Text'
        },
        {
          value: 'textarea',
          label: 'Textarea'
        },
        {
          value: 'email',
          label: 'Email'
        },
        {
          value: 'number',
          label: 'Number'
        },
        {
          value: 'boolean',
          label: 'Boolean'
        },
        {
          value: 'phone',
          label: 'Phone'
        },
        {
          value: 'date',
          label: 'Date'
        },
        {
          value: 'dropdown',
          label: 'DropDown'
        },
        {
          value: 'file',
          label: 'File'
        },
        {
          value: 'currentuser',
          label: 'Current User'
        },
        {
          value: 'currenttime',
          label: 'Current Time'
        },
        {
          value: 'autogenerator',
          label: 'Auto Generator'
        }
      ],
      cutomtypes: [],
      titlerules: [
        {
          required: true,
          message: 'Please enter your schema title',
          trigger: 'blur'
        },
        {
          validator: validateTitle,
          trigger: 'blur'
        }],
      entityrules: [{
        required: true,
        message: 'Please enter name',
        trigger: 'blur'
      },
      {
        validator: validateEntField,
        trigger: 'blur'
      }
      ]
    }
  },
  computed: {
    setTypes () {
      return this.defaultType.concat(this.cutomtypes)
    }
  },
  async mounted () {
    await this.setSchemaTypes()
    await this.fetch(this.$route.params.id)
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    checktype (type, index) {
      var val = _.find(this.defaultType, {value: type})
      if (val === undefined) {
        this.formSchema.entity[index].customtype = true
      } else {
        this.formSchema.entity[index].customtype = false
      }
    },
    fetch (id) {
      this.$Loading.start()
      if (id === undefined) {
        this.formSchema = {
          title: '',
          entity: [
            {
              name: '',
              type: 'text',
              customtype: false,
              property: {
                min: 0,
                max: 0,
                mindate: '',
                maxdate: '',
                allowedValue: [],
                defaultValue: '',
                placeholder: '',
                helper: '',
                regEx: '',
                optional: true,
                options: [],
                IsArray: false,
                isMultiple: true,
                dateformatselect: '',
                prefix: ''
              },
              notes: ''
            }
          ],
          emailSchema: {
            action: false,
            schemaId: ''
          }
        }
        this.$Loading.finish()
      } else {
        schemaModal.get(id)
        .then(response => {
          this.formSchema = response.data
          if (!response.data.hasOwnProperty('emailSchema')) {
            this.formSchema.emailSchema = {
              action: false,
              schemaId: ''
            }
          }
          this.$Loading.finish()
        })
        .catch(error => {
          console.log(error)
          this.$Loading.error()
        })
      }
    },
    setSchemaTypes () {
      schemaModal.get(null, {
        $select: ['title', 'id'],
        $paginate: false
      }).then(res => {
        for (let item of res.data) {
          this.cutomtypes.push({
            value: item.id,
            label: item.title
          })
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loading = true
          this.formSchema.userID = this.$store.state.user._id
          if (this.formSchema.id === undefined) {
            this.formSchema['isdeleted'] = false
            schemaModal.post(this.formSchema)
            .then(response => {
              this.$Notice.success({title: 'Schema saved..!'})
              this.loading = false
              this.$router.go(-1)
            })
            .catch(error => {
              console.log(error)
              this.loading = false
            })
          } else {
            schemaModal.put(this.formSchema.id, this.formSchema)
            .then(response => {
              // console.log(response)
              this.$Message.success('Schema updated..!')
              this.loading = false
              this.$router.go(-1)
            })
            .catch(error => {
              console.log(error)
              this.loading = false
            })
          }
        }
      })
    },
    handleReset (name) {
      this.formSchema = {
        title: '',
        entity: [
          {
            name: '',
            type: 'text',
            customtype: false,
            property: {
              min: 0,
              max: 0,
              mindate: '',
              maxdate: '',
              allowedValue: [],
              defaultValue: '',
              placeholder: '',
              helper: '',
              regEx: '',
              optional: true,
              options: [],
              IsArray: false,
              isMultiple: true,
              dateformatselect: '',
              prefix: ''
            },
            notes: ''
          }
        ],
        emailSchema: {
          action: false,
          schemaId: ''
        }
      }
    },
    handleAdd () {
      this.formSchema.entity.push({
        name: '',
        type: 'text',
        customtype: false,
        property: {
          min: 0,
          max: 0,
          mindate: '',
          maxdate: '',
          allowedValue: [],
          defaultValue: '',
          placeholder: '',
          helper: '',
          regEx: '',
          optional: true,
          options: [],
          IsArray: '',
          isMultiple: true,
          dateformatselect: '',
          prefix: ''
        },
        notes: ''
      })
    },
    handleRemove (index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.formSchema.entity.splice(index, 1)
        },
        onCancel: () => {
        }
      })
    },
    activatedProperty (index, property) {
      let typePropertys = {
        'text': ['max', 'allowedValue', 'defaultValue', 'placeholder', 'regEx', 'optional'],
        'textarea': ['max', 'allowedValue', 'defaultValue', 'placeholder', 'optional', 'numberoflines'],
        'email': ['allowedValue', 'defaultValue', 'placeholder', 'optional'],
        'number': ['min', 'max', 'allowedValue', 'defaultValue', 'placeholder', 'regEx', 'optional'],
        'phone': ['allowedValue', 'defaultValue', 'placeholder', 'regEx', 'optional'],
        'boolean': ['defaultValue', 'placeholder', 'optional'],
        'date': ['defaultValue', 'mindate', 'maxdate', 'placeholder', 'optional'],
        'dropdown': ['options', 'defaultValue', 'placeholder', 'optional'],
        'file': ['optional', 'isMultiple'],
        'currentuser': ['optional'],
        'currenttime': ['optional', 'dateformat'],
        'autogenerator': ['optional', 'prefix']

      }
      if (typePropertys[this.formSchema.entity[index].type] === undefined) {
        return ['IsArray'].indexOf(property) >= 0
      } else {
        return typePropertys[this.formSchema.entity[index].type].indexOf(property) >= 0
      }
    }
  },
  watch: {
    '$route.params.id': function (newId, oldId) {
      this.fetch(newId)
    }
  }
}
</script>
<style >
  .ivu-form-item-error-tip {
    position: relative;
  }
  .ivu-select-dropdown-list {
    max-height: inherit;
    overflow-y: scroll;
  }
</style>
