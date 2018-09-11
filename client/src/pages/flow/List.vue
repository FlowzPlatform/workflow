<template>
  <div class="flow">


    <div class="modal-container" v-if="selectedFlowObject != null" v-model="permissionsModal">

      <input type="checkbox" class="modal-checkbox" id="modal1">
      <label for="modal1" class="modal-overlay"></label>

      <div class="modal-content">
        <label for="modal1" class="modal-close" @click="selectedFlowObject = null, permissionsModal = false">&times;</label>
          
        <div class="table-wrapper">
           <h4 align="center" style="margin-bottom: 10px">{{titleCase(selectedFlowName)}}</h4>
            <div v-if="showTable == true">
              <table align="center" class="table-bordered" style="font-size: 115%;">
                <thead class="header">

                </thead>
                <tbody class="results">

                    <template>

                        <template v-for="(moduleName, index) in Object.keys(tableData)">
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
                                            {{ item.serviceName }}
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
                        </template>
                    </template>
                </tbody>
              </table>
            </div>
            <div v-else>
              <p align="center"><small>{{waitingText}}</small></p>
            </div>

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


    <Row type="flex" justify="end">
      <Button type="primary" size="small" style="margin-bottom: 2px;" @click="addNewFlow" icon="plus"> Add</Button>
    </Row>
    <Row>
      <Table size="small" :loading="loading" :columns="columns10" :data="flowzList" stripe></Table>
    </Row>
    <Row style="margin-top: 4px; float: right">
      <Page :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
    </Row>
  </div>
</template>
<script>
import flowz from '@/api/flowz'
import _ from 'lodash'
import finstanceModal from '@/api/finstance'
import axios from 'axios'
import viewSVG from './viewSVG'
import psl from 'psl'
import subscription from '@/components/subscription'

import config from '@/config'
import expandRow2 from './assigned_invite_table-expand.vue'
let subscriptionUrl = config.subscriptionUrl
// Vue.use(VueWidgets)
// import Permissions from './permissions'
// const deepRecord = require('../../assets/js/deepstream/deepRecord.js')
import expandInviteRow from './own_assign.vue'
import moment from 'moment'
import Cookies from 'js-cookie'

