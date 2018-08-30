<template>
  <div class="Analytics">
    <div class="row">
      <div class="col-md-6">
        <h3 class="card">Analytics: {{ flowName }}</h3>
      </div>
      <div class="col-md-6">
        <div class="legend card">
          <!-- <strong>Legend</strong> -->
          <ul>
            <li><strong>Legend:</strong></li>
            <li><span style="background-color:#00FF00"></span>Completed</li>
            <li><span style="background-color:#FF0000"></span>Current</li>
            <li><span style="background-color:#EEEEEE"></span>Pending</li>
            <!-- <li><span style="background-color:#1F6980"></span>Zone 4 - Thursday</li> -->
            <!-- <li><span style="background-color:#AB156A"></span>Zone 5 - Friday</li> -->
          </ul>

          <!-- <Button class="settingsBtn" icon="ios-settings"></Button> -->
          <Tooltip class="settingsBtn" content="Settings">
            <Button @click="isModel = !isModel"><i class="fa fa-cog"></i></Button>
          </Tooltip>

       </div>
      </div>
    </div>

    <!-- Configurations Modal -->
    <Modal
        v-model="isModel"
        title="Set Configurations"
        @on-ok="ok"
        @on-cancel="cancel">
        <p>
          <Table :columns="configCols" :data="configdata"></Table>
        </p>
    </Modal>

    <!-- Main Table -->
    <Table height="690" border :columns="mainColumns()" :data="tableData"></Table>

  </div>
</template>

<script>
import flowzModal from '@/api/flowz'
import finstanceModal from '@/api/finstance'
import CellRender from '@/components/cellRender'
import ConfigExpand from '@/components/configExpand'
import _ from 'lodash'

export default {
  name: 'dashboard',
  data () {
    return {
      flowName: null,
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
    ok () {
      this.$Message.success('Saved')
      this.configuration.fields = _.cloneDeep(this.anotherBinding)
    },
    cancel () {
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
        width: 270,
        fixed: 'left',
        render: (h, params) => {
          if (params.row.mainStatus === 'inprocess') {
            return h('div', [
              h('span', params.row.id),
              h('span', {
                props: {
                },
                attrs: {
                  class: 'inprocessTask',
                  title: 'In Process'
                }
              })
            ])
          } else if (params.row.mainStatus === 'completed') {
            return h('div', [
              h('span', params.row.id),
              h('span', {
                props: {
                },
                attrs: {
                  class: 'completedTask',
                  title: 'Completed'
                }
              })
            ])
          } else {
            return h('div', [
              h('span', params.row.id),
              h('span', {
                props: {
                },
                attrs: {
                  class: 'otherTask',
                  title: 'Other'
                }
              })
            ])
          }
        }
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
    this.$Spin.show()
    this.fid = this.$route.params.id
    flowzModal.get(this.fid, {
      $select: ['json'],
      $paginate: false
    }).then(res => {
      console.log('res: ', res)
      this.flowName = res.data.json.name
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
        // console.log('resp: ', resp)
        this.tableData = resp.data
        this.$Spin.hide()
      }).catch(err => {
        console.log('Error: ', err)
        this.$Spin.hide()
      })
    }).catch(err => {
      console.log('Error: ', err)
      this.$Spin.hide()
    })
  }
}
</script>
<style scoped>
  .card{
    box-shadow: 2px 2px 10px #dadada;
    background-color: #fff;
    margin: 10px 0;
    padding: 20px;
  }

  .legend {
    /*background: #fff;*/
    /*background: rgba(255, 255, 255, 0.8);*/
    left: 80px;
    top: 20px;
    padding: 22px;
    /*border: 1px solid;*/
  }
  .legend h4 {
    margin: 0 0 10px;
    text-transform: uppercase;
    font-family: sans-serif;
    text-align: center;
  }
  .legend ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .legend li { 
    padding-bottom: 5px; 
    display: inline-block;
    margin-left: 10px;
  }
  .legend span {
    display: inline-block;
    width: 30px;
    /*height: 3px;*/
    margin-right: 6px;
    /*margin-top: -3px;*/
    padding-top: 10px; 
  }
  .settingsBtn {
    position: absolute;
    right: 20px;
    top: 14px;
  }

  
</style>
<style>
  .ivu-modal-body{
    max-height: 550px !important;
    overflow-y: auto !important;
  }

  .inprocessTask{
    position: absolute;
    right: 10px;
    margin-top: 5px;
    min-width: 10px;
    min-height: 10px;
    background-color: #0000FF;
    border-radius: 10px; 
  }

  .completedTask{
    position: absolute;
    right: 10px;
    margin-top: 5px;
    min-width: 10px;
    min-height: 10px;
    background-color: #00FF00;
    border-radius: 10px; 
  }

  .otherTask{
    position: absolute;
    right: 10px;
    margin-top: 5px;
    min-width: 10px;
    min-height: 10px;
    background-color: #FF0000;
    border-radius: 10px; 
  }
</style>  