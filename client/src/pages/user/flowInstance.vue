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
import moment from 'moment'
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
          width: 200,
          align: 'center',
          render: (h, params) => {
            // let lastLog = _.find(params.row.process_log, (f) => {
            //   return f.status === 'inputRequired'
            // })
            // console.log('params', params.row)
            let getlastlog = _.chain(params.row.process_log).orderBy(['lastModified'], ['desc']).head().value()
            // console.log('getlastlog', getlastlog)
            if (getlastlog !== undefined) {
              let aStatus = ''
              let _configuration = _.chain(params.row.processList).find(f => {
                return f.id === getlastlog.job
              }).result('configurations').find(f => {
                return f.key === 'allowedusers'
              }).value()
              if (getlastlog.status !== 'inputRequired') {
                let cStatus = _.find(params.row.processList, {id: getlastlog.job})
                if (cStatus !== undefined && cStatus.target.length !== 0) {
                  aStatus = 'running'
                } else {
                  aStatus = getlastlog.status
                }
              } else if (_configuration && _.indexOf(_configuration, this.$store.state.user.email)) {
                aStatus = getlastlog.status
              } else {
                aStatus = 'running'
              }
              return h('Tag', {
                props: {
                  type: 'dot',
                  color: this.getColor(aStatus)
                },
                style: {
                },
                nativeOn: {
                  'click': (value) => {
                    this.$router.push('form/reply/' + params.row.id)
                    // console.log('value', value)
                  }
                }
              }, aStatus.toUpperCase())
            } else {
              return h('div', 'Not started yet.')
            }
          }
        },
        {
          title: 'createdOn',
          key: 'createdOn',
          width: 200,
          // sortable: true,
          // sortType: 'desc',
          align: 'center',
          render: (h, params) => {
            return h('div', moment(this.flowzList.data[params.index].createdOn).fromNow())
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
        '$sort[createdOn]': -1,
        $useremail: this.$store.state.user.email,
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
    },
    getColor (status) {
      if (status === 'inputRequired') {
        return '#E71A24'
      } else if (status === 'created') {
        return 'rgba(255, 251, 0, 0.56)'
      } else if (status === 'running') {
        return '#d5d835'
      } else if (status === 'completed') {
        return '#1AE75E'
      } else if (status === 'processing') {
        return '#1DA8D3'
      } else {
        return ''
      }
    }
  },
  feathers: {
    'flowz-instance': {
      created (data) {
        if (_.indexOf(data.allowedusers, this.$store.state.user.email) !== -1) {
          this.flowzList.data.splice(0, 0, data)
          this.flowzList.data.splice(this.flowzList.data.length - 1, 1)
          this.flowzList.total = this.flowzList.total + 1
        }
        // this.init()
      },
      updated (data) {
        if (_.indexOf(data.allowedusers, this.$store.state.user.email) !== -1) {
          let index = _.findIndex(this.flowzList.data, i => { return i.id === data.id })
          this.flowzList.data.splice(index, 1)
          this.flowzList.data.splice(index, 0, data)
        }
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>