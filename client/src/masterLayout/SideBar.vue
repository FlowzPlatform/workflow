<template>
  <div style="width: inherit;">
    <div id="style-5" style="background: rgb(54, 62, 79); height: 100%; position: fixed;width: inherit; overflow-y: auto;">
      <Row style="padding: 16.3px 10px;border-bottom: 1px solid #15171b;">
        <Col :span="20" :offset="2">
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
      </Row>
      <Row>
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
                  {{item.name}}&nbsp;&nbsp;
                  <span>
                    <Badge :count="item.count"  class-name="demo-badge-alone"></Badge>
                  </span>
                  <!-- <span v-if="$store.state.role === 1" style="float:right;" title="Create Instance" @click.prevent="createInstance(item)">
                    <i class="fa fa-plus"></i>
                  </span> -->
                  <span v-if="$store.state.role === 1" style="float:right;padding-right:5px;" title="Preview Progress" @click.prevent="viewProgress(item)">
                    <i class="fa fa-line-chart"></i>
                  </span>
              </template>
              <template
                v-for="(subItem, key) in getByOrder(item.processList)" 
                v-if="subItem && subItem.type !== 'startevent' && subItem.type !== 'endevent' && subItem.type !== 'intermediatethrowevent'"
              >
                <Menu-item 
                  :name="item.id + '/' + subItem.id" 
                  :key="key" 
                >
                  <div :title="subItem.id" class="submentItem">
                      {{subItem.name}}
                      <span style="float:right;">
                        <Badge :count="subItem.count"  class-name="demo-badge-alone"></Badge>
                      </span>
                      <!-- <span v-if="subItem.isfirst" style="float:right;padding-right:5px;" title="Create Instance" @click.prevent="createInstance(item, subItem.id)">
                        <i class="fa fa-plus"></i>
                      </span> -->
                  </div>
                </Menu-item>
              </template>
            </Submenu>
          </template>
        </Menu>
      </Row>
    </div>
  </div>    
</template>

