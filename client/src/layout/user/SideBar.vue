<template>
  <div style="width: inherit;">
    <div  style="background: rgb(54, 62, 79); height: 100%; position: fixed;width: inherit;">
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
                  <a  @click="$store.state.sidenavpin = !$store.state.sidenavpin">
                    <Icon type="pin" :size="24" ></Icon>
                  </a>
                </div>
              </Tooltip>
            </Row>
          </Col>
        </Col>
      </Row>
      <Row style="padding: 10px;">
        <Menu theme="dark" width="auto" style="overflow: auto;height: calc(100% - 104px);">
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
            <div style="color:yellow;padding:10px" v-if="list.length > 0">{{name}}</div>
            <Menu-item :name="index" v-for="(item, index) in list" :key="index">
              <div :title="item.id">
                <a href="javascript:void(0)" @click="handleActiveStage(item)" class="menuitem">{{item.name}}</a>
              </div>
            </Menu-item>
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
        list: []
      }
    },
    created () {
      // console.log('this.$store.state.activeFlow', this.$store.state.activeFlow)
    },
    methods: {
      handleActiveStage (item) {
        console.log('handleActiveStage', item)
        if (item.inputProperty[0].entityschema.id) {
          this.$store.state.activeList = item.id + '/' + item.inputProperty[0].entityschema.id
          this.$router.push('/list')
        } else {
          console.log('inputProperty not found!!')
        }
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
        // console.log(oldValue, newValue)
        this.activeFlow(newValue)
      }
    },
    mounted () {
      this.activeFlow(this.$store.state.activeFlow)
    }
}
</script>
<style scoped>
  .menuitem {
    color: #fff !important;
  }
</style>
