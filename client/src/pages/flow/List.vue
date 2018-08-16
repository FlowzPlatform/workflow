<template>
  <div class="flow">


    <div class="modal-container" v-if="selectedFlowObject != null" v-model="permissionsModal">

      <input type="checkbox" class="modal-checkbox" id="modal1">
      <label for="modal1" class="modal-overlay"></label>

      <div class="modal-content">
        <label for="modal1" class="modal-close" @click="selectedFlowObject = null, permissionsModal = false">&times;</label>
          
        <div class="table-wrapper">
          <!-- {{tableData}} -->
            <h4 align="center" style="margin-bottom: 10px">{{titleCase(module)}}</h4>
            <table class="table-bordered" style="font-size: 115%; width: 100%">
                <thead class="header">

                </thead>
                <tbody class="results">

                    <template>

                        <template v-for="(moduleName, index) in Object.keys(tableData)">
                            <!-- <h3>{{ titleCase(moduleName) }}</h3> -->
                            <tr class="row header blue">
                                <template v-for="(field, fieldNumber) in fields[moduleName]">
                                    <td scope="col" style="text-align: center;padding:10px;border-left: 3px solid #cdd0d4;">
                                        {{ getTitle(field) }}
                                    </td>
                                </template>
                            </tr>
                            <template v-for="(item, itemNumber) in (tableData)[moduleName]">
                                <tr class="row">
                                    <template v-for="(field,fieldNumber) in fields[moduleName]">
                                        <td v-if="fieldNumber ==0" style="padding:10px;font-weight:bold;border-right: 3px solid #cdd0d4;">
                                            {{ titleCase(item.service) }}
                                        </td>
                                        <td v-else>
                                            <table class="table-bordered" style="width:100%">
                                                <tbody>
                                                    <tr>
                                                        <template v-for="n in item.actions">
                                                            <td v-for="(key, index) in Object.keys(n)" style="padding:10px;">
                                                                <span style="font-size:12px">{{ titleCase(key) }}</span>
                                                                <br/>
                                                                <input class="field.dataClass" style="width: 15px;height: 15px;cursor: pointer;" type="checkbox" @click="setAccessPermision(field, item, key,$event,moduleName)" :checked="getCheckboxValue(field, item, key,moduleName)" />
                                                            </td>
                                                        </template>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                            <!-- <Widget>
                                <WidgetHeading :id="1" :Title="'Todo'" style="text-align:center;font-weight:bold;font-size:20px" :TextColor="false" :DeleteButton="false" :ColorBox="false" :Expand="false" :Collapse="true" :HeaderEditable="false">
                                    {{ titleCase(moduleName) }}
                                </WidgetHeading>
                                <WidgetBody>
                                    <tr class="row header blue">
                                        <template v-for="(field, fieldNumber) in fields[moduleName]">
                                            <td scope="col" style="text-align: center;padding:10px;border-left: 3px solid #cdd0d4;">
                                                {{ getTitle(field) }}
                                            </td>
                                        </template>
                                    </tr>
                                    <template v-for="(item, itemNumber) in (tableData)[moduleName]">
                                        <tr class="row">
                                            <template v-for="(field,fieldNumber) in fields[moduleName]">
                                                <td v-if="fieldNumber ==0" style="padding:10px;font-weight:bold;border-right: 3px solid #cdd0d4;">
                                                    {{ getName(item.service) }}
                                                </td>
                                                <td v-else>
                                                    <table class="table-bordered" style="width:100%">
                                                        <tbody>
                                                            <tr>
                                                                <template v-for="n in item.actions">
                                                                    <td v-for="(key, index) in Object.keys(n)" style="padding:10px;">
                                                                        <span style="font-size:12px">{{ titleCase(key) }}</span>
                                                                        <br/>
                                                                        <input class="field.dataClass" style="width: 15px;height: 15px;cursor: pointer;" type="checkbox" @click="setAccessPermision(field, item, key,$event,moduleName)" :checked="getCheckboxValue(field, item, key,moduleName)" />
                                                                    </td>
                                                                </template>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </template>
                                        </tr>
                                    </template>

                                </WidgetBody>
                            </Widget> -->
                        </template>
                    </template>
                </tbody>
            </table>
        </div>

      </div>
    </div>

    <!-- <Button type="primary" @click="modal1 = true">Display dialog box</Button> -->
    <Modal
        v-model="modal1"
        title="Invite"
        @on-ok="ok"
        @on-cancel="cancel" width='1000'>
        <div>
            <div class="container-fluid">
            <div class="row" style="background-color:#ffffff">
            <div class="col-md-4">
                <el-input placeholder="Please enter email id" v-model="input"></el-input>
            </div>  
            <div class="col-md-3" >
                <el-select v-model="value1" placeholder="Select Role">
                <el-option
                v-for="item in options"
                :key="item.value1"
                :label="item.label1"
                :value="item.value1">
                </el-option>
            </el-select>
            </div>
            <div class="col-md-5">
                <div class="col-md-8">
                <el-select v-model="value2" placeholder="Select subscription">
                    <el-option
                    v-for="item in options2"
                    :key="item.value2"
                    :label="item.label2"
                    :value="item.value2">
                    </el-option>
                </el-select>
                <!-- <subscription :token="$store.state.token" :value="value2" @on-change="handleAssign"></subscription> -->
                </div>
                <div class="col-md-4">
            <el-button type="primary" :loading="loading" @click="inviteNow()">Invite Now</el-button>
                </div>
            </div>
            </div>
            <Tabs  style="margin-top: 20px">
                <TabPane label="Own Subscription">
                    <Table :columns="columns3" :data="data3" stripe></Table>
                </TabPane>
                <TabPane label="Assigned Subscription">
                    <Table :columns="columns2" :data="data2" stripe></Table>
                </TabPane>
                <TabPane label="Assigned History">
                    <Table :columns="columns4" :data="data4" stripe></Table>
                </TabPane>
            </Tabs>
        </div>
        </div>
    </Modal>

    <!-- <Modal v-if="selectedFlowObject != null"
        v-model="permissionsModal"
        title="Set Permissions"
        width="720"
        @on-ok="savePermissions"
        @on-cancel="cancelModal"> -->
        <!-- <strong v-if="selectedFlowObject != null">{{this.selectedFlowObject.id}}</strong> -->
        <!-- <permissions  :instanceId="selectedFlowObject.id" :module="'workflow_' + selectedFlowObject.id"></permissions> -->
        <!-- <strong>hi</strong> -->
        <!-- <div v-if="loadingPermisions == false" class="table-wrapper">
          <table class="table-bordered" style="font-size: 115%; width: 100%">
              <thead class="header">

              </thead>
              <tbody class="results">

                  <template>

                      <template v-for="(moduleName, index) in Object.keys(tableData)">
                          <Widget>
                              <WidgetHeading :id="1" :Title="'Todo'" style="text-align:center;font-weight:bold;font-size:20px" :TextColor="false" :DeleteButton="false" :ColorBox="false" :Expand="false" :Collapse="true" :HeaderEditable="false">
                                  {{ titleCase(moduleName) }}
                              </WidgetHeading>
                              <WidgetBody>
                                  <tr class="row header blue">
                                      <template v-for="(field, fieldNumber) in fields[moduleName]">
                                          <td scope="col" style="text-align: center;padding:10px;border-left: 3px solid #cdd0d4;">
                                              {{ getTitle(field) }}
                                          </td>
                                      </template>
                                  </tr>
                                  <template v-for="(item, itemNumber) in (tableData)[moduleName]">
                                      <tr class="row">
                                          <template v-for="(field,fieldNumber) in fields[moduleName]">
                                              <td v-if="fieldNumber ==0" style="padding:10px;font-weight:bold;border-right: 3px solid #cdd0d4;">
                                                  {{ getName(item.service) }}
                                              </td>
                                              <td v-else>
                                                  <table class="table-bordered" style="width:100%">
                                                      <tbody>
                                                          <tr>
                                                              <template v-for="n in item.actions">
                                                                  <td v-for="(key, index) in Object.keys(n)" style="padding:10px;">
                                                                      <span style="font-size:12px">{{ titleCase(key) }}</span>
                                                                      <br/>
                                                                      <input class="field.dataClass" style="width: 15px;height: 15px;cursor: pointer;" type="checkbox" @click="setAccessPermision(field, item, key,$event,moduleName)" :checked="getCheckboxValue(field, item, key,moduleName)" />
                                                                  </td>
                                                              </template>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                              </td>
                                          </template>
                                      </tr>
                                  </template>

                              </WidgetBody>
                          </Widget>
                      </template>
                  </template>
              </tbody>
          </table>
        </div> -->
        
    <!-- </Modal> -->

    <Row type="flex" justify="end">
      <Button type="primary" size="small" style="margin-bottom: 2px;" @click="addNewFlow" icon="plus"> Add</Button>
    </Row>
    <Row>
      <Table size="small" :loading="loading" :columns="columns10" :data="flowzList" stripe></Table>
    </Row>
    <Row style="margin-top: 4px; float: right">
      <Page :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
    </Row>
    <!-- <div slot="content">
        <div class="schema-form ivu-table-wrapper">
            <div class="ivu-table ivu-table-border">
                <div class="ivu-table-body"> -->
                    <!-- <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="">
                                    <div class="ivu-table-cell">
                                        <span>Name</span>
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
                            <template v-if="flowzList.length > 0">
                            <tr class="ivu-table-row" v-for="(item, index) in flowzList">
                                <td>
                                <div class="ivu-table-cell">
                                 {{columns10}}
                                </div>
                                </td>
                                <td>
                                <div class="ivu-table-cell">
                                    {{item.ProcessName}}
                                </div>
                                </td>
                                <td class="">
                                    <div class="ivu-table-cell">
                                        {{item.notes}}
                                    </div>
                                </td>
                                <td>
                                    <div class="ivu-table-cell">
                                    <a @click="createNewInstance(index, item.id)" style="margin-right:8px"><Icon type="arrow-right-b" size="21" color="#2411c5"></Icon></a>
                                    <a style="margin-right:8px"><router-link :to="{name: 'flow/edit', params: {id: item.id}}"><Icon type="edit" size="17"></Icon></router-link></a>
                                    <a @click="deleteFlow(item.id)"><Icon type="android-delete" size="20" color="#e74c3c"></Icon></a>
                                    <a @click="deleteFlow(item.id)"><Icon type="navicon-round" size="20"></Icon></a>
                                    </div>
                                </td>
                            </tr>
                            </template>
                            <template v-else>
                              <tr class="ivu-table-row">
                                <td colspan="3">
                                  <div class="ivu-table-cell" align="center">
                                    No record found
                                  </div>
                                </td>
                              </tr>
                            </template>
                        </tbody>
                    </table> -->
                <!-- </div>
            </div>
        </div> -->
    <!-- </div> -->
  </div>
