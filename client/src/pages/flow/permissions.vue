<template>
  <div>
    <!-- {{module}} -->
    <!-- <div v-if="loading == true" class="loadingbar">
        <img class="project-loading" src="../assets/images/activity.svg" style="margin-left: 10px; width:80px; height:100px;" />
        <p style="margin-left:20px;color:gray">Populating data...{{isDone}}</p>
    </div> -->
    <!-- <h1 v-model="module" style="text-align: center; font-weight:bold;margin-bottom:10px; margin-top: 15px;">{{ titleCase(module) }}</h1> -->
    <pre>{{module}}</pre>
    <div class="table-wrapper">

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
    </div>
    <div id="overlay" v-show="showOverlay">
        <!-- <img class="project-loading" src="../assets/images/indicator.svg" style="margin-left: 10px; width:80px; height:100px;" /> -->
    </div>
  </div>

</template>

<script>
  import Vue from 'vue'
  import axios from 'axios'
  import _ from 'lodash'
  import VueWidgets from 'vue-widgets'
  import 'vue-widgets/dist/styles/vue-widgets.css'
  import config from '../../config/index'
  // import iView from 'iview'
  // import locale from 'iview/dist/locale/en-US'
  // import 'iview/dist/styles/iview.css' // CSS

  // Vue.use(iView, { locale })

  const deepRecord = require('../../assets/js/deepstream/deepRecord.js')
  // import $ from 'jquery'

  // Vue.use(iView)

  Vue.use(VueWidgets)
  export default {
    name: 'Permissions',
    props: {
      module: {
        default: null,
        type: String
      },
      instanceId: {
        default: null,
        type: String
      }
    },
    data: function () {
      return {
        isDone: 'abc',
        loading: true,
        tableData: null,
        fields: [],
        permissionsAll: [],
        count: 0,
        showOverlay: false,
        currentMsgInst: this.$store.state.currentMsgInst
      }
    },
    methods: {
      getName: function (taskId) {
        return new Promise(async resolve => {
          taskId = await this.titleCase(taskId)
          let resultName = await deepRecord.deepRecord.getCurrentTraget(this.instanceId, taskId)
          let name = resultName.name
          resolve(name)
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
          if (response.data.data.length > 0) {
            self.count++
            self.permissionsAll = _.union(self.permissionsAll, response.data.data)
            self.permissionsAll = _.map(self.permissionsAll, o => _.extend({
              app: appName
            }, o))
            self.loading = false

              // To resolve check/uncheck issue
              // if(totalApps == self.count){
              //     self.permissionsAll = _.groupBy(self.permissionsAll, 'app');
              // }
          } else {
            self.loading = false
          }
          self.loading = false
          return response.data.data
        })
          .catch(function (error) {
            console.log(error)
            self.loading = false
          })
      },
      getRoles: async function (newValue) {
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
            self.loading = false
          }
          return response.data.data
        })
          .catch(function (error) {
            self.loading = false
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
              self.loading = false
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
          // self.tableData = arrResources
          self.tableData = ['hi']
          // self.tableData = _.extend(self.tableData, arrResources)
          self.loading = false
        }).catch(function (error) {
          console.log(error)
        })
        self.loading = false
        for (var tblData in self.tableData) {
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
        self.tableData = ['hi']
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
    },
    components: {
      // VueWidgets
    },
    created: function () {
      // this.getRoles()
    },
    mounted () {
      // $('#big-video-wrap').css('width', '0px')
      // this.module = null
    }
  }
</script>

<style scoped>

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
</style>