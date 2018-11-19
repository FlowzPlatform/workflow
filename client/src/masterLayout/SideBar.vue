<template>
  <div style="width: inherit;">
    <div class="modal-container" v-if="selectedFlowObject != null" v-model="permissionsModal">
      <input type="checkbox" class="modal-checkbox" id="modal1">
      <label for="modal1" class="modal-overlay"></label>
      <div class="modal-content">
        <label for="modal1" class="modal-close" @click="selectedFlowObject = null, permissionsModal = false">&times;</label>
        <div class="table-wrapper">
          <h4 align="center" style="margin-bottom: 10px">{{titleCase(selectedFlowName)}}</h4>
          <div v-if="showTable == true">
            <table align="center" class="table-bordered" style="font-size: 115%;">
              <thead class="header"></thead>
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
                      <tr class="row" v-if="selectedFlowObject.processList[titleCase(item.service)] != undefined">
                        <template v-for="(field,fieldNumber) in fields[moduleName]">
                          <td v-if="fieldNumber ==0" style="padding:10px;font-weight:bold;border-right: 3px solid #cdd0d4;">
                            {{selectedFlowObject.processList[titleCase(item.service)].name}}
                            <!-- {{item.service}}
                            <br>
                            <br>
                            {{selectedFlowObject.processList[titleCase(item.service)]}} -->
                          </td>
                          <td v-else>
                            <table class="table-bordered" style="width:100%">
                              <tbody>
                                <tr>
                                  <template v-for="n in item.actions">
                                    <td v-for="(key, index) in Object.keys(n)" style="padding:10px;">
                                      <span style="font-size:12px">{{ titleCase(key) }}</span><br/>
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
    <Modal
        v-model="modal1"
        title="Invite"
        width='1000'>
        <div>
            <div class="container-fluid">
            <div class="row" style="background-color:#ffffff">
            <div class="col-md-4">
                <Input placeholder="Please enter email id" v-model="input"></Input>
            </div>  
            <div class="col-md-3" >
              <Select v-model="value1" placeholder="Select Role">
                <Option
                v-for="item in options"
                :key="item.value1"
                :label="item.label1"
                :value="item.value1">
                </Option>
              </Select>
            </div>
            <div class="col-md-5">
                <div class="col-md-8">
                <Select v-model="value2" placeholder="Select subscription">
                    <Option
                    v-for="item in options2"
                    :key="item.value2"
                    :label="item.label2"
                    :value="item.value2">
                    </Option>
                </Select>
                <!-- <subscription :token="$store.state.token" :value="value2" @on-change="handleAssign"></subscription> -->
                </div>
                <div class="col-md-4">
            <Button type="primary" :loading="invtBtnLoading" @click="inviteNow()">Invite Now</Button>
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
    <div id="style-5" style="background: rgb(54, 62, 79); height: 100%; position: fixed;width: inherit; overflow-y: auto;">
      <!-- <Row style="padding: 16.3px 10px;border-bottom: 1px solid #15171b;">
        <Col :span="20" :offset="3">
          <Col :span="3">
            <Row type="flex" justify="start" align="middle">
              <a @click="$store.state.sidenavtoggle = !$store.state.sidenavtoggle">
                <Icon type="navicon-round" :size="24"></Icon>
              </a>
            </Row>
          </Col>
          <Col :span="21">
            <Row type="flex" justify="end" align="middle">
              <Tooltip :content="pinNvaigationContent" placement="left">
                <div :style="stylesPin">
                  <a @click="$store.state.sidenavpin = !$store.state.sidenavpin">
                    <Icon type="pin" :size="24" ></Icon>
                  </a>
                </div>
              </Tooltip>
            </Row>
          </Col>
        </Col>
      </Row> -->
      <Row style="padding-top: 15.2%">
        <Menu theme="dark" width="auto" style="overflow: auto;height: calc(100% - 104px);" accordion @on-select="handleopenChange">
          <template v-if="loading" align="center">
            <div class="demo-spin-col">
              <Spin size="large">
                <div class="loader">
                  <icon type="load-c" :size="18" class="demo-spin-icon-load"></icon>
                </div>
              </Spin>
            </div>
          </template>
          <template v-else>
            <Submenu :name="index" v-for="(item, index) in flowzList" :key="index">
              <template slot="title">
                  {{item.name}}&nbsp;&nbsp;<span style="display:none">{{item.count}}</span>
                  <span>
                    <Badge :count="item.count"  class-name="demo-badge-alone"></Badge>
                  </span>
                  <span v-if="$store.state.role === 1 || $store.state.role === 2" style="float:right;padding-right:5px;" title="Analytics" @click.prevent="viewProgress(item)">
                    <Icon type="ios-analytics-outline" :size="20" style="margin-right:3px;padding:0px;" />
                  </span>
                  <!-- <span v-if="$store.state.role === 1" style="float:right;" title="Create Instance" @click.prevent="createInstance(item)">
                    <i class="fa fa-plus"></i>
                  </span> -->
              </template>
              <Submenu :name="index+'-6'">
                <template slot="title">
                  <Icon type="" /> Stages
                </template>
                <MenuItem :name="item.id + '/' + subItem.id" v-for="(subItem, key) in getByOrder(item.processList)" v-if="subItem && subItem.type !== 'startevent' && subItem.type !== 'endevent' && subItem.type !== 'intermediatethrowevent' && subItem.type !== 'exclusivegateway'" :key="key">
                  <!-- <template > -->
                    <!-- <Menu-item :name="item.id + '/' + subItem.id" :key="key" > -->
                      <div :title="subItem.id" class="submentItem">
                          {{subItem.name || '--'}}
                          <span style="float:right;">
                            <Badge :count="subItem.count"  class-name="demo-badge-alone"></Badge>
                          </span>
                          <!-- <span v-if="subItem.isfirst" style="float:right;padding-right:5px;" title="Create Instance" @click.prevent="createInstance(item, subItem.id)">
                            <i class="fa fa-plus"></i>
                          </span> -->
                      </div>
                    <!-- </Menu-item> -->
                  <!-- </template> -->
                </MenuItem>
              </Submenu>
              <MenuItem :name="index +'-1'">
                <span v-if="$store.state.role === 1" style="padding-right:5px;" title="Set Permission" @click.prevent="showSecurityDialog(item)">
                  <Icon type="settings" style="margin-right:0px;padding:0px;"/> Set Permission
                </span>
              </MenuItem>
              <MenuItem :name="index +'-2'">
                <span v-if="$store.state.role === 1" style="padding-right:5px;" title="Edit Flow" @click.prevent="$router.push({name: 'flow/edit', params: {id: item.id}})">
                  <Icon type="edit" style="margin-right:0px;padding:0px;"/> Edit Flow
                </span>
              </MenuItem>
              <MenuItem :name="index +'-3'">
                <span v-if="$store.state.role === 1" style="padding-right:5px;" title="Invite User" @click.prevent="showInviteDialog(item)">
                  <Icon type="ios-personadd" style="margin-right:3px;padding:0px;"/> Invite User
                </span>
              </MenuItem>
              <MenuItem :name="index +'-4'">
                <span v-if="$store.state.role === 1" style="padding-right:5px;" title="Permission Dialog" @click.prevent="showPermissionDialog(item)">
                  <i class="fa fa-lock" style="margin-right:3px;padding:0px;"/> Permission Dialog
                </span>
              </MenuItem>
              <MenuItem :name="index +'-5'">
                <span v-if="$store.state.role === 1" style="padding-right:5px;" title="Delete Flow" @click.prevent="deleteFlow(item.id, index)">
                  <Icon type="android-delete" style="margin-right:3px;padding:0px;"/> Delete Flow
                </span>
              </MenuItem>
            </Submenu>
          </template>
        </Menu>
      </Row>
    </div>
  </div>    
