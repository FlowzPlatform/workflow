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
    <Row>
      <Button type="primary" @click="back()" icon="chevron-left" style="float:right;">Back</Button>
    </Row>
    <Row v-if="isGridManager">
      <grid-manager></grid-manager>
    </Row>
    <Row v-if="isGrapesComponent">
      <GrapesComponent></GrapesComponent>
    </Row>
    <Row v-if="isMjmlEditor">
      <MjmlEditor></MjmlEditor>
    </Row>
    <Row v-if="!isGridManager && !isGrapesComponent && !isMjmlEditor">
      <Col>
        <Form ref="formSchema" :model="formSchema">
          <Form-item
            v-if="!formSchema._id"
            label="Schema Title"
            prop="title"
            :label-width="100"
            :rules="titlerules">
              <Input type="text" v-model.trim="formSchema.title"></Input>
          </Form-item>
          <Form-item
            v-if="formSchema._id"
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
                                          <Input type="text" v-model="item.name" placeholder="name" size="small" class="schema-form-input"></Input>
                                        </Form-item>
                                    </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                      <Select size="small" v-model="item.type" @on-change="checktype(item.type, index)" class="schema-form-input">
                                          <Option v-for="t in types" :value="t.value" :key="t.value">{{ t.label }}</Option>
                                      </Select>
                                    </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                      <Poptip placement="right">
                                        <a><Icon type="edit"></Icon></a>
                                        <div slot="title"><h3>Property</h3></div>
                                        <div slot="content">
                                          <Form-item v-if="activatedProperty(index,'min')" label="Min" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.min"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'max')" label="Max" :label-width="80" class="no-margin">
                                            <Input-number size="small" v-model="item.property.max"></Input-number>
                                          </Form-item>
                                          <Form-item v-if="activatedProperty(index,'allowedValue')" label="Allowed Value" :label-width="80" class="no-margin">
                                            <input-tag  :tags="item.property.allowedValue"></input-tag>
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
                                          <Form-item v-if="activatedProperty(index,'optional')" label="" :label-width="80" class="no-margin">
                                            <Checkbox v-model="item.property.optional">Optional</Checkbox>
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
          <Form-item
          label="Select Database"
          prop="database"
          :label-width="115"
          :rules="{required: true, message: 'Please select Database'}">
            <Cascader v-if="formSchema._id" :data="CascaderData" filterable v-model='formSchema.database' disabled></Cascader>
            <Cascader v-if="!formSchema._id" :data="CascaderData" filterable v-model='formSchema.database'></Cascader>

          </Form-item>
          <Form-item>
            <Collapse v-model="templates">
              <Panel name="1">
                  Templates
                  <p slot="content">
                    <Tabs @on-click="fetchname" :value="activetab">
                        <TabPane label="View" icon="eye" name="view">
                          <!-- <Button type="ghost" @click="opengrapesjs(true)">Using Grapes</Button>
                          <Button type="ghost" @click="openGridManager(true)">Using Grid Manager</Button> -->
                          <div class="schema-form ivu-table-wrapper" style="margin-top:10px">
                            <div class="ivu-table ivu-table-border">
                                <div class="ivu-table-body">
                                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                        <thead>
                                            <tr>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Name</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Url</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell"><span>Notes</span>
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
                                          <template v-if="viewtemplate.length > 0">
                                            <tr class="ivu-table-row" v-for="(item, index) in viewtemplate">
                                                <td>
                                                  <div class="ivu-table-cell">
                                                    {{item.filename}}
                                                  </div>
                                                </td>
                                                <td>
                                                  <div class="ivu-table-cell">
                                                    <a :href="item.url">{{item.url}}</a>
                                                  </div>
                                                </td>
                                                <td class="">
                                                    <div class="ivu-table-cell">
                                                        {{item.notes}}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="ivu-table-cell">
                                                      <a style="margin-right:8px" @click="editViewTemplate(index , true)"><Icon type="edit" size="17"></Icon></a>
                                                      <a @click="deleteViewTemplate(index)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                                    </div>
                                                </td>
                                            </tr>
                                          </template>
                                          <template v-else>
                                            <tr class="ivu-table-row">
                                              <td colspan="4">
                                                <div class="ivu-table-cell" align="center">
                                                  No templates found
                                                </div>
                                              </td>
                                            </tr>
                                          </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                          </div>
                        </TabPane>

                        <Button type="info" v-if="activetab == 'view'" @click="opengrapesjs(true)" slot="extra"  size="small" style="margin-right:5px">Using Grapes</Button>
                        <Button type="info" v-if="activetab == 'view'" @click="openGridManager(true)" slot="extra" size="small">Using Grid Manager</Button>

                        <TabPane label="Edit" icon="edit" name="edit">
                          <!-- <Button type="info" @click="opengrapesjs(false)">Using Grapes</Button>
                          <Button type="info" @click="openGridManager(false)">Using Grid Manager</Button> -->
                          <div class="schema-form ivu-table-wrapper" style="margin-top:10px">
                            <div class="ivu-table ivu-table-border">
                                <div class="ivu-table-body">
                                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                        <thead>
                                            <tr>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Name</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Url</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell"><span>Notes</span>
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
                                          <template v-if="createtemplate.length > 0">
                                          <tr class="ivu-table-row" v-for="(item, index) in createtemplate">
                                              <td>
                                                <div class="ivu-table-cell">
                                                  {{item.filename}}
                                                </div>
                                              </td>
                                              <td>
                                                <div class="ivu-table-cell">
                                                  <a :href="item.url">{{item.url}}</a>
                                                </div>
                                              </td>
                                              <td class="">
                                                  <div class="ivu-table-cell">
                                                      {{item.notes}}
                                                  </div>
                                              </td>
                                              <td>
                                                  <div class="ivu-table-cell">
                                                    <a style="margin-right:8px" @click="editViewTemplate(index , false)"><Icon type="edit" size="17"></Icon></a>
                                                    <a @click="deleteCreateTemplate(index)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                                  </div>
                                              </td>
                                          </tr>
                                          </template>
                                          <template v-else>
                                            <tr class="ivu-table-row">
                                              <td colspan="4">
                                                <div class="ivu-table-cell" align="center">
                                                  No templates found
                                                </div>
                                              </td>
                                            </tr>
                                          </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                          </div>
                        </TabPane>

                        <Button type="info" v-if="activetab == 'edit'" @click="opengrapesjs(false)" slot="extra" size="small" style="margin-right:5px">Using Grapes</Button>
                        <Button type="info" v-if="activetab == 'edit'" @click="openGridManager(false)" slot="extra" size="small">Using Grid Manager</Button>

                        <TabPane label="Email" icon="email" name="email">
                          <!-- <Button type="ghost" @click="openMjmlEditor">Add Template</Button> -->
                          <div class="schema-form ivu-table-wrapper" style="margin-top:10px">
                            <div class="ivu-table ivu-table-border">
                                <div class="ivu-table-body">
                                    <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                        <thead>
                                            <tr>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Name</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell">
                                                        <span>Url</span>
                                                    </div>
                                                </th>
                                                <th class="">
                                                    <div class="ivu-table-cell"><span>Notes</span>
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
                                          <template v-if="mjmlUpload.length > 0">
                                          <tr class="ivu-table-row" v-for="(item, index) in mjmlUpload">
                                              <td>
                                                <div class="ivu-table-cell">
                                                  {{item.filename}}
                                                </div>
                                              </td>
                                              <td>
                                                <div class="ivu-table-cell">
                                                  <a :href="item.url">{{item.url}}</a>
                                                </div>
                                              </td>
                                              <td class="">
                                                  <div class="ivu-table-cell">
                                                      {{item.notes}}
                                                  </div>
                                              </td>
                                              <td>
                                                  <div class="ivu-table-cell">
                                                    <a style="margin-right:8px"><Icon type="edit" size="17"></Icon></a>
                                                    <a @click="handleDelete(index)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                                  </div>
                                              </td>
                                          </tr>
                                          </template>
                                          <template v-else>
                                            <tr class="ivu-table-row">
                                              <td colspan="4">
                                                <div class="ivu-table-cell" align="center">
                                                  No templates found
                                                </div>
                                              </td>
                                            </tr>
                                          </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                          </div>
                        </TabPane>

                        <Button type="info" v-if="activetab == 'email'" slot="extra" size="small" @click="openMjmlEditor">Add Template</Button>
                    </Tabs>
                  </p>
              </Panel>
          </Collapse>
          </Form-item>
          <Form-item>
            <Button type="primary" :loading="loading" @click="handleSubmit('formSchema')">
                <span v-if="!loading && !formSchema._id">Save</span>
                <span v-else-if="!loading && formSchema._id">Update</span>
                <span v-else>Loading...</span>
            </Button>
            <Button type="ghost" @click="handleReset('formSchema')" style="margin-left: 8px">Reset</Button>
          </Form-item>
        </Form>
      </Col>
    </Row>
    <!-- {{formSchema}} -->
    <!-- <div class="">
    <GrapesComponent :is='active'></GrapesComponent>
    </div> -->
  </div>

