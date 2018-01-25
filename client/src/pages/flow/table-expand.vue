<template>
    <div>
        <Row class="expand-row">
            <Col span="24">
                <span class="expand-key">
                  <Table :loading="loading" size="small" :columns="processCol" :data="processData" @on-sort-change="sortMethod1"></Table>
                </span>
            </Col>
        </Row>
        <Row style="margin-top: 4px; float: right">
          <Page :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
      </Row>
    </div>
</template>
<script>
import instanceModel from '@/api/flowzinstance'
import flowzInstanceById from '@/api/flowz'
import moment from 'moment'
// let _ = require('lodash')
export default {
  data () {
    return {
      loading: true,
      limit: 10,
      cpage: 1,
      skip: 0,
      total: 0,
      createdOrder: -1,
      processCol: [
        {
          title: 'Id',
          key: 'id'
        },
        {
          title: 'Created On',
          key: 'createdOn',
          sortable: true,
          width: 200,
          sortType: 'desc',
          render: (h, params) => {
            return h('div', moment(this.processData[params.index].createdOn).format('lll'))
          }
        },
        {
          title: 'Action',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'edit'
                },
                style: {
                  color: '#CC0000',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    this.$router.push('/admin/flow/instance/' + params.row.id)
                    // this.getprocessInstance(params.row.id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'navicon-round'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#00C851'
                },
                on: {
                  click: () => {
                    this.$router.push('/admin/flow/instance/log/' + params.row.id)
                  }
                }
              }, '')
              // ,
              // h('Button', {
              //   props: {
              //     type: 'text',
              //     size: 'large',
              //     icon: 'android-delete'
              //   },
              //   style: {
              //     marginRight: '3px',
              //     padding: '0px',
              //     fontSize: '20px',
              //     color: '#e74c3c'
              //   }
              //   // on: {
              //   //   click: () => {
              //   //     this.deleteFlow(this.flowzList[params.index].id)
              //   //   }
              //   // }
              // }, '')
            ])
          }
        }
      ],
      processData: []
    }
  },
  props: {
    row: Object
  },
  methods: {
    handlePage (page) {
      this.cpage = page
      this.skip = (page * this.limit) - this.limit
      this.loading = true
      this.init(this.row.id)
    },
    handlePagesize (size) {
      this.limit = size
      this.skip = 0
      this.loading = true
      this.init(this.row.id)
    },
    sortMethod1 (item) {
      if (item.key === 'createdOn') {
        if (item.order === 'desc' || item.order === 'normal') {
          this.createdOrder = -1
        } else {
          this.createdOrder = 1
        }
      }
      // console.log(item, this.createdOrder)
      this.loading = true
      this.init(this.row.id)
    },
    init (id) {
      var string = '&$sort[createdOn]=' + this.createdOrder + '&$skip=' + this.skip + '&$limit=' + this.limit
      instanceModel.getByfid(id + string).then(response => {
        this.total = response.data.total
        console.log('res >> ', response.data.data)
        this.processData = response.data.data
        this.loading = false
        // console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRR', this.processData)
      }).catch(err => {
        this.loading = false
        this.$Notice({duration: '3', title: 'Network Error', desc: ''})
        console.log(err)
      })
    },
    getprocessInstance (id) {
      console.log('get process instance call')
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', id)
      flowzInstanceById.get(id).then(res => {
        console.log(res.data)
      })
    }
  },
  mounted () {
    // console.log('table expand', this.row.id)
    // instanceModel.getByfid(this.row.id).then(response => {
    //   this.processData = response.data.data
    //   this.loading = false
    //   //console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRR', this.processData)
    // }).catch(err => {
    //   this.loading = false
    //   console.log(err)
    // })
    this.init(this.row.id)
  }
}
</script>
<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
</style>