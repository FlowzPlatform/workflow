<template>
  <div>
    <Table border :loading="loading" :columns="columns" :data="flowzList.data"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page :page-size="$store.state.limitPage" :total="flowzList.total" :current="current" @on-change="changePage"></Page>
      </div>
    </div>
  </div>
</template>
<script>
import flowzinstanceModel from '@/api/flowzinstance'
import _ from 'lodash'
export default {
  name: 'flowzinstance',
  props: {
    'fid': String
  },
  data () {
    return {
      flowzList: {},
      loading: true,
      columns: [
        // {
        //   title: '#',
        //   key: 'ProcessName',
        //   width: 200,
        //   render: (h, params) => {
        //     if (params.row.svg) {
        //       return h('Poptip', {
        //         props: {
        //           trigger: 'hover',
        //           placement: 'right'
        //         }
        //       }, [
        //         h(viewSVG, {
        //           props: {
        //             svgStr: params.row.svg
        //           }
        //         }),
        //         h('div', {
        //           slot: 'title'
        //         }, [
        //           h('b', params.row.ProcessName)
        //         ]),
        //         h('div', {
        //           slot: 'content'
        //         }, [
        //           h(viewSVG, {
        //             props: {
        //               svgStr: params.row.svg
        //             }
        //           })
        //         ])
        //       ])
        //     } else {
        //       return h('div', 'No SVG')
        //     }
        //   }
        // },
        {
          title: 'id',
          key: 'id'
        },
        {
          title: 'Status',
          key: 'id',
          render: (h, params) => {
            let lastLog = _.find(params.row.process_log, (f) => {
              return f.status === 'inputRequired'
            })
            if (lastLog != null) {
              return h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.$router.push('form/reply/' + lastLog.job + '/' + params.row.id)
                  }
                }
              }, 'Input Required')
            } else {
              return h('div', '')
            }
          }
        }
      ],
      current: 1
    }
  },
  methods: {
    init () {
      this.loading = true
      flowzinstanceModel.getByfid(this.fid, {
        $limit: this.$store.state.limitPage,
        $skip: this.$store.state.limitPage * (this.current - 1)
      }).then(res => {
        this.flowzList = res.data
        this.loading = false
      }).catch(error => {
        console.log(error)
      })
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