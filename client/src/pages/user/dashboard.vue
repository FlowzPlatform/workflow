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
import moment from 'moment'

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
      current: 1
    }
  },
  methods: {
    async init () {
      this.loading = true
      this.flowzList = await (flowz.get(null, {
        $limit: this.$store.state.limitPage,
        $skip: this.$store.state.limitPage * (this.current - 1),
        $select: ['ProcessName', 'svg', 'id']
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
          item.inputRemain = count !== undefined ? count : 0
        })
      }
      // await this.getInputRequired()
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