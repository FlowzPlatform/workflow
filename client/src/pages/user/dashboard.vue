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
import flowz from '@/api/flowz'
import viewSVG from './viewSVG'
import flowzinstanceModel from '@/api/flowzinstance'
import flowInstance from './flowInstance'
import _ from 'lodash'

export default {
  name: 'dashboard',
  components: {
    'viewSVG': viewSVG
  },
  data () {
    return {
      flowzList: {},
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
          render: (h, params) => {
            let value = params.row.inputRemain.toString()
            return h('Badge', {
              props: {
                count: value
              }
            })
          }
        }
      ],
      current: 1
    }
  },
  methods: {
    async init () {
      this.loading = true
      let mdata = await (flowz.get(null, {
        $limit: this.$store.state.limitPage,
        $skip: this.$store.state.limitPage * (this.current - 1)
      })
      .then(response => {
        // this.flowzList = response.data
        // this.loading = false
        return response.data
        // response.data.data.forEach((item) => {
        //   flowzinstanceModel.getByfid(item.id).then(res => {
        //     console.log('item', res)
        //   })
        // })
      })
      .catch(error => {
        console.log(error)
        return {data: [], total: 0}
      }))
      for (let item of mdata.data) {
        // console.log(i)
        // console.log(item)
        let count = 0
        let stotal = await (flowzinstanceModel.getByfid(item.id, {$limit: 0}).then(resp => {
          return resp.data.total
        }).catch(e => {
          console.log(e)
          return 0
        }))
        // console.log('stotal', stotal)
        if (stotal !== 0) {
          let sdata = await (flowzinstanceModel.getByfid(item.id, {$limit: stotal}).then(res => {
            return res.data.data
          }).catch(errr => {
            console.log(errr)
            return []
          }))
          for (let obj of sdata) {
            let getlastlog = _.chain(obj.process_log).orderBy(['lastModified'], ['desc']).head().value()
            if (getlastlog !== undefined && getlastlog.status === 'inputRequired') {
              count++
            }
          }
        }
        item.inputRemain = count
        // console.log(sdata)
      }
      this.flowzList = mdata
      this.loading = false
    },
    changePage (newValue) {
      this.current = newValue
      this.init()
      // console.log('newValue', newValue)
    }
  },
  mounted () {
    this.init()
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