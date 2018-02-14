<template>
  <div>
    <Table border :loading="loading" :columns="columns" :data="flowzList.data"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;"> 
        <Page :page-size="$store.state.limitPage" :total="flowzList.total" :current="current" @on-change="changePage"></Page>
      </div>
    </div>
    <!-- <div>
      <template v-for="item in flowzList.data">
        <div class="flow-menu">
          <div class="flow-image">
          <viewSVG :svgStr="item.svg"></viewSVG></div>
          <div class="flow-name"> {{ item.ProcessName }} </div>
        </div>
      </template>
    </div> -->
    <!-- <Row :gutter="16">
      <Col :xs="12" :sm="6" v-for="flowzitem in flowzList" v-bind:key="flowzitem.id" style="padding-bottom:15px">
          <router-link :to="'list/' + flowzitem.id">
            <div class="widget info-widget no-header" >
              <div class="widget-body">
                <div class="info-widget-inner">
                  <div class="stats">
                    <template v-if="flowzitem.svg">
                      <div v-html="flowzitem.svg"></div>
                    </template>
                    <div class="stats-title">{{flowzitem.ProcessName}}</div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>  
      </Col>
      </Row> -->
  </div>
</template>
<script>
import _ from 'lodash'
import moment from 'moment'

// Models
import flowzinstanceModel from '@/api/flowzinstance'
import flowz from '@/api/flowz'

// Components
import flowInstance from './flowInstance'
import viewSVG from './viewSVG'