</template>

<script>
import flowzModal from '@/api/flowz'
import dflowzdataModal from '@/api/dflowzdata'
import expandRow2 from '../pages/flow/assigned_invite_table-expand.vue'
import expandInviteRow from '../pages/flow/own_assign.vue'
import _ from 'lodash'
import psl from 'psl'
import config from '@/config'
import axios from 'axios'
import moment from 'moment'

let subscriptionUrl = config.subscriptionUrl

export default {
  components: {
    // 'viewSVG': (resolve) => { require(['./viewSVG'], resolve) },
    expandRow2: (resolve) => { require(['../pages/flow/assigned_invite_table-expand.vue'], resolve) }
    // subscription: (resolve) => { require(['@/components/subscription'], resolve) }
  },
  data () {
    return {
      loading: false,
      invtBtnLoading: false,
      name: '',
      list: [],
      flowzList: null,
      tableData: null,
      roles: {},
      resource: {},
      flowId: '',
      showTable: false,
      showOverlay: false,
      modal1: false,
      isDone: 'abc',
      waitingText: '',
      options: '',
      value1: '',
      options2: '',
      value2: '',
      input: '',
      loadingPermisions: true,
      permissionsAll: [],
      permissionsModal: false,
      selectedFlowObject: null,
      assigned_Arr2: [],
      data2: [],
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
      assigned_Arr3: [],
      data3: [],
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
      assigned_Arr4: [],
      data4: [],
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
  methods: {
    getByOrder (array) {
      let allProcess = []
      for (let key in array) {
        allProcess[array[key].order] = array[key]
      }
      return allProcess
    },
    viewProgress (item) {
      if (item.id === this.$route.params.id) {
        let randomStr = this.makeid()
        this.$store.state.updateView = randomStr
        if (this.$store.state.role === 1) {
          this.$router.push('/admin/flow/analytics/' + item.id)
        } else if (this.$store.state.role === 2) {
          this.$router.push('/analytics/' + item.id)
        }
      } else {
        if (this.$store.state.role === 1) {
          this.$router.push('/admin/flow/analytics/' + item.id)
        } else if (this.$store.state.role === 2) {
          this.$router.push('/analytics/' + item.id)
        }
      }
    },
    handleopenChange (node) {
      node = node.split('/')
      if (this.$store.state.role === 1) {
        if (this.$route.params.stateid === node[1]) {
          let randomStr = this.makeid()
          this.$store.state.updateView = randomStr
        } else {
          this.$router.push({name: 'schemaview', params: {id: node[0], stateid: node[1]}})
        }
      } else {
        this.$router.push('/view/' + node[0] + '/' + node[1])
      }
    },
    makeid () {
      let text = ''
      let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (let i = 0; i < 8; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
      return text
    },
    async getModuleRoles (moduleId) {
      if (this.$store.state.registerRoles[moduleId]) {
        return this.$store.state.registerRoles[moduleId]
      }
      let roles = await axios.get(config.subscriptionUrl + 'register-roles?module=workflow_' + moduleId)
      if (roles !== undefined) {
        this.$store.state.registerRoles[moduleId] = roles
      }
      return roles
    },
    async getModuleResource (moduleId) {
      if (this.$store.state.registerResources[moduleId]) {
        return this.$store.state.registerResources[moduleId]
      }
      let resource = await axios.get(config.subscriptionUrl + 'register-resource?module=workflow_' + moduleId)
      if (resource !== undefined) {
        this.$store.state.registerResources[moduleId] = resource
      }
      return resource
    },
    async getModulePermissions (moduleId) {
      return await axios.get(config.getAllPermissionsUrl + 'workflow_' + moduleId)
    },
    showSecurityDialog (query) {
      this.selectedFlowObject = null
      this.selectedFlowObject = query
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
      this.selectedFlowName = query.name
      this.module = 'workflow_' + this.selectedFlowObject.id
      this.getRoles('workflow_' + this.selectedFlowObject.id)
      this.permissionsModal = true
    },
    async showInviteDialog (query) {
      var self = this
      this.flowId = 'workflow_' + query.id
      await axios.get(config.subscriptionUrl + 'register-roles?module=' + this.flowId, {
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
    async inviteNow () {
      if (this.value2 === undefined || this.value2 === '' || this.value1 === '') {
        this.$Message.warning('Please select both subscription & role for invitation')
      } else {
        this.invtBtnLoading = true
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
            authorization: this.$store.state.token
          },
          data: params
        })
        .then(function (response) {
          self.invtBtnLoading = false
          if (response.data.status === 404) {
            self.$Message.warning(response.data.data)
          } else if (response.data.code === '201') {
            // self.$message.success(response.data.message);
            self.$Message.success('User assigned successfully')
          } else if (response.data.code === '200') {
            // self.$message.success(response.data.message);
            self.$Message.warning('User already assigned for this subscription with same role')
          }
        })
        .catch(function (error) {
          self.invtBtnLoading = false
          if (error.response.status === 401) {
            let location = psl.parse(window.location.hostname)
            location = location.domain === null ? location.input : location.domain
            this.$cookie.remove('auth_token', {domain: location})
            this.$cookie.remove('subscriptionId', {domain: location})
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
    showPermissionDialog (query) {
      // this.permissionModel = true
      this.$router.push('/admin/permission/' + query.id)
    },
    deleteFlow (id, inx) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete?</p>',
        onOk: () => {
          flowzModal.delete(id)
          .then(response => {
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
    },
    capitalize (str) {
      str = str[0].toUpperCase() + str.slice(1)
      return str
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
          console.log('Err>>', error)
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
        let actionsArray = response.data.data
        let processListArray = self.selectedFlowObject.processList
        let sortedArray = []
        for (let item of actionsArray) {
          if (processListArray[self.titleCase(item.service)] === undefined) {
            let realName = _.findKey(processListArray, function (value, key) {
              return key.toLowerCase() === item.service.toLowerCase()
            })
            item['order'] = processListArray[realName].order
          } else {
            // item['order']
            item['order'] = processListArray[self.titleCase(item.service)].order
          }
          sortedArray.push(item)
        }
        sortedArray = _.sortBy(sortedArray, [function (o) { return o.order }])
        let arrResources = await _.groupBy(sortedArray, 'module')
        // self.tableData = arrResources
        // self.tableData = ['hi']
        self.tableData = await _.extend(self.tableData, arrResources)
        // for (let k = 0; k < self.tableData.length; k++) {
        // }
        self.loadingPermisions = false
      }).catch(function (error) {
        console.log(error)
      })
      self.loadingPermisions = false

      for (var tblData in self.tableData) {
        // get task name from task id
        // for (let i = 0; i < self.tableData[tblData].length; i++) {
        //   let taskId = self.titleCase(self.tableData[tblData][i].service)
        //   await deepRecord.deepRecord.getCurrentTraget(self.instanceId, taskId).then(res => {
        //     let name = res.name
        //     self.tableData[tblData][i]['serviceName'] = name
        //   }).catch(err => {
        //   })
        // }
        await self.getAllPermissions(tblData, Object.keys(self.tableData).length)
      }
      this.showTable = true
    },
    getAllPermissions: async function (appName, totalApps) {
      var self = this
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
          // if (totalApps === self.count) {
          //   self.permissionsAll = _.groupBy(self.permissionsAll, 'app')
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
          } else {
            let pValue = {
              resourceId: updateValue.resourceId, // resourceid_action
              roleId: updateValue.roleId,
              taskType: updateValue.taskType, // scope
              access_value: updateValue.accessValue,
              app: updateValue.app
            }
            self.permissionsAll.push(pValue)
          }
          self.showOverlay = false
        })
        .catch(function (error) {
          self.showOverlay = false
          console.log(error)
        })
    },
    async getDataOfSubscriptionUser () {
      this.$Loading.start()
      let subId = []
      let userData = this.$store.state.user.package
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
    async init () {
      if (this.$store.state.role === 1) {
        this.loading = true
        flowzModal.get(null, {
          $paginate: false,
          subscriptionId: this.$store.state.subscription,
          userId: this.$store.state.user._id
        })
        .then((response) => {
          this.loading = false
          this.flowzList = _.map(response.data, (m) => {
            m.count = 0
            _.map(m.processList, (p) => {
              p.count = 0
              return p
            })
            return m
          })
          this.loading = false
          this.setCounters()
        })
        .catch(error => {
          console.log(error)
          this.flowzList = []
          this.loading = false
        })
      } else {
        let self = this
        this.loading = true
        this.flowzList = []
        let modules = _.keysIn(this.$store.state.user.package[this.$store.state.subscription].role)
        modules = _.map(modules, function (o) {
          let isModule = o.match(/workflow/i)
          if (isModule !== null && isModule.length > 0) {
            return {value: o, role: self.$store.state.user.package[self.$store.state.subscription].role[o]}
          }
        })
        if (modules.length > 0) {
          this.loading = true
          let fData = []
          for (let item of modules) {
            let id = item.value.split('_')[1]
            await flowzModal.get(id, null, {
              workflowid: 'workflow_' + id
            }).then(res => {
              res.data.role = item.role
              fData.push(res.data)
            })
          }
          for (let item of fData) {
            let resource = await this.getModuleResource(item.id)
            let roles = await this.getModuleRoles(item.id)
            let permissions = await this.getModulePermissions(item.id)
            if (resource !== undefined && roles !== undefined && permissions !== undefined) {
              let role = item.role
              let fRoleIndex = _.findIndex(roles.data.data, {role: role})
              if (fRoleIndex !== -1) {
                let roleId = roles.data.data[fRoleIndex].id
                let rolePermissionData = _.filter(permissions.data.data, {roleId: roleId, access_value: '1'})
                for (let obj of rolePermissionData) {
                  let resourceId = obj.resourceId.split('_')[0]
                  let action = obj.resourceId.split('_')[1]
                  let serviceInx = _.findIndex(resource.data.data, {id: resourceId})
                  if (serviceInx !== -1) {
                    let serviceId = resource.data.data[serviceInx].service
                    _.map(item.processList, (o, k) => {
                      if (o.id.toLowerCase() === serviceId) {
                        if (o.hasOwnProperty('isaccess')) {
                          o.isaccess.push(action)
                        } else {
                          o.isaccess = [action]
                        }
                        o.isaccess = _.uniq(o.isaccess)
                      }
                    })
                  }
                }
              }
              item.count = 0
              for (let proc in item.processList) {
                item.processList[proc].count = 0
                if (!item.processList[proc].hasOwnProperty('isaccess')) {
                  delete item.processList[proc]
                }
              }
              this.flowzList.push(item)
            } else {
              this.loading = false
              this.flowzList = []
            }
          }
          this.loading = false
          this.setCounters()
        } else {
          this.flowzList = []
          this.loading = false
        }
      }
    },
    setCounters (sitem) {
      for (let item of this.flowzList) {
        if (this.$store.state.role === 1) {
          dflowzdataModal.get(null, {
            $paginate: false,
            $select: ['_state'],
            _currentStatus: true
          }, {
            ftablename: item.id.replace(/-/g, '_')
          }).then(res => {
            if (res.data.length > 0) {
              item.count = 0
              _.map(item.processList, (pitem) => {
                pitem.count = _.filter(res.data, {_state: pitem.id}).length
                item.count += pitem.count
              })
            }
          }).catch(err => {
            console.log('error', err)
          })
        } else {
          let isonce = false
          let pdata = []
          for (let key in item.processList) {
            if (!isonce) {
              dflowzdataModal.get(null, {
                $paginate: false,
                $select: ['_state'],
                _currentStatus: true
              }, {
                workflowid: 'workflow_' + item.id,
                stateid: item.processList[key].id,
                ftablename: item.id.replace(/-/g, '_')
              }).then(res => {
                if (res.data.length > 0) {
                  isonce = true
                  pdata = res.data
                  item.processList[key].count = _.filter(res.data, {_state: item.processList[key].id}).length
                  item.count += item.processList[key].count
                }
              }).catch(err => {
                console.log('error', err)
              })
            } else {
              item.processList[key].count = _.filter(pdata, {_state: item.processList[key].id}).length
              item.count += item.processList[key].count
            }
          }
        }
      }
    }
  },
  computed: {
    stylesPin () {
      let style = {}
      if (this.$store.state.sidenavpin) {
        style.transform = 'rotate(90deg)'
      }
      return style
    },
    pinNvaigationContent () {
      return !this.$store.state.sidenavpin ? 'Pin nvaigation' : 'Unpin nvaigation'
    }
  },
  watch: {
    '$store.state.subscription': function (newValue) {
      this.init()
    }
  },
  mounted () {
    this.init()
    this.getDataOfSubscriptionUser()
  },
  beforeDestroy () {
    this.$feathers.services.dflowzdata.removeAllListeners('_created')
    this.$feathers.services.dflowzdata.removeAllListeners('_removed')
    this.$feathers.services.dflowzdata.removeAllListeners('_patched')
  },
  feathers: {
    'flowz': {
      created (data) {
        if (this.$store.state.role === 1) {
          this.flowzList.push(data)
        }
      },
      updated (data) {
        this.init()
      },
      removed (data) {
        if (this.$store.state.role === 1) {
          // this.$store.state.flowz = []
          // this.init()
          let i = _.findIndex(this.flowzList, (o) => { return o.id === data.id })
          this.flowzList.splice(i, 1)
        }
      }
    },
    'dflowzdata': {
      _created (data) {
        // alert('Created' + Object.keys(data))
        let keys = Object.keys(data)
        for (let tName of keys) {
          if (data[tName]._currentStatus) {
            let finx = _.findIndex(this.flowzList, {id: tName.replace(/_/g, '-')})
            if (finx !== -1) {
              this.flowzList[finx].processList[data[tName]._state].count++
              this.flowzList[finx].count++
            }
          }
        }
      },
      _updated (data) {
      },
      _patched (data) {
        // alert('Patched' + Object.keys(data))
        let keys = Object.keys(data)
        for (let tName of keys) {
          let finx = _.findIndex(this.flowzList, {id: tName.replace(/_/g, '-')})
          if (finx !== -1 && !data[tName]._currentStatus && data[tName]._next === null) {
            if (this.flowzList[finx].processList[data[tName]._state].count > 0) {
              this.flowzList[finx].processList[data[tName]._state].count--
            }
            if (this.flowzList[finx].count > 0) {
              this.flowzList[finx].count--
            }
          }
        }
      },
      _removed (data) {
        let keys = Object.keys(data)
        for (let tName of keys) {
          if (data[tName]._currentStatus) {
            let finx = _.findIndex(this.flowzList, {id: tName.replace(/_/g, '-')})
            if (finx !== -1) {
              if (this.flowzList[finx].processList[data[tName]._state].count > 0) {
                this.flowzList[finx].processList[data[tName]._state].count--
              }
              if (this.flowzList[finx].count > 0) {
                this.flowzList[finx].count--
              }
            }
          }
        }
      }
    }
  }
}
</script>
<style scoped>
  #style-5::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    background-color: #666;
  }

  #style-5::-webkit-scrollbar
  {
    width: 10px;
    background-color: #666;
  }

  #style-5::-webkit-scrollbar-thumb
  {
    background-color: #000;
    
    /*background-image: -webkit-gradient(linear, 0 0, 0 100%,
                       color-stop(.5, rgba(255, 255, 255, .2)),
               color-stop(.5, transparent), to(transparent));*/
  }
  .submentItem  a{
    color: #c0c0c0
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
</style>
<style>
  .demo-badge-alone {
    background-color: #5cb85c !important;
  }
  .ivu-menu-vertical .ivu-menu-submenu-title-icon{
    float: left;
  }
</style>