export default {
  name: 'Flowz',
  components: {
    'viewSVG': viewSVG,
    expandRow2,
    subscription
  },
  data () {
    return {
      showTable: false,
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
      selectedFlowName: null,
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
          key: 'SVG',
          width: 50,
          align: 'center',
          type: 'expand',
          render: (h, params) => {
            if (params.row.svg) {
              return h(viewSVG, {
                props: {
                  align: 'center',
                  svgStr: params.row.svg
                }
              })
            } else {
              return h('div', 'No SVG')
            }
          }
        },
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'Id',
          key: 'id'
        },
        {
          title: 'Action',
          key: 'action',
          width: 300,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'arrow-right-b'
                },
                domProps: {
                  title: 'Start Instance'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#2411c5'
                },
                on: {
                  click: () => {
                    this.createNewInstance(params.row.id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'settings'
                },
                domProps: {
                  title: 'Set Permission'
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
                domProps: {
                  title: 'Edit Flow'
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
                domProps: {
                  title: 'Delete Flow'
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
      waitingText: '',
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
      this.selectedFlowObject = null
      this.selectedFlowObject = query.row
      axios.post(config.ldapURL, {
        'app': 'workflow_' + this.selectedFlowObject.id
      })
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error)
      })
      this.showTable = false
      this.tableData = null
      this.instanceId = this.selectedFlowObject.id
      this.selectedFlowName = query.row.name
      this.module = 'workflow_' + this.selectedFlowObject.id
      this.getRoles('workflow_' + this.selectedFlowObject.id)
      // Permissions.methods.getRoles('workflow_' + this.selectedFlowObject.id)
      this.permissionsModal = true
    },
    ok () {
    },
    cancel () {
    },
    handleAssign (value) {
      this.value2 = value
    },
    async showInviteDialog (query) {
      var self = this
      let newValue = 'workflow_' + query.row.id
      await axios.get(config.subscriptionUrl + 'register-roles?module=' + newValue, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        }
      }).then(function (response) {
        if (response.data.data.length > 0) {
          let roles = []
          for (let i = 0; i < response.data.data.length; i++) {
            roles.push({
              value1: response.data.data[i].role,
              label1: response.data.data[i].role
            })
          }
          self.options = roles
        } else {
          self.loadingPermisions = false
        }
        return response.data.data
      })
        .catch(function (error) {
          console.log(error)
        })
      this.modal1 = true
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
      let userData = this.$store.state.user.package
      console.log(userData)
      for (var key in userData) {
        if (userData.hasOwnProperty(key)) {
          if (userData[key].role === 'admin') {
            subId.push({
              value2: userData[key].subscriptionId,
              label2: userData[key].name
            })
            this.assigned_Arr3.push(userData[key])
          } else {
            this.assigned_Arr2.push(userData[key])
          }
        }
      }
      this.data2 = this.assigned_Arr2
      this.data3 = this.assigned_Arr3
      this.options2 = subId
      this.$Loading.finish()
    },
    async inviteNow () {
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
            [this.flowId]: this.value1.toLowerCase()
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
        this.total = response.data.total
        this.flowzList = response.data.data
        this.loading = false
      })
      .catch(error => {
        this.loading = false
        this.$Notice({duration: '3', title: 'Network Error', desc: ''})
        console.log(error)
      })
    },
    createNewInstance (item) {
      this.$Loading.start()
      let fheaders = null
      finstanceModal.post({fid: item.id}, null, fheaders).then(res => {
        this.$Notice.success({title: 'Instance Generated'})
        this.$Loading.finish()
      }).catch(e => {
        this.$Loading.error()
        console.log('error', e.response)
        if (e.response.data.message) {
          this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
        } else {
          this.$Notice.error({title: 'Error', desc: 'Instace Not Generated'})
        }
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
            this.flowzList.splice(inx, 1)
          })
          .catch(error => {
            this.$Notice.error({title: 'Error!!', desc: 'Flowz Not Deleted...'})
            console.log(error)
          })
        },
        onCancel: () => {
        }
      })
    },
    getAllPermissions: async function (appName, totalApps) {
      var self = this
        // console.log('getAllPerm:', config.getAllPermissionsUrl+appName)
      await axios.get(config.getAllPermissionsUrl + appName, {
          // headers: {
          //   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          // },
      }).then(function (response) {
        if (response.data.data.length > 0) {
          self.count++
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
          self.loadingPermisions = false
          console.log(error)
        })
    },
    getRoles: async function (newValue) {
      // this.tableData = {}
      var self = this
      self.waitingText = 'Loading...'
      await axios.get(config.subscriptionUrl + 'register-roles?module=' + newValue, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;'
        }
      }).then(function (response) {
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
          }
          self.fields = arrRoles
          self.callTaskList(newValue)
        } else {
          self.loadingPermisions = false
          self.waitingText = 'No Roles Found'
        }
        return response.data.data
      })
        .catch(function (error) {
          self.loadingPermisions = false
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
          self.waitingText = 'No Data'
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
        // self.tableData = arrResources
        // self.tableData = ['hi']
        self.tableData = await _.extend(self.tableData, arrResources)
        // for (let k = 0; k < self.tableData.length; k++) {
        //   console.log('task id: ', self.tableData[k])
        // }
        self.loadingPermisions = false
      }).catch(function (error) {
        console.log(error)
      })
      self.loadingPermisions = false

      // for (var tblData in self.tableData) {
      //   // get task name from task id
      //   for (let i = 0; i < self.tableData[tblData].length; i++) {
      //     let taskId = self.titleCase(self.tableData[tblData][i].service)
      //     await deepRecord.deepRecord.getCurrentTraget(self.instanceId, taskId).then(res => {
      //       let name = res.name
      //       self.tableData[tblData][i]['serviceName'] = name
      //     }).catch(err => {
      //       console.log(err)
      //     })
      //   }
      //   await self.getAllPermissions(tblData, Object.keys(self.tableData).length)
      // }
      this.showTable = true
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

      let updateValue = {
        resourceId: item.id + '_' + action, // resourceid_action
        roleId: roleField.id,
        taskType: 'global', // scope
        accessValue: accessVal,
        app: moduleName
      }

      axios.post(config.setPermissionUrl, updateValue, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
        .then(function (response) {
          let resID = item.id + '_' + action
          let index = _.findIndex(self.permissionsAll, function (d) {
            return (d.roleId === roleField.id) && (d.resourceId === resID)
          })
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
      max-width: 800px;
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