export default {
  name: 'dashboard',
  components: {
    'viewSVG': viewSVG
  },
  data () {
    return {
      flowzList: {},
      processLog: [],
      loading: true,
      columns: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(flowInstance, {
              props: {
                fid: params.row.id
              }
            })
          }
        },
        {
          title: '#',
          key: 'ProcessName',
          width: 200,
          render: (h, params) => {
            if (params.row.svg) {
              return h('Poptip', {
                props: {
                  trigger: 'hover',
                  placement: 'right'
                }
              }, [
                h(viewSVG, {
                  props: {
                    svgStr: params.row.svg
                  }
                }),
                h('div', {
                  slot: 'title'
                }, [
                  h('b', params.row.ProcessName)
                ]),
                h('div', {
                  slot: 'content'
                }, [
                  h(viewSVG, {
                    props: {
                      svgStr: params.row.svg
                    }
                  })
                ])
              ])
            } else {
              return h('div', 'No SVG')
            }
          }
        },
        {
          title: 'ProcessName',
          key: 'ProcessName'
        },
        {
          title: 'Remaining InputRequireds',
          key: 'inputRemain',
          width: 200,
          align: 'center',
          render: (h, params) => {
            if (params.row.inputRemain > 0) {
              return h('Badge', {
                props: {
                  count: params.row.inputRemain.toString()
                }
              })
            } else {
              return h('div', (params.row.inputRemain === 0 ? 'No Input Remaining' : 'Loading...'))
            }
          }
        }
      ],
      current: 1,
      flowzinstanceList: {}
    }
  },
  methods: {
    async init () {
      this.loading = true
      this.flowzList = await (flowz.get(null, {
        $limit: this.$store.state.limitPage,
        $useremail: this.$store.state.user.email,
        $skip: this.$store.state.limitPage * (this.current - 1),
        $select: ['ProcessName', 'svg', 'id', 'allowedusers']
      })
      .then((response) => {
        for (let item of response.data.data) {
          item.inputRemain = -1
        }
        return response.data
      })
      .catch(error => {
        console.log(error)
        return {data: [], total: 0}
      }))
      for (let item of this.flowzList.data) {
        flowzinstanceModel.get({
          fid: item.id,
          $paginate: false,
          $select: ['process_log', 'id']
        }).then(response => {
          this.flowzinstanceList[item.id] = _.cloneDeep(response.data)
          let count = _.chain(response.data).filter(f => {
            return f.process_log
          }).map(m => {
            m.process_log = _.chain(m.process_log).sortBy(s => {
              return moment(s.lastModified)
            }).last().value()
            return m.process_log
          }).countBy(f => {
            return f.status === 'inputRequired'
          }).result('true').value()
          item.inputRemain = count !== undefined ? count : 0
          console.log('this.flowzinstanceList', this.flowzinstanceList)
        })
      }
      // await this.getInputRequired()
      this.loading = false
    },
    changePage (newValue) {
      this.current = newValue
      this.init()
      // console.log('newValue', newValue)
    },
    setCount (id, index) {
      flowzinstanceModel.get({
        fid: id,
        $paginate: false,
        $select: ['process_log']
      }).then(response => {
        let count = _.chain(response.data).filter(f => {
          return f.process_log
        }).map(m => {
          m.process_log = _.chain(m.process_log).sortBy(s => {
            return moment(s.lastModified)
          }).last().value()
          return m.process_log
        }).countBy(f => {
          return f.status === 'inputRequired'
        }).result('true').value()
        this.flowzList.data[index].inputRemain = count !== undefined ? count : 0
      })
    }
  },
  mounted () {
    this.init()
  },
  feathers: {
    'flowz': {
      created (data) {
        // console.log('Created :: ', data)
        if (data.id !== undefined) {
          data.inputRemain = 0
          if (this.flowzList.data.length < this.$store.state.limitPage) {
            this.flowzList.data.push(data)
          }
          this.flowzList.total++
        }
      },
      updated (data) {
        // console.log('Updated :: ', data)
        if (data.id !== undefined) {
          data.inputRemain = -1
          data._expanded = false
          let getIndex = _.findIndex(this.flowzList.data, {id: data.id})
          // console.log('getIndex  ', getIndex)
          if (getIndex !== undefined && getIndex > 0) {
            this.flowzList.data.splice(getIndex, 1)
            this.flowzList.data.splice(getIndex, 0, data)
            this.setCount(data.id, getIndex)
          }
        }
      },
      removed (data) {
        // console.log('Deleted :: ', data)
        if (data.id !== undefined) {
          // data.inputRemain = -1
          let getIndex = _.findIndex(this.flowzList.data, {id: data.id})
          // console.log('getIndex  ', getIndex)
          if (getIndex !== undefined && getIndex >= 0) {
            this.flowzList.data.splice(getIndex, 1)
            // this.flowzList.data.splice(getIndex, 0, data)
            // this.setCount(data.id, getIndex)
          }
          this.flowzList.total--
          if (this.flowzList.data.length === 0) {
            if (this.current !== 1) {
              this.current--
            }
            // console.log('this.current', this.current)
            this.init()
          }
        }
      }
    },
    'flowz-instance': {
      created (data) {
        console.log('flowz-instance created:: ')
      },
      updated (data) {
        console.log('flowz-instance updated:: ')
        if (!this.flowzinstanceList[data.fid]) {
          return
        }
        let _inx = _.findIndex(this.flowzinstanceList[data.fid], f => { return f.id === data.id })
        if (_inx >= 0) {
          this.flowzinstanceList[data.fid][_inx] = data
        } else {
          this.flowzinstanceList[data.fid].push(data)
        }

        for (let item of this.flowzList.data) {
          if (item.id === data.fid) {
            let temp = _.cloneDeep(this.flowzinstanceList[data.fid])
            let count = _.chain(temp).filter(f => {
              return f.process_log
            }).map(m => {
              m.process_log = _.chain(m.process_log).sortBy(s => {
                return moment(s.lastModified)
              }).last().value()
              return m.process_log
            }).countBy(f => {
              return f.status === 'inputRequired'
            }).result('true').value()
            // console.log(data.fid, count)
            item.inputRemain = count !== undefined ? count : 0
          }
        }
        // console.log('this.flowzinstanceList', this.flowzinstanceList)
        // if (data.fid !== undefined) {
        //   let checkIndex = _.findIndex(this.flowzList.data, {id: data.fid})
        //   if (checkIndex !== undefined && checkIndex > -1) {
        //     let sobj = _.chain(data.process_log).sortBy(s => {
        //       return moment(s.lastModified)
        //     }).last().value()
        //     let found = false
        //     if (sobj !== undefined && sobj.hasOwnProperty('status') && sobj.status === 'inputRequired') {
        //       found = true
        //     }
        //     console.log('found:: ', found)
        //     if (found) {
        //       this.flowzList.data[checkIndex].inputRemain += 1
        //     }
        //   }
        // }
      },
      removed (data) {
        console.log('flowz-instance removed:: ', data)
        if (!this.flowzinstanceList[data.fid]) {
          return
        }
        let _inx = _.findIndex(this.flowzinstanceList[data.fid], f => { return f.id === data.id })
        if (_inx >= 0) {
          this.flowzinstanceList[data.fid].splice(_inx, 1)
        } else {
          // this.flowzinstanceList[data.fid].push(data)
        }

        for (let item of this.flowzList.data) {
          if (item.id === data.fid) {
            let temp = _.cloneDeep(this.flowzinstanceList[data.fid])
            let count = _.chain(temp).filter(f => {
              return f.process_log
            }).map(m => {
              m.process_log = _.chain(m.process_log).sortBy(s => {
                return moment(s.lastModified)
              }).last().value()
              return m.process_log
            }).countBy(f => {
              return f.status === 'inputRequired'
            }).result('true').value()
            // console.log(data.fid, count)
            item.inputRemain = count !== undefined ? count : 0
          }
        }
      }
    }
  }
}
</script>
<style>
  .flow-menu {

  }
  .flow-image {

  }
  .flow-name {

  }
</style>