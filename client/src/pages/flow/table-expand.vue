<template>
    <div>
        <Row class="expand-row">
            <Col span="24">
                <span class="expand-key">
                  <Table size="small" :columns="processCol" :data="processData"></Table>
                </span>
            </Col>
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
                    this.$router.push('/flow/instance/' + params.row.id)
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
                    this.$router.push('/flow/instance/log/' + params.row.id)
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'android-delete'
                },
                style: {
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px',
                  color: '#e74c3c'
                }
                // on: {
                //   click: () => {
                //     this.deleteFlow(this.flowzList[params.index].id)
                //   }
                // }
              }, '')
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
    getprocessInstance (id) {
      console.log('get process instance call')
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', id)
      flowzInstanceById.get(id).then(res => {
        console.log(res.data)
      })
    }
  },
  mounted () {
    console.log('table expand', this.row.id)
    instanceModel.getByfid(this.row.id).then(response => {
      this.processData = response.data.data
      console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRR', this.processData)
    })
  }
}
</script>
<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
</style>