</template>
<script>
import flowz from '@/api/flowz'
import _ from 'lodash'
const X2JS = require('x2js')
import schemamappingModel from '@/api/schemamapping'
import schemaModel from '@/api/schema'
import approvalModel from '@/api/approval'
import instanceModel from '@/api/flowzinstance'
import expandRow from './table-expand.vue'
import axios from 'axios'
import psl from 'psl'
import subscription from '@/components/subscription'

// import Vue from 'vue'
// import VueWidgets from 'vue-widgets'
// import 'vue-widgets/dist/styles/vue-widgets.css'
import config from '../../config/index'
import expandRow2 from './assigned_invite_table-expand.vue'
let subscriptionUrl = config.subscriptionUrl

// Vue.use(VueWidgets)

// import Permissions from './permissions'
const deepRecord = require('../../assets/js/deepstream/deepRecord.js')
import expandInviteRow from './own_assign.vue'
import moment from 'moment'
import Cookies from 'js-cookie'

export default {
  name: 'Flowz',
  components: {
    expandRow,
    expandRow2,
    subscription
    // 'permissions': Permissions
  },
  data () {
    return {
      isDone: 'abc',
      loadingPermisions: true,
      tableData: null,
      fields: [],
      permissionsAll: [],
      count: 0,
      showOverlay: false,
      currentMsgInst: this.$store.state.currentMsgInst,
      instanceId: null,
      module: null,
      selectedFlowObject: null,
      permissionsModal: false,
      inviteModal: false,
      modal1: false,
      loading: true,
      limit: 10,
      cpage: 1,
      skip: 0,
      total: 0,
      flowzList: [],
      columns10: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'Name',
          key: 'ProcessName'
        },
        {
          title: 'Notes',
          key: 'notes'
        },
        {
          title: 'Action',
          key: 'action',
          width: 400,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'arrow-right-b'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#2411c5'
                },
                on: {
                  click: () => {
                    this.createNewInstance(params.index, this.flowzList[params.index].id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'settings'
                },
                style: {
                  color: '#008080',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    this.showSecurityDialog(params)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'edit'
                },
                style: {
                  color: '#7DE144',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    this.$router.push({name: 'flow/edit', params: {id: this.flowzList[params.index].id}})
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'ios-personadd'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#703636'
                },
                on: {
                  click: () => {
                    this.showInviteDialog(params)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'android-delete'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#e74c3c'
                },
                on: {
                  click: () => {
                    this.deleteFlow(this.flowzList[params.index].id, params.index)
                  }
                }
              }, '')
              // h('Button', {
              //   props: {
              //     type: 'text',
              //     size: 'large',
              //     icon: 'navicon-round'
              //   },
              //   style: {
              //     marginRight: '3px',
              //     padding: '0px',
              //     fontSize: '20px',
              //     color: '#00C851'
              //   },
              //   on: {
              //     click: () => {
              //       this.deleteFlow(this.flowzList[params.index].id)
              //     }
              //   }
              // }, '')
            ])
          }
        }
      ],
      options: '',
      value1: '',
      options2: '',
      value2: '',
      roleOption1: '',
      roleValue1: '',
      input: '',
      // loading :false,
      data2: [],
      data3: [],
      data4: [],
      assigned_Arr2: [],
      assigned_Arr3: [],
      assigned_Arr4: [],
      columns2: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandInviteRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'Subscription Name',
          key: 'name'
        },
        {
          title: 'Subscription Id',
          key: 'subscriptionId'
        },
        {
          title: 'Assigned By',
          key: 'invitedBy'
        }
      ],
      columns3: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow2, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'Subscription Name',
          key: 'name'
        },
        {
          title: 'Subscription Id',
          key: 'subscriptionId'
        },
        {
          title: 'Role',
          key: 'role',
          render: (h, params) => {
            return h('div', [
              h('p', this.capitalize(params.row.role))
            ])
          }
        }
      ],
      columns4: [
        {
          title: 'Subscription Name',
          key: 'name'
        },
        {
          title: 'Subscription Id',
          key: 'subscriptionId'
        },
        {
          title: 'Role',
          key: 'role',
          render: (h, params) => {
            return h('div', [
              h('strong', this.capitalize(params.row.role[Object.keys(params.row.role)]))
            ])
          }
        },
        {
          title: 'Module',
          key: 'role',
          render: (h, params) => {
            return h('div', [
              h('p', this.capitalize(Object.keys(params.row.role)[0]))
            ])
          }
        },
        {
          title: 'Assigned By',
          key: 'fromEmail'
        },
        {
          title: 'Assigned Date',
          key: 'assignDate',
          render: (h, params) => {
            var date1 = moment(params.assignDate).format('DD-MMM-YYYY')
            return h('div', [
              h('span', date1)
            ])
          }
        },
        {
          title: 'Un-Assigned Date',
          key: 'unassignDate',
          render: (h, params) => {
            var date1 = moment(params.unassignDate).format('DD-MMM-YYYY')
            return h('div', [
              h('span', date1)
            ])
          }
        },
        {
          title: 'Assign Period',
          key: '',
          render: (h, params) => {
            var now = moment(params.assignDate)
            var end = moment(params.unassignDate)
            var duration = moment.duration(now.diff(end))
            var days = duration.asDays()
            return days + ' Days'
          }
        }
      ]
    }
  },
  mounted () {
    // flowz.get()
    // .then(response => {
    //   // console.log('response', response)
    //   this.flowzList = response.data.data
    //   this.loading = false
    //   // console.log('this.flowzList', this.flowzList)
    // })
    // .catch(error => {
    //   console.log(error)
    // })
    this.init()
    this.getDataOfSubscriptionUser()
  },
  feathers: {
    'flowz-instance': {
      created (data) { // update status using socket
        flowz.get()
        .then(response => {
          this.flowzList = response.data.data
        })
        .catch(error => {
          console.log(error)
        })
      }
    }
  },
  methods: {
    savePermissions () {

    },
    cancelModal () {

    },
    showSecurityDialog (query) {
      console.log('query: ', query)
      this.selectedFlowObject = null
      this.selectedFlowObject = query.row
      axios.post('https://api.flowzcluster.tk/authldap/init', {
        'app': 'workflow_' + this.selectedFlowObject.id
      })
      .then(function (response) {
        console.log(response)
      })
      .catch(function (error) {
        console.log(error)
      })
      this.tableData = null
      this.instanceId = this.selectedFlowObject.id
      this.module = 'workflow_' + this.selectedFlowObject.id
      this.getRoles('workflow_' + this.selectedFlowObject.id)
      // Permissions.methods.getRoles('workflow_' + this.selectedFlowObject.id)
      console.log('Permissions: ', Permissions)
      this.permissionsModal = true
    },
    ok () {
      this.$Message.info('Clicked ok')
    },
    cancel () {
      this.$Message.info('Clicked cancel')
    },
    handleAssign (value) {
      console.log(value)
      this.value2 = value
    },
    showInviteDialog (query) {
      console.log('query: ', query)
      if (query.row.roles !== undefined) {
        this.flowId = 'Workflow_' + query.row.id
        let temp1 = query.row.roles.split(',')
        let roles = []
        for (let index = 0; index < temp1.length; index++) {
          roles.push({
            value1: temp1[index],
            label1: temp1[index]
          })
          console.log({roles})
          this.options = roles
        }
        this.modal1 = true
      } else {
        alert('First add roles')
      }
    },
    capitalize (str) {
      str = str[0].toUpperCase() + str.slice(1)
      return str
    },
    async getHistory () {
      axios.get(subscriptionUrl + 'subscription-invitation', {
        // axios.get('http://172.16.230.86:3030/subscription-invitation', {
        headers: {
          'Authorization': Cookies.get('auth_token')
        },
        params: {isDeleted: true, own: false}
      })
      .then(response => {
        this.data4 = response.data.data
      })
      .catch((err) => {
        console.log('Error:', err)
      })
    },
    async getDataOfSubscriptionUser () {
      this.$Loading.start()
      let subId = []
      // await axios.get(subscriptionUrl + 'register-roles', {
      //   params: {module: 'webbuilder'}
      // })
      // .then(response => {
      //   let newData = response.data.data
      //   for (let index = 0; index < newData.length; index++) {
      //     roleId.push({
      //       value1: newData[index].role,
      //       label1: newData[index].role
      //     })
      //   }
      //   this.options = roleId
      // })
      // .catch((err) => {
      //   console.log(err)
      // })
      axios.get(config.loginURL + '/userdetails', {
        headers: {
          authorization: Cookies.get('auth_token')
        }
      })
      .then(response => {
        console.log({response})
        let newData = response.data.data.package
        for (var key in newData) {
          if (newData.hasOwnProperty(key)) {
            if (newData[key].role === 'admin') {
              subId.push({
                value2: newData[key].subscriptionId,
                label2: newData[key].name
              })
              this.assigned_Arr3.push(newData[key])
            } else {
              this.assigned_Arr2.push(newData[key])
            }
          }
        }
        this.data2 = this.assigned_Arr2
        this.data3 = this.assigned_Arr3
        this.options2 = subId
        this.$Loading.finish()
      })
      .catch((err) => {
        console.log('Error:', err)
      })
    },
    async inviteNow () {
      console.log(this.value2, this.value1)
      if (this.value2 === undefined || this.value2 === '' || this.value1 === '') {
        this.$message.warning('Please select both subscription & role for invitation')
      } else {
        this.loading = true
        let self = this
        let obj = _.find(this.options2, {value2: this.value2})
        let params = {
          toEmail: this.input,
          subscriptionId: this.value2,
          name: obj.label2,
          role: {
            [this.flowId]: this.value1
          },
          fromEmail: this.$store.state.user.email
        }
        await axios({
          method: 'POST',
          url: subscriptionUrl + 'invite',
          headers: {
            authorization: Cookies.get('auth_token')
          },
          data: params
        })
        .then(function (response) {
          self.loading = false
          if (response.data.status === 404) {
            self.$message.warning(response.data.data)
          } else if (response.data.code === '201') {
            // self.$message.success(response.data.message);
            self.$message.success('User assigned successfully')
          } else if (response.data.code === '200') {
            // self.$message.success(response.data.message);
            self.$message.warning('User already assigned for this subscription with same role')
          }
        })
        .catch(function (error) {
          self.loading = false
          if (error.response.status === 401) {
            let location = psl.parse(window.location.hostname)
            location = location.domain === null ? location.input : location.domain
            Cookies.remove('auth_token', {domain: location})
            Cookies.remove('subscriptionId', {domain: location})
            self.$store.commit('logout', self)
            self.$router.push({
              name: 'login'
            })
          } else if (error.response.status === 403) {
            self.$Notice.error({
              duration: 0,
              title: error.response.statusText,
              desc: error.response.data.message + '. Please <a href="' + config.flowzDashboardUrl + '/subscription-list" target="_blank">Subscribe</a>'}
            )
          }
        })
      }
    },
    handlePage (page) {
      this.cpage = page
      this.skip = (page * this.limit) - this.limit
      this.init()
    },
    handlePagesize (size) {
      this.limit = size
      this.skip = 0
      this.init()
    },
    init () {
      var string = '?$skip=' + this.skip + '&$limit=' + this.limit
      flowz.getCustom(string)
      .then(response => {
        // console.log('response', response)
        this.total = response.data.total
        this.flowzList = response.data.data
        this.loading = false
        // console.log('this.flowzList', this.flowzList)
      })
      .catch(error => {
        this.loading = false
        this.$Notice({duration: '3', title: 'Network Error', desc: ''})
        console.log(error)
      })
    },
    async createNewInstance (index, id) {
      // let generatedJson = await this.generateJson(this.flowzList[index].xml)
      let generatedJson = this.flowzList[index].json
      console.log('this.flowzList[index]', this.flowzList[index])
      generatedJson.allowedusers = this.flowzList[index].allowedusers ? this.flowzList[index].allowedusers : []
      // console.log('generatedJson', JSON.stringify(generatedJson))
      // console.log('generatedJson', generatedJson)
      generatedJson.fid = id
      generatedJson.createdOn = Date()
      // console.log('instanceModel', instanceModel)
      instanceModel.post(generatedJson)
      .then(response => {
        // console.log('response.data', response.data)
        this.$router.push('/admin/flow/instance/' + response.data.id)
      })
      .catch(error => {
        console.log(error)
      })
    },
    addNewFlow () {
      this.$store.dispatch('removeXMLtoLocalStorage')
      this.$router.push({name: 'flow/new'})
    },
    deleteFlow (id, inx) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          flowz.delete(id)
          .then(response => {
            // console.log('response.data', response.data)
            this.$Notice.success({title: 'Success!!', desc: 'Flowz Deleted...'})
            console.log('inx, ', inx)
            this.flowzList.splice(inx, 1)
          })
          .catch(error => {
            this.$Notice.error({title: 'Error!!', desc: 'Flowz Not Deleted...'})
            console.log(error)
          })
        },
        onCancel: () => {
          console.log('inx, ', inx)
        }
      })
    },
    async generateJson (xml) {
      let self = this
      let x2js = new X2JS()
      let jsonXML = x2js.xml2js(xml)
      jsonXML = jsonXML.definitions.process
      console.log('jsonXML', jsonXML)
      let instanceObject = {}
      instanceObject.name = jsonXML._name
      instanceObject.start_delay = 3000
      // Add Start Events
      if (_.isArray(jsonXML.startEvent)) {
        instanceObject.start_states = _.map(jsonXML.startEvent, (d) => { return d._id })
      } else {
        instanceObject.start_states = [jsonXML.startEvent._id]
      }
      // convert object to array object
      if (!_.isArray(jsonXML.startEvent)) {
        jsonXML.startEvent = [jsonXML.startEvent]
      }
      instanceObject.processList = []
      // start process
      for (let item of instanceObject.start_states) {
        let processData = await self.getStartProcess(jsonXML)
        let process = _.find(processData, (f) => {
          return f.id === item
        })
        instanceObject.processList.push(process)
        // other all process base on start target id
        await self.getAllProcess(jsonXML, process, instanceObject.processList)
      }
      // convert uniq process
      instanceObject.processList = _.uniqBy(instanceObject.processList, 'id')
      return instanceObject
      // return instanceObject
    },
    async getAllProcess (jsonXML, process, processRef) {
      let self = this
      if (process === undefined) {
        return
      }
      for (let d of process.target) {
      // _.forEach(process.target, (d) => {
        // merge all module
        console.log('jsonXML', jsonXML)
        var mergeModules = _.chain(jsonXML).map((m, k) => {
          if (typeof m === 'object') {
            m = _.isArray(m) ? m : [m]
            m = _.map(m, im => {
              im.workerType = k
              return im
            })
          }
          return m
        }).filter((m, i) => {
          return typeof m === 'object'
        })
        // .map((m, i) => {
        //   return _.isArray(m) ? m : [m]
        // })
        .value()
        // console.log('mergeModules', mergeModules)
        // generate process
        let result = await _.chain(_.union(...mergeModules))
        .filter((f, i, k) => {
          // console.log('k', k)
          return f._id === d.id
        })
        .map(async (m) => {
          // console.log('m', m)
          let _mapping = await self.getMapping(m, mergeModules)
          console.log('m', m)
          return {
            id: m._id,
            capacity: (m._isFormInput) ? m._capacity : false,
            name: m._name,
            type: m.workerType, // m.outgoing ? (m._name === 'recruiter' ? 'select' : 'task') : 'end',
            target: m.outgoing ? self.getTargetId(m, jsonXML) : [],
            mapping: (_.union(..._mapping)),
            inputProperty: await self.getInputProperties(m),
            outputProperty: await self.getOutputProperties(m)
          }
        }).head()
        .value()
        processRef.push(result)
        await self.getAllProcess(jsonXML, result, processRef)
      }
    },
    async getStartProcess (process) {
      let self = this
      return await Promise.all(_.chain(process.startEvent)
      .map(async (m) => {
        return {
          id: m._id,
          capacity: (m._isFormInput) ? m._capacity : false,
          name: m._name,
          type: 'start',
          target: self.getTargetId(m, process),
          mapping: [],
          inputProperty: await self.getInputProperties(m),
          outputProperty: await self.getOutputProperties(m)
        }
      }).value())
    },
    getTargetId (event, process) {
      if (!_.isArray(event.outgoing)) {
        event.outgoing = [event.outgoing]
      }
      return _.map(event.outgoing, (targetMap) => {
        return _.chain(process.sequenceFlow).filter((ftr) => {
          return ftr._id === targetMap.__text
        }).map((m) => {
          return {
            id: m._targetRef,
            outputid: m.extensionElements !== undefined ? m.extensionElements.myIOMapping.mapping._producer : ''
          }
        }).value()[0]
        // return { id: targetMap.__text }
      })
    },
    async getInputProperties (proccess) {
      if (proccess.extensionElements && proccess.extensionElements.myInputs) {
        if (!_.isArray(proccess.extensionElements.myInputs.input)) {
          proccess.extensionElements.myInputs.input = [proccess.extensionElements.myInputs.input]
        }
        return await Promise.all(_.map(proccess.extensionElements.myInputs.input, async (m) => {
          return {
            id: m._id,
            entityschema: await schemaModel.getAll(m._entityschema),
            approvalClass: m._approvalClass !== undefined && m._approvalClass !== '0' ? await approvalModel.get(m._approvalClass).then(content => {
              return content.data
            }) : undefined,
            cancelLabel: m._cancelLabel,
            choice: m._choice,
            createTemplate: m._createTemplate,
            emailTemplate: m._emailTemplate,
            notes: m._notes,
            submitLabel: m._submitLabel,
            viewTemplate: m._viewTemplate
          }
        }))
      } else {
        return []
      }
    },
    async getOutputProperties (proccess) {
      if (proccess.extensionElements && proccess.extensionElements.myOutputs) {
        if (!_.isArray(proccess.extensionElements.myOutputs.output)) {
          proccess.extensionElements.myOutputs.output = [proccess.extensionElements.myOutputs.output]
        }
        return await Promise.all(_.map(proccess.extensionElements.myOutputs.output, async (m) => {
          return {
            id: m._id,
            entityschema: await schemaModel.getAll(m._entityschema),
            approvalClass: m._approvalClass !== undefined && m._approvalClass !== '0' ? await approvalModel.get(m._approvalClass).then(content => {
              return content.data
            }) : undefined,
            cancelLabel: m._cancelLabel,
            choice: m._choice,
            createTemplate: m._createTemplate,
            emailTemplate: m._emailTemplate,
            notes: m._notes,
            submitLabel: m._submitLabel,
            viewTemplate: m._viewTemplate
          }
        }))
      } else {
        return []
      }
    },
    async getMapping (event, mergeModules) {
      var self = this
      if (!_.isArray(event.incoming)) {
        event.incoming = [event.incoming]
      }
      return await Promise.all(_.chain(_.union(...mergeModules))
        .filter((f) => {
          return _.filter(event.incoming, (i) => { return i.__text === f._id }).length > 0
        }).map(async (m) => {
          let sourceRef = m._sourceRef
          if (m.extensionElements && m.extensionElements.myIOMapping) {
            if (!_.isArray(m.extensionElements.myIOMapping.mapping)) {
              m.extensionElements.myIOMapping.mapping = [m.extensionElements.myIOMapping.mapping]
            }
            return await Promise.all(_.map(m.extensionElements.myIOMapping.mapping, async (m) => {
              var content = await schemamappingModel.get(m._schemamapping)
              content.data['sourceid'] = sourceRef // _.chain(_.union(...mergeModules)).find((fnd) => { return fnd._id === event.incoming.__text }).value()._sourceRef
              content.data.MapData = await Promise.all(_.map(content.data.MapData, async (schema) => {
                return {
                  producerField: schema.producerField,
                  transform: schema.transform,
                  consumerField: schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
                }
              }))
              content.data.MapData = self.mapDataConvertToSquenceFlow(content.data.MapData)
              return content.data
            }))
          } else {
            return []
          }
        }).value())
      // temp = await Promise.all(temp)
      // return temp
    },
    mapDataConvertToSquenceFlow (MapData) {
      let newMapData = []
      _.map(MapData, (m) => {
        if (_.isArray(m.consumerField)) {
          _.forEach(m.consumerField, (fe) => {
            if (!_.isArray(fe.consumerField)) {
              newMapData.push({
                consumerField: _.reduceRight([fe.consumerTitle], function (memo, arrayValue) {
                  var obj = {}
                  obj[arrayValue] = memo
                  return obj
                }, fe.consumerField),
                transform: fe.transform,
                producerField: _.reduceRight([fe.producerTitle], function (memo, arrayValue) {
                  var obj = {}
                  obj[arrayValue] = memo
                  return obj
                }, fe.producerField)
              })
            }
          })
        } else {
          newMapData.push(m)
        }
      })
      return newMapData
    },
    async getMapData (mapId) {
      var content = await schemamappingModel.get(mapId)
      let producer = await schemaModel.get(content.data.producer)
      let consumer = await schemaModel.get(content.data.consumer)
      return await Promise.all(_.map(content.data.MapData, async (schema) => {
        var obj = {
          consumerTitle: consumer.data.title,
          producerTitle: producer.data.title,
          transform: schema.transform,
          producerField: schema.producerField,
          consumerField: schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
        }
        // obj[producer.data.title] = schema.producerField
        // obj[consumer.data.title] = schema.ctype ? (await self.getMapData(schema.consumerField)) : _.first(schema.consumerField)
        return obj
      }))
    },
    getName: function (taskId) {
      return new Promise(async resolve => {
        taskId = this.titleCase(taskId)
        deepRecord.deepRecord.getCurrentTraget(this.instanceId, taskId).then(res => {
          console.log('res: ', res)
          // let name = res.name
          console.log('name: ', name)
          resolve('name')
        }).catch(err => {
          console.log('err: ', err)
          resolve('ERROR')
        })
      })
      // console.log('Name: ', JSON.stringify(name))
      // return name
    },
    getAllPermissions: async function (appName, totalApps) {
      var self = this
        // console.log('getAllPerm:', config.getAllPermissionsUrl+appName)
      await axios.get(config.getAllPermissionsUrl + appName, {
          // headers: {
          //   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          // },
      }).then(function (response) {
        console.log('ResponseResponseResponseResponseResponseResponse: ', response)
        if (response.data.data.length > 0) {
          self.count++
          console.log('Count:', self.count, totalApps)
          self.permissionsAll = _.union(self.permissionsAll, response.data.data)
          self.permissionsAll = _.map(self.permissionsAll, o => _.extend({
            app: appName
          }, o))
          self.loadingPermisions = false

            // To resolve check/uncheck issue
            // if(totalApps == self.count){
            //     self.permissionsAll = _.groupBy(self.permissionsAll, 'app');
            // }
        } else {
          self.loadingPermisions = false
        }
        self.loadingPermisions = false
        return response.data.data
      })
        .catch(function (error) {
          console.log('Get all permission error:', error)
          console.log(error)
          self.loadingPermisions = false
        })
    },
    getRoles: async function (newValue) {
      console.log('called: ', newValue)
      // this.tableData = {}
      var self = this
      // console.log('Subscription roles URL: ' + config.subscriptionUrl + 'register-roles?module=' + newValue)
      await axios.get(config.subscriptionUrl + 'register-roles?module=' + newValue, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        }
      }).then(function (response) {
          // console.log("Get all roles:",_.groupBy(response.data.data, 'module'));
        // console.log('all roles:', response)
        if (response.data.data.length > 0) {
          self.isDone = tblData
          var arrRoles = _.groupBy(response.data.data, 'module')
          for (var tblData in arrRoles) {
            var obj = {
              name: 'name',
              title: '',
              sortField: 'name'
            }
            arrRoles[tblData].splice(0, 0, obj)
            // console.log('arraData', arrRoles)
          }
          self.fields = arrRoles
          self.callTaskList(newValue)
        } else {
          self.loadingPermisions = false
        }
        return response.data.data
      })
        .catch(function (error) {
          self.loadingPermisions = false
          console.log('Get all roles error:', error)
          // console.log(error.response.status)
          // console.log('error: ', error)
          if (error.response.status === 500) {
            let msg = error.response.data.message.substr(error.response.data.message.indexOf(':') + 1)
            self.$Modal.warning({
              title: 'Warning',
              content: msg + '.<br> You are <b>not authorized</b> to see ROLES',
              onOk: () => {
                self.$router.go(-1)
              }
            })
          } else {
            self.loadingPermisions = false
          }
        })
    },
    callTaskList: async function (newValue) {
      var self = this
      await axios.get(config.subscriptionUrl + 'register-resource', {
        params: {
          module: newValue
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(async function (response) {
        let arrResources = await _.groupBy(response.data.data, 'module')
        console.log('arrResources: ', arrResources)
        // self.tableData = arrResources
        // self.tableData = ['hi']
        self.tableData = _.extend(self.tableData, arrResources)
        console.log('table data: ', JSON.stringify(self.tableData))
        self.loadingPermisions = false
      }).catch(function (error) {
        console.log('Get role permissions error:', error)
        console.log(error)
      })
      self.loadingPermisions = false
      for (var tblData in self.tableData) {
        console.log('table data for loop: ', self.tableData)
        await self.getAllPermissions(tblData, Object.keys(self.tableData).length)
      }
      // axios.get(config.subscriptionUrl+'register-resource', {
      // headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      // },
      //  }).then(function (response) {
      //     console.log("Get resources:",response.data.data);
      //     if(response.data.data.length > 0){
      //         let arrResources = _.groupBy(response.data.data, 'module');
      //         self.tableData = arrResources;
      //         //console.log("Table rows:",Object.keys(self.tableData));
      //         for (var tblData in arrResources){
      //             console.log("arrResources:",tblData)
      //             self.getAllPermissions(tblData, Object.keys(self.tableData).length)
      //         }
      // }
      // return response.data.data
      // })
      //     .catch(function (error) {
      //     console.log("Get role permissions error:",error);
      //     console.log(error);
      // })
      // self.tableData = ['hi']
    },
    getCheckboxValue: function (role, resources, action, appName) {
      let resID = resources.id + '_' + action
      let index = _.findIndex(this.permissionsAll, function (d) {
        return (d.roleId === role.id) && (d.resourceId === resID)
      })
      if (index > -1) {
        let permission = this.permissionsAll[index].access_value
        return parseInt(permission)
      } else {
        return parseInt(0)
      }
    },
    setAccessPermision: function (roleField, item, action, event, moduleName) {
      var accessVal = 0
      this.showOverlay = true
      let self = this
      if (event.target.checked) {
        accessVal = 1
      }
      console.log('Set permission params 1:', event.target.checked)

      let updateValue = {
        resourceId: item.id + '_' + action, // resourceid_action
        roleId: roleField.id,
        taskType: 'global', // scope
        accessValue: accessVal,
        app: moduleName
      }

      console.log('Set permission params: 2', item)
      axios.post(config.setPermissionUrl, updateValue, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
        .then(function (response) {
          console.log('Set permission response:', response)

          let resID = item.id + '_' + action
          let index = _.findIndex(self.permissionsAll, function (d) {
            return (d.roleId === roleField.id) && (d.resourceId === resID)
          })
          console.log('Set permission response index:', index)
          if (index > -1) {
            if (self.permissionsAll[index].access_value === '1') {
              self.permissionsAll.splice(index, 1)
            } else {
              self.permissionsAll[index].access_value = '1'
            }
            // self.permissionsAll[index].access_value=accessVal
            // return parseInt(permission)
            // console.log("Permiision update:--",self.permissionsAll[index].access_value)
          } else {
            let pValue = {
              resourceId: updateValue.resourceId, // resourceid_action
              roleId: updateValue.roleId,
              taskType: updateValue.taskType, // scope
              access_value: updateValue.accessValue,
              app: updateValue.app
            }
              // console.log("Per Obj:--",pValue)
            self.permissionsAll.push(pValue)
          }
          self.showOverlay = false
        })
        .catch(function (error) {
          self.showOverlay = false
          console.log('Set permission error:', error)
          console.log(error)
        })
    },
    getTitle: function (field) {
      if (typeof field.title === 'undefined') {
        return this.titleCase(field.role)
      }
      return this.titleCase(field.title)
    },
    titleCase: function (str) {
      return str.replace(/\w+/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    }
  }
}
</script>
<style scoped>
  .ivu-modal{
    width: 1000px !important
  }
  .ui.table {
    font-size: 1em;
    display: inline-table;
  }
    .thead > span {
    display: inline-block;
    width: 120px;
    line-height: 40px;
    box-shadow: inset 0 0 1px 0 rgba(0,0,0,.5);
    background-color: rgba(255,0,0,.3);
    text-align: center;
  }

  /* .vw-widget{
    overflow-x:scroll;
    width: 500px;
  } */

  .table-wrapper {
    overflow-x:auto;
    overflow-y:auto;
    /*margin-left: 100px;*/
    /*margin-top:20px;*/
    /*margin-right: 100px;*/
  }
  td {
    text-align: center; /* center checkbox horizontally */
    vertical-align: middle; /* center checkbox vertically */
    height: 50px;
    width: 50px;
  }

  /* td, th {
    padding: 5px 20px;
    width: 50px;
  } */

  th:first-child {
    /* position: fixed; */
    /* left: 30px */
  }
  td:first-child {
    /* position: fixed;
    left: 30px */
  }

  @media screen and (max-width: 580px) {
  .table {
    display: block;
  }
  }
  .row {
  display: table-row;
  background: #f6f6f6;
  }
  .row:nth-of-type(odd) {
  background: #e9e9e9;
  }
  .row.header {
  font-weight: 900;
  color: #ffffff;
  background: #ea6153;
  }
  .row.green {
  background: #27ae60;
  }
  .row.blue {
  background: #2980b9;
  }
  @media screen and (max-width: 580px) {
  .row {
    padding: 8px 0;
    display: block;
  }
  }

  .cell {
  padding: 6px 12px;
  display: table-cell;
  }
  @media screen and (max-width: 580px) {
  .cell {
    padding: 2px 12px;
    display: block;
  }
  }
  .loadingbar{
    text-align: center;
    position: absolute;
    top: 40%;
    left: 45%;
  }


  #overlay {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 2;
    cursor: pointer;
    padding-left: 50%;
    padding-top: 25%;
  } 

  .modal-checkbox {
    display: none;
  }

  .modal-overlay {
    position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .5);
    z-index: 1000;
  }

  .modal-content {
    position: fixed;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #fff;
    padding: 2em 2em 1em 2em;
    overflow-x: auto;
    z-index: 1000;
  }

  .modal-close {
    position: absolute;
    top: .25em;
    right: .5em;
    font-size: 2em;
    line-height: 1;
    font-weight: 300;
    color: #666;
    cursor: pointer;
  }

  .modal-title {
    font-size: 1.5em;
    font-weight: normal;
    margin: 0 0 .66666em 0;
  }

  @media (min-width: 600px) {
    .modal-content {
      max-width: 600px;
      top: 10%;
      right: 0;
      margin: 0 auto;
      height: auto;
      width: auto;
      max-height: 80%;
    }
  }

  /* 
  Maybe add some animations!
  https://tympanus.net/codrops/2013/06/25/nifty-modal-window-effects/ 
  */
</style>