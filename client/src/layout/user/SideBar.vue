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
        <Menu theme="dark" width="auto" style="overflow: auto;height: calc(100% - 104px);" accordion   @on-select="handleopenChange">
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
            <!-- <Submenu name="1">
              <template slot="title">
                  <Icon type="ios-people" />
                  {{name}}
              </template>
              <Menu-item :name="index" v-for="(item, index) in list" :key="index">
                <div>
                  {{item.name}}
                </div>
              </Menu-item>  
            </Submenu> -->
            <!-- <div style="color:yellow;padding:10px" v-if="list.length > 0">{{name}}</div> -->
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
export default {
  data () {
    return {
      loading: false,
      name: '',
      list: [],
      flowzList: null
    }
  },
  created () {
    // console.log('this.$store.state.activeFlow', this.$store.state.activeFlow)
  },
  methods: {
    handleopenChange (node) {
      node = node.split('/')
      this.$router.push('/schemaview/' + node[0] + '/' + node[1])
    },
    handleSubmenu (item, subitem) {
      // console.log(item, subitem)
      this.$router.push('/schemaview/' + item.id + '/' + subitem.id)
    },
    // calculateProcessList (list) {
    //   return _.remove(list, (m) => {
    //     if (m.type !== 'start' && m.type !== 'endevent' && m.type !== 'intermediatethrowevent') {
    //       return m
    //     }
    //   })
    // },
    async init () {
      this.loading = true
      flowzModal.get(null, {
        $select: ['allowedusers', 'json', 'id'],
        $paginate: false
      })
      .then((response) => {
        this.loading = false
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
    },
    activeFlow (id) {
      // console.log('activeFlow', this.$store.state.activeFlow)
      this.loading = true
      if (id !== '' && id !== null) {
        flowzModal.get(id, {$select: ['json']}).then(res => {
          // console.log('res.data', res.data)
          let processList = _.cloneDeep(res.data.json.processList)
          this.loading = false
          this.name = res.data.json.name
          this.list = _.remove(processList, (m) => {
            if (m.type !== 'start' && m.type !== 'endevent' && m.type !== 'intermediatethrowevent') {
              return m
            }
          })
          // console.log('ListListListListListListListListListList: ', this.list)
          // console.log(this.list)
        }).catch(err => {
          console.log('err=>', err)
          // return []
          this.name = ''
          this.list = []
          this.loading = false
        })
      } else {
        this.name = ''
        this.list = []
        this.loading = false
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
          sitem.count = res.data.length
          for (let pitem of sitem.json.processList) {
            pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
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
            item.count = res.data.length
            for (let pitem of item.json.processList) {
              pitem.count = _.filter(res.data, {currentStatus: pitem.id}).length
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
    '$store.state.activeFlow': function (newValue, oldValue) {
      // console.log(oldValue, newValue)
      // this.activeFlow(newValue)
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
  .submentItem > a{
    color: #fff
  }
</style>
<style>
  .demo-badge-alone {
    background-color: #5cb85c !important;
  }
</style>
