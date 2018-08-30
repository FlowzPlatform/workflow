<template>
  <div class="dashboard">
    Dashboard {{$store.state.role}}
    <div v-if="$store.state.role === 1">
      <h3>Analytics</h3><Button type="primary" @click="isModel = !isModel">Configuaraion</Button>
      <Modal
          v-model="isModel"
          title="Set Configurations"
          @on-ok="ok"
          @on-cancel="cancel">
          <p>
            <Table :columns="configCols" :data="configdata"></Table>
          </p>
      </Modal>
      <hr>
      <CellRender></CellRender>
      <Table height="690" border :columns="mainColumns()" :data="tableData"></Table>
    </div>
    <!-- <pre>{{configuration}}</pre>
    <hr>
    <pre>{{anotherBinding}}</pre> -->
  </div>
</template>

<script>
  /* eslint-disable*/
  import flowzModal from '@/api/flowz'
  import finstanceModal from '@/api/finstance'
  import flowzdataModal from '@/api/flowzdata'
  import CellRender from '@/components/cellRender'
  import ConfigExpand from '@/components/configExpand'
  import _ from 'lodash'
  // console.log('CellRender: ', CellRender)
export default {
  name: 'dashboard',
  data () {
    return {
      tableData: [],
      isModel: false,
      anotherBinding: [],
      configCols: [
        {
          type: 'expand',
          key: 'columnConfigurations',
          width: 50,
          render: (h, params) => {
            return h(ConfigExpand, {
              props: {
                  row: params.row
              }
            })
          }
        },
        {
          title: 'Fields',
          key: 'title'
        },
        {
          title: 'Show',
          key: 'show',
          render: (h, params) => {
            return h('div', [
              h('Checkbox', {
                props: {
                  value: params.row.show
                },
                on: {
                  'on-change': (value) => {
                    // console.log('show', value)
                    this.anotherBinding[params.index].show = value
                  }
                }
              })
            ])
          }
        },
        {
          title: 'First Column',
          key: 'firstColumn',
          render: (h, params) => {
            return h('div', [
              h('Radio', {
                props: {
                  value: params.row.firstColumn
                },
                on: {
                  'on-change': (value) => {
                    // console.log('show', value)
                    this.configuration.fields[params.index].firstColumn = value
                    this.anotherBinding[params.index].firstColumn = value
                    for (let i = 0; i < this.anotherBinding.length; i++) {
                      if (i !== params.index) {
                        this.configuration.fields[i].firstColumn = false
                        this.anotherBinding[i].firstColumn = false
                      }
                    }
                    console.log('this.anotherBinding: ', this.anotherBinding)
                  }
                }
              })
            ])
          }
        },
        {
          title: 'Width',
          key: 'width',
          render: (h, params) => {
            return h('div', [
              h('input', {
                props: {
                },
                attrs: {
                  class: 'form-control',
                  type: 'number',
                  value: params.row.width
                },
                on: {
                  'keyup': (event) => {
                    // console.log('value', event.target.value, event.keyCode)
                    if (event.target.value && event.target.value !== null && event.keyCode === 13) {
                      if (event.target.value <= 0) {
                        this.anotherBinding[params.index].width = 150
                      } else {
                        this.anotherBinding[params.index].width = parseInt(event.target.value)
                      }
                    }
                  }
                }
              })
            ])
          }
        }
      ],
      configData: [],
      configuration: {
        dateFormate: '',
        fields: []
      },
      fid: '39c53741-ec14-4ceb-a9db-97d7066cd424'
   }
  },
  components: {
    CellRender
  },
  methods: {
      ok() {
        this.$Message.success('Saved')
        this.configuration.fields = _.cloneDeep(this.anotherBinding)
      },
      cancel() {
        this.anotherBinding = _.cloneDeep(this.configuration.fields)
      },
      mainColumns () {
        // console.log('mainColumns')
        let tableCols = _.filter(this.configuration.fields, {show: true})
        for (let item of tableCols) {
          item.render = function (h, params) {
            // console.log('params.column: ')
            return h(CellRender, {
              props: {
                item: params
              }
            })
          }
        }
        tableCols.splice(0, 0, {
          title: 'instanceId',
          key: 'id',
          firstColumn: true,
          width: 287,
          fixed: 'left'
        })

        // console.log('table cols: ', tableCols)
        return tableCols
      }
  },
  computed: {
    configdata () {
      return this.configuration.fields
    }
  },
  mounted () {
    flowzModal.get(this.fid, {
      $select: ['json']
    }).then(res => {
      console.log('res: ', res)
      let cols = []
      for (let col of res.data.json.processList) {
        if (col.type !== 'start' && col.type !== 'endevent') {
          cols.push({
            title: col.name || col.id,
            key: col.id,
            firstColumn: false,
            show: true,
            width: 150
          })
        }
      }
      this.anotherBinding = _.cloneDeep(cols)
      this.configuration.fields = _.cloneDeep(cols)

      finstanceModal.get(null, {
        fid: this.fid,
        $paginate: false
      }).then(resp => {
        console.log('resp: ', resp)
        // for (let i = 0; i < resp.data.length; i++) {
        //   for(let j = 0; j < resp.data[i].stageReference; j++) {
        //     let value = {
        //       id: resp.data[i].stageReference[j].id
        //     }
        //     this.tableData.push(value)
        //   }
        // }
        this.tableData = resp.data
      })
    })
  }
}
</script>
<style>
  .ivu-modal-body{
    max-height: 550px !important;
    overflow-y: auto !important;
  }
</style>  