</template>

<script>
/*eslint-disable*/
import InputTag from 'vue-input-tag'
import api from '@/api'
import gridmanager from '@/components/gridmanager'
import GrapesComponent from '@/components/GrapesComponent'
import MjmlEditor from '@/components/MjmlEditor.vue'
import Emitter from '@/mixins/emitter'
var file = []

export default {
  name: 'schema',
  mixins: [Emitter],
  components: {'input-tag': InputTag, 'grid-manager': gridmanager, 'GrapesComponent': GrapesComponent,  'MjmlEditor': MjmlEditor},
  data () {
    const validateTitle = async(rule, value, callback) => {
      var patt = new RegExp(/^_|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\"|\;|\:|\-|\s/)
      var _res = patt.test(value)
      if (_res) {
        callback(new Error('Not Allowed Special Character'))
      } else {
        var res = await this.validateTitle(value)
        // console.log('res..// ', res)
        if (res === 'yes') {
          callback(new Error('Already Exist....'))
        } else {
          callback();
        }
      }
    };
    const validateEntField = async(rule, value, callback) => {
      var patt = new RegExp(/\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\>|\?|\/|\"|\;|\:/)
      var _res = patt.test(value)
      if (_res) {
        callback(new Error('Invalid Input'))
      } else {
        if (value === 'id' || value === '_id') {
          callback(new Error('Not allowed. Please enter another name.'))
        } else {
          callback();
        }
      }
    };
    return {
      loading: false,
      isGridManager: false,
      formSchema: {},
      defaultType: [{
        value: 'text',
        label: 'Text'
      }, {
        value: 'email',
        label: 'Email'
      }, {
        value: 'number',
        label: 'Number'
      }, {
        value: 'boolean',
        label: 'Boolean'
      }, {
        value: 'phone',
        label: 'Phone'
      }, {
        value: 'date',
        label: 'Date'
      }, {
        value: 'dropdown',
        label: 'DropDown'
      }],
      types: [],
      CascaderData: [],
      scdata: [],
      createtemplate: [],
      viewtemplate: [],
      mjmlUpload: [],
      isViewTemplate: false,
      upload: [],
      isGrapesComponent: false,
      isMjmlEditor: false,
      templates: '',
      activetab: 'view',
      titlerules: [{
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
  mounted () {
    console.log('mounted Called')
    this.$store.state.editTemplate = undefined
    // console.log('------->>>', this.$store.state.viewTemplate)
    this.fetch(this.$route.params.id)
    // this.mjmlUpload = this.$store.state.emailTemplate
    // console.log(this.mjmlUpload)
    api.request('get', '/settings')
      .then(response => {
        var result = response.data
        // console.log('settings',result)

        for(var db in result){
          var obj = {}
          // if(result[db].dbdefault == 'true'){
            // console.log('aaaaaaa',db)
            obj.value = db,
            obj.label = db,
            obj.children = []
            // console.log(result[db].dbinstance)
            result[db].dbinstance.forEach(function(instance, i){
              if(instance.isenable){
                // console.log(instance.cname)
                obj.children.push({label: instance.connection_name, value:instance.id})
              }
            })
            if(obj.children.length == 0 && obj.label != 'nedb'){
              obj.disabled = true
            }
          // }
          // console.log(obj)
          this.CascaderData.push(obj)
        }
        // this.$Loading.finish()
      })
      .catch(error => {
        console.log(error)
        // this.$Loading.error()
      })
      // if(this.$store.state.viewTemplate != undefined && this.$store.state.viewTemplate.length > 0)
      // {
      //   this.viewtemplate = this.$store.state.viewTemplate
      // }
      // if(this.$store.state.createTemplate != undefined && this.$store.state.createTemplate.length > 0)
      // {
      //   this.createTemplate = this.$store.state.createTemplate
      // }
  },
  methods: {
    validateTitle: async function(title) {
      var res = await (api.request('get', '/schema'))
      for (let [inx, obj] of res.data.entries()) {
        if (obj.title === title) {
          return 'yes'
        } 
      }
      return 'no'
    },
    back () {
      this.$router.go(-1)
    },
    checktype (type, index) {
      var val = _.find(this.defaultType, {value: type})
      if (val === undefined) {
        this.formSchema.entity[index].customtype = true
      }
      else {
        this.formSchema.entity[index].customtype = false
      }
      console.log('defaultType', val)
      // alert(type)
    },
    deleteViewTemplate(index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.viewtemplate.splice(index, 1)
        },
        onCancel: () => {
        }
      })
    },
    editViewTemplate(index, isViewTemplate) {
      let emailObject = {}
      emailObject.index = index
      if(isViewTemplate)
        emailObject.data = this.viewtemplate[index];
      else
        emailObject.data = this.createtemplate[index];
      this.$store.state.editTemplate = emailObject;
      if(emailObject.data.usingGrapesManager)
        this.opengrapesjs(isViewTemplate)
      else
        this.openGridManager(isViewTemplate)
    },
    deleteCreateTemplate(index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.createtemplate.splice(index, 1)
        },
        onCancel: () => {
        }
      })
    },
    handleDelete(index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          this.mjmlUpload.splice(index, 1)
        },
        onCancel: () => {
        }
      })
    },
    fetch (id) {
      this.$Loading.start()
      if (id === undefined) {
        this.formSchema = {
          title: '',
          database: [],
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
                IsArray: false
              },
              notes: ''
            }
          ]
        }
        this.createtemplate = []
        this.viewtemplate = []
        this.mjmlUpload = []
        // this.fetchSchemaType(id)
        this.$Loading.finish()
      } else {
        api.request('get', '/schema/' + id)
        .then(response => {
          this.formSchema = response.data
          this.createtemplate = this.formSchema.createTemplate
          this.viewtemplate = this.formSchema.viewTemplate
          this.mjmlUpload = this.formSchema.emailTemplate
          this.$Loading.finish()
        })
        .catch(error => {
          console.log(error)
          this.$Loading.error()
        })
      }
    },
    setTypes (id) {
      let type = []
      _.forEach(this.defaultType, function (t) {
        type.push(t)
      })
      // let checkType = '';
      this.$store.getters.allSchema.forEach((schema) => {
        if (id !== schema._id) {
          type.push({
            value: schema._id,
            label: schema.title
          })
        }
      })
      this.types = type
      // this.
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          /* Making API call to authenticate a user */
          this.loading = true
          if (this.formSchema._id === undefined) {
            this.formSchema['viewTemplate'] = this.viewtemplate
            this.formSchema['createTemplate'] = this.createtemplate
            this.formSchema['emailTemplate'] = this.mjmlUpload
            api.request('post', '/schema', this.formSchema)
            .then(response => {
              // this.toggleLoading()
              // this.$router.push(data.redirect)
              // console.log('Response Schema ... ', response.data)

              this.$Notice.success({title: 'Schema saved..!'})
              this.loading = false
              this.viewTemplate = []
              this.createTemplate = []
              this.mjmlUpload = []
              this.$store.dispatch('getSchema')
              this.$router.go(-1)
              // this.$router.push('/')
            })
            .catch(error => {
              console.log(error)
              this.loading = false
            })
          } else {
            // alert(this.formSchema._id)
            // this.formSchema['viewTemplate'] = this.viewtemplate
            // this.formSchema['createTemplate'] = this.createtemplate
            // this.formSchema['_id'] = this.formSchema._id
            // console.log('aaa', this.formSchema)
            api.request('put', '/schema/' + this.formSchema._id, this.formSchema).then(response => {
              // this.toggleLoading()
              // this.$router.push(data.redirect)
              console.log(response)
              this.$Message.success('Schema updated..!')
              this.loading = false
              this.$router.go(-1)
            })
            .catch(error => {
              console.log(error)
              this.loading = false
            })
          }
        } else {
          // this.$Message.error('error!')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
      this.$router.go(-1)
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
          IsArray: ''
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
        'email': ['allowedValue', 'defaultValue', 'placeholder', 'optional'],
        'number': ['min', 'max', 'allowedValue', 'defaultValue', 'placeholder', 'regEx', 'optional'],
        'phone': ['allowedValue', 'defaultValue', 'placeholder', 'regEx', 'optional'],
        'boolean': ['defaultValue', 'placeholder', 'optional'],
        'date': ['allowedValue', 'defaultValue', 'mindate', 'maxdate', 'placeholder', 'regEx', 'optional'],
        'dropdown': ['allowedValue', 'options', 'defaultValue', 'placeholder', 'regEx', 'optional']
      }
      if (typePropertys[this.formSchema.entity[index].type] === undefined) {
        return ['IsArray'].indexOf(property) >= 0
      } else {
        return typePropertys[this.formSchema.entity[index].type].indexOf(property) >= 0
      }
    },
    openGridManager(isViewTemplate) {
      this.isGridManager = true
      this.isViewTemplate = isViewTemplate
    },
    handleCloseGridClick (self) {
      if (self != undefined){
        this.addFiletoAWS(self.templatename, self.html, false)
      }
      else
      {
        this.isViewTemplate = false
        this.isGridManager = false
        this.$store.state.editTemplate = undefined
      }

    },
    opengrapesjs (isViewTemplate) {
      this.isViewTemplate = isViewTemplate
      this.isGrapesComponent = !this.isGrapesComponent
    },
    handleCloseGrapesClick (self) {
      if(self != false && self != undefined) {
        //Edit
        if(this.$store.state.editTemplate != undefined){
          if(!this.isViewTemplate)
            this.createtemplate[this.$store.state.editTemplate.index] = self
          else
            this.viewtemplate[this.$store.state.editTemplate.index] = self

          this.$store.state.editTemplate = undefined
        }
        else //Add
        {
          if(!this.isViewTemplate)
            this.createtemplate.push(self)
          else
            this.viewtemplate.push(self)
        }
      }
      this.$store.state.editTemplate = undefined
      this.isGrapesComponent = !this.isGrapesComponent
    },
    openMjmlEditor(){
      this.isMjmlEditor = !this.isMjmlEditor
    },
    handleCloseMjmlClick (self) {
      // this.mjmlUpload.push(self)
      console.log(this.mjmlUpload)
      this.isMjmlEditor = !this.isMjmlEditor
    },
    savegriddata(index, template, isViewTemplate) {
      if(index > 0)
      {
        if(isViewTemplate)
          this.viewtemplate[index] = template
        else
          this.createtemplate[index] = template
        this.isViewTemplate = false
        this.isGridManager = false
        this.$store.state.editTemplate = undefined
      }
      else
      {
        if(isViewTemplate)
          this.viewtemplate.push(template)
        else
          this.createtemplate.push(template)
        this.isViewTemplate = false
        this.isGridManager = false
        this.$store.state.editTemplate = undefined
      }
    },
    addFiletoAWS (filename, bodycontent, isUsingGridmanager) {
      //let template = {'filename':filename, 'url':bodycontent, 'usingGrapesManager':isUsingGridmanager};
      let self = this
      let isViewTemplate = self.isViewTemplate

      // if(!isViewTemplate)
      //   templatearray = this.createtemplate
      // else
      //   templatearray = this.viewtemplate

      let index = 0
      if(this.$store.state.editTemplate != undefined)
        index = this.$store.state.editTemplate.index

      let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses' } });
      var params = { Key: filename + ".html", ContentType: "html", Body: bodycontent};
      let result = bucket.upload(params).on('httpUploadProgress', function (evt) {
        console.log("Uploaded :: " + parseInt((evt.loaded * 100) / evt.total) + '%');
      }).send(function (err, data) {
        if(err) {
          // return null;
        } else {
          let template = {'filename':filename, 'url':data.Location, 'usingGrapesManager':isUsingGridmanager};
          self.savegriddata(index, template, isViewTemplate)
          //console.log('after', templatearray)
        }
      })
    },
    fetchname (name) {
      // alert('Success' + name)
      // name = parseInt(name)
      this.activetab = name
      // this.$store.state.activetab = name
      // this.$router.push(this.$store.state.tabdata[name].url)
    }
  },
  created () {
    this.setTypes(this.$route.params.id)
    this.$on('close-grid', this.handleCloseGridClick)
    this.$on('close-click', this.handleCloseGrapesClick)
    this.$on('close-mjml', this.handleCloseMjmlClick)
  },
  watch: {
    'formSchema.title' : function(v) {
       this.formSchema.title = v.toLowerCase().trim();
    },
    '$route.params.id' (newId, oldId) {
      this.setTypes(newId)
      // fetch data
      this.fetch(newId)
    },
    '$store.getters.allSchema' () {
      this.$store.getters.allSchema.forEach((schema) => {
        if (this.$route.params.id !== schema._id) {
          this.types.push({
            value: schema._id,
            label: schema.title
          })
        }
      })
    }
  }
}
</script>
