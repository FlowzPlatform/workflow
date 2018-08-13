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
      <Row style="padding: 10px;">
        <Menu theme="dark" width="auto" style="overflow: auto;height: calc(100% - 104px);" accordion>
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
            <Submenu :name="key" v-for="(item, key, index) in flowzList" :key="index">
              <template slot="title">
                  <Icon type="ios-people" />
                  {{key}}
              </template>
              <Menu-item :name="subItem" v-for="(subItem, inx) in item" :key="inx">
                <div>
                  {{subItem.name}}
                </div>
              </Menu-item>  
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
/*eslint-disable*/
import flowzModal from '@/api/flowz'
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
      console.log('this.$store.state.activeFlow', this.$store.state.activeFlow)
    },
    methods: {
      async init() {
        flowzModal.get(null, {
          $select: ['allowedusers', 'json'],
          $paginate: false
        })
        .then((response) => {
          console.log('response: ', response)
          let menuItems = {}
          for(let i = 0; i < response.data.length; i++){
            // menuItems.push(response.data[i].json.name)
            menuItems[response.data[i].json.name] = []
            for(let j = 0; j < response.data[i].json.processList.length; j++){
              // console.log('response.data[i].json.processList[j].name: ', response.data[i].json.processList[j].name)
              // if(response.data[i].json.processList[j].name){
                if(response.data[i].json.processList[j].type !== 'start' && response.data[i].json.processList[j].type !== 'endevent' && response.data[i].json.processList[j].type !== 'intermediatethrowevent'){
                  let value = {
                    id: response.data[i].json.processList[j].id,
                    name: response.data[i].json.processList[j].name
                  }
                  menuItems[response.data[i].json.name].push(value)
                }
              // }
            }
          }

          this.flowzList = menuItems;
          console.log('flowzlist: ', JSON.stringify(this.flowzList))
        })
        .catch(error => {
          console.log(error)
          return {data: [], total: 0}
        })
      },
      activeFlow(id) {
        // console.log('activeFlow', this.$store.state.activeFlow)
        this.loading = true
        if (id !== '' && id !== null) {
          flowzModal.get(id, {$select: ['json']}).then(res => {
            // console.log('res.data', res.data)
            let processList = _.cloneDeep(res.data.json.processList)
            this.loading = false
            this.name = res.data.json.name
            this.list =_.remove(processList, (m)=> {
              if (m.type !== 'start' && m.type !== 'endevent' && m.type !== 'intermediatethrowevent') {
                return m
              }
            })
            console.log('ListListListListListListListListListList: ', this.list)
            console.log(this.list)
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
      '$store.state.activeFlow': function(newValue, oldValue) {
        console.log(oldValue, newValue)
        this.activeFlow(newValue)
      }
    },
    mounted () {
      this.activeFlow(this.$store.state.activeFlow)
      this.init()
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
</style>