<script>
import flowzModal from '@/api/flowz'
import finstanceModal from '@/api/finstance'
import _ from 'lodash'
import config from '@/config'
import axios from 'axios'
export default {
  data () {
    return {
      loading: false,
      name: '',
      list: [],
      flowzList: null,
      roles: {},
      resource: {}
    }
  },
  created () {
    // console.log('this.$store.state.activeFlow', this.$store.state.activeFlow)
  },
  methods: {
    getByOrder (array) {
      let allProcess = []
      for (let key in array) {
        allProcess[array[key].order] = array[key]
      }
      return allProcess.sort((a, b) => {
        return a.order - b.order
      })
    },
    // createInstance (item, subItemID) {
    //   // console.log('item', item)
    //   this.$Loading.start()
    //   let fheaders = null
    //   if (subItemID !== undefined) {
    //     fheaders = {
    //       workflowid: 'workflow_' + item.id,
    //       stateid: subItemID
    //     }
    //   }
    //   finstanceModal.post({fid: item.id}, null, fheaders).then(res => {
    //     this.$Notice.success({title: 'Instance Generated'})
    //     this.$Loading.finish()
    //   }).catch(e => {
    //     this.$Loading.error()
    //     console.log('error', e.response)
    //     if (e.response.data.message) {
    //       this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
    //     } else {
    //       this.$Notice.error({title: 'Error', desc: 'Instace Not Generated'})
    //     }
    //   })
    // },
    viewProgress (item) {
      // console.log('item: ', item)
      if (item.id === this.$route.params.id) {
        let randomStr = this.makeid()
        this.$store.state.updateView = randomStr
        this.$router.push('/admin/flow/analytics/' + item.id)
      } else {
        this.$router.push('/admin/flow/analytics/' + item.id)
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
        // this.$router.push('/admin/schemaview/' + node[0] + '/' + node[1])
      } else {
        this.$router.push('/view/' + node[0] + '/' + node[1])
      }
    },
    makeid () {
      var text = ''
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      for (var i = 0; i < 8; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

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
    async init () {
      if (this.$store.state.role === 1) {
        this.loading = true
        flowzModal.get(null, {
          $paginate: false
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
            // console.log('', {resource}, {roles}, {permissions})
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
              this.flowzList = fData
              this.loading = false
              this.setCounters()
            } else {
              this.loading = false
              this.flowzList = []
            }
          }
          this.loading = false
        } else {
          this.flowzList = []
          this.loading = false
        }
      }
    },
    setCounters (sitem) {
      if (sitem) {
        if (this.$store.state.role === 1) {
          finstanceModal.get(null, {
            $paginate: false,
            $select: ['currentStatus'],
            mainStatus: 'inprocess',
            fid: sitem.id
          }).then(res => {
            // console.log('res count', res.data)
            sitem.count = 0
            _.map(sitem.processList, (pitem) => {
              pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
              sitem.count += pitem.count
            })
            // for (let pitem of sitem.json.processList) {
            //   pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
            //   sitem.count += pitem.count
            // }
          }).catch(err => {
            console.log('error', err)
          })
        } else {
          let once = false
          let mdata = []
          sitem.count = 0
          for (let pitem in sitem.processList) {
            if (!once) {
              finstanceModal.get(null, {
                $paginate: false,
                $select: ['currentStatus'],
                mainStatus: 'inprocess',
                fid: sitem.id
              }, {
                workflowid: 'workflow_' + sitem.id,
                stateid: sitem.processList[pitem].id
              }).then(res => {
                if (res.data.length > 0) {
                  once = true
                  mdata = res.data
                  sitem.processList[pitem].count = _.filter(res.data, {currentStatus: sitem.processList[pitem].id}).length
                  sitem.count += sitem.processList[pitem].count
                }
              }).catch(err => {
                console.log('error', err)
              })
            } else {
              sitem.processList[pitem].count = _.filter(mdata, {currentStatus: sitem.processList[pitem].id}).length
              sitem.count += sitem.processList[pitem].count
            }
          }
        }
      } else {
        for (let item of this.flowzList) {
          if (this.$store.state.role === 1) {
            finstanceModal.get(null, {
              $paginate: false,
              $select: ['currentStatus'],
              mainStatus: 'inprocess',
              fid: item.id
            }).then(res => {
              if (res.data.length > 0) {
                _.map(item.processList, (pitem) => {
                  pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
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
              // console.log('item', item)
              if (!isonce) {
                finstanceModal.get(null, {
                  $paginate: false,
                  $select: ['currentStatus'],
                  mainStatus: 'inprocess',
                  fid: item.id
                }, {
                  workflowid: 'workflow_' + item.id,
                  stateid: item.processList[key].id
                }).then(res => {
                  if (res.data.length > 0) {
                    isonce = true
                    pdata = res.data
                    item.processList[key].count = _.filter(res.data, {currentStatus: item.processList[key].id}).length
                    item.count += item.processList[key].count
                  }
                }).catch(err => {
                  console.log('error', err)
                })
              } else {
                item.processList[key].count = _.filter(pdata, {currentStatus: item.processList[key].id}).length
                item.count += item.processList[key].count
              }
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
    // '$store.state.role': function (newValue) {
    //   this.init()
    // }
  },
  mounted () {
    // this.activeFlow(this.$store.state.activeFlow)
    this.init()
  },
  feathers: {
    'finstance': {
      created (data) {
        let finx = _.findIndex(this.flowzList, {id: data.fid})
        if (finx !== -1) {
          // this.flowzList[finx].count += 1
          this.setCounters(this.flowzList[finx])
        }
      },
      updated (data) {
        // console.log('updated', data)
        let finx = _.findIndex(this.flowzList, {id: data.fid})
        if (finx !== -1) {
          // this.flowzList[finx].count += 1
          this.setCounters(this.flowzList[finx])
        }
      },
      removed (data) {
        // console.log('removed', data)
        let finx = _.findIndex(this.flowzList, {id: data.fid})
        if (finx !== -1) {
          // this.flowzList[finx].count += 1
          this.setCounters(this.flowzList[finx])
        }
      }
    },
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
        // console.log('Removed Data: ', data)
        if (this.$store.state.role === 1) {
          // this.$store.state.flowz = []
          // this.init()
          let i = _.findIndex(this.flowzList, (o) => { return o.id === data.id })
          this.flowzList.splice(i, 1)
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
</style>
<style>
  .demo-badge-alone {
    background-color: #5cb85c !important;
  }
  .ivu-menu-vertical .ivu-menu-submenu-title-icon{
    float: left;
  }
</style>
