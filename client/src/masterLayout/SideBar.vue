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
                  <Icon type="ios-people" />
                  {{item.json.name}}
                  <span style="float:right;">
                    <Badge :count="item.count"  class-name="demo-badge-alone"></Badge>
                  </span>
                  <span v-if="$store.state.role === 1" style="float:right;" title="Preview Progress" @click.prevent="viewProgress(item)">
                    <i class="fa fa-line-chart"></i>
                  </span>
              </template>
              <template
                v-for="(subItem, inx) in item.json.processList" 
                v-if="subItem.type !== 'start' && subItem.type !== 'endevent' && subItem.type !== 'intermediatethrowevent'"
              >
                <Menu-item 
                  :name="item.id + '/' + subItem.id" 
                  :key="inx" 
                >
                  <div :title="subItem.id" class="submentItem">
                    <a @click="handleSubmenu(item, subItem)">
                      {{subItem.name}}
                      <span style="float:right;">
                        <Badge :count="subItem.count"  class-name="demo-badge-alone"></Badge>
                      </span>
                    </a>
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
    viewProgress (item) {
      console.log('item: ', item)
      this.$router.push('/admin/flow/analytics/' + item.id)
    },
    handleopenChange (node) {
      node = node.split('/')
      console.log('node', node)
      if (this.$store.state.role === 1) {
        this.$router.push({name: 'schemaview', params: {id: node[0], stateid: node[1]}})
        // this.$router.push('/admin/schemaview/' + node[0] + '/' + node[1])
      } else {
        this.$router.push('/schemaview/' + node[0] + '/' + node[1])
      }
    },
    handleSubmenu (item, subitem) {
      // console.log(item, subitem)
      this.$router.push('/schemaview/' + item.id + '/' + subitem.id)
    },
    async getModuleRoles (moduleId) {
      if (this.roles[moduleId]) {
        return this.roles[moduleId]
      }
      let roles = await axios.get(config.subscriptionUrl + 'register-roles?module=workflow_' + moduleId)
      if (roles !== undefined) {
        this.roles[moduleId] = roles
      }
      return roles
    },
    async getModuleResource (moduleId) {
      if (this.resource[moduleId]) {
        return this.resource[moduleId]
      }
      let resource = await axios.get(config.subscriptionUrl + 'register-resource?module=workflow_' + moduleId)
      if (resource !== undefined) {
        this.resource[moduleId] = resource
      }
      return resource
    },
    async getModulePermissions (moduleId) {
      return await axios.get(config.getAllPermissionsUrl + 'workflow_' + moduleId)
    },
    async init () {
      if (this.$store.state.role === 1) {
        this.loading = true
        if (this.$store.state.flowz.length > 0) {
          this.loading = false
          this.flowzList = _.map(this.$store.state.flowz, (m) => {
            m.count = 0
            _.map(m.json.processList, (p) => {
              p.count = 0
              return p
            })
            return m
          })
          this.setCounters()
        } else {
          flowzModal.get(null, {
            $select: ['json', 'id'],
            $paginate: false
          })
          .then((response) => {
            this.loading = false
            this.$store.state.flowz = response.data
            this.flowzList = _.map(response.data, (m) => {
              m.count = 0
              _.map(m.json.processList, (p) => {
                p.count = 0
                return p
              })
              return m
            })
            this.setCounters()
            // console.log('flowzlist: ', this.flowzList)
          })
          .catch(error => {
            console.log(error)
            this.loading = false
          })
        }
      } else {
        let modules = _.keysIn(this.$store.state.user.package[this.$store.state.subscription].role)
        let self = this
        modules = _.map(modules, function (o) {
          let isModule = o.match(/workflow/)
          if (isModule !== null && isModule.length > 0) {
            return {value: o, role: self.$store.state.user.package[self.$store.state.subscription].role[o]}
          }
        })
        if (modules.length > 0) {
          this.loading = true
          let fData = []
          for (let item of modules) {
            let id = item.value.split('_')[1]
            let finx = _.findIndex(this.$store.state.flowz, {id: id})
            if (finx !== -1) {
              let mData = this.$store.state.flowz[finx]
              mData.role = item.role
              fData.push(mData)
            } else {
              flowzModal.get(id, {
                $select: ['id', 'json']
              }).then(res => {
                res.data.role = item.role
                fData.push(res.data)
              })
            }
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
                    _.map(item.json.processList, (o) => {
                      if (o.id.toLowerCase() === serviceId) {
                        if (o.hasOwnProperty('permission')) {
                          o.permission.push(action)
                        } else {
                          o.permission = [action]
                        }
                        o.permission = _.uniq(o.permission)
                      }
                    })
                  }
                }
              }
            } else {
              console.log('No Permission!! :: ', item.id)
            }
            _.remove(item.json.processList, (m) => {
              if (!m.hasOwnProperty('permission')) {
                return m
              }
            })
          }
          this.loading = false
          this.flowzList = fData
          this.setCounters()
        } else {
          this.flowzList = []
        }
      }
    },
    setCounters (sitem) {
      if (sitem) {
        finstanceModal.get(null, {
          $paginate: false,
          $select: ['currentStatus'],
          mainStatus: 'inprocess',
          fid: sitem.id
        }).then(res => {
          // console.log('res count', res.data)
          // sitem.count = res.data.length
          for (let pitem of sitem.json.processList) {
            pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
            sitem.count += pitem.count
          }
        }).catch(err => {
          console.log('error', err)
        })
      } else {
        for (let item of this.flowzList) {
          // console.log('------------------', item)
          finstanceModal.get(null, {
            $paginate: false,
            $select: ['currentStatus'],
            mainStatus: 'inprocess',
            fid: item.id
          }).then(res => {
            // console.log('res count', res.data)
            // item.count = res.data.length
            for (let pitem of item.json.processList) {
              pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
              item.count += pitem.count
            }
          }).catch(err => {
            console.log('error', err)
          })
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
    // this.activeFlow(this.$store.state.activeFlow)
    this.init()
  },
  feathers: {
    'finstance': {
      created (data) {
        // console.log('created', data)
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
