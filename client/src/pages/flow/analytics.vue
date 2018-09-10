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
            <li><span style="background-color:#BCEDC7"></span>Completed</li>
            <li><span style="background-color:#FFC5CF"></span>Current</li>
            <!-- <li><span style="background-color:#EEEEEE"></span>Pending</li> -->
            <!-- <li><span style="background-color:#1F6980"></span>Zone 4 - Thursday</li> -->
            <!-- <li><span style="background-color:#AB156A"></span>Zone 5 - Friday</li> -->
          </ul>

          <!-- <Button class="settingsBtn" icon="ios-settings"></Button> -->
          <div class="settingsBtn">
            <Tooltip content="Settings">
              <Button shape="circle" type="info" @click="isModel = !isModel"><i class="fa fa-cog"></i></Button>
            </Tooltip>
              <div style="float:right; margin-left:5px;">
                <ButtonGroup shape="circle">
                  <Button title="Overview" icon="ios-keypad" type="primary" @click="viewChange(1)"></Button>
                  <Button title="Data View" icon="navicon-round" type="primary" @click="viewChange(2)"></Button>
                </ButtonGroup>
              </div>
          </div>

       </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="row">
            <div class="col-md-4">
              <Input search enter-button placeholder="Search..." v-model="searchQuery"/>
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-md-6">
                  <Select style="width: 100%" v-model="selectedFilterBy" clearable placeholder="Filter By">
                    <Option v-for="item in filterBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
                  <br>
                  <DatePicker v-if="selectedFilterBy === 'customRange'" type="daterange" split-panels placeholder="Select date" style="width: 100%; margin: 5px 0;" v-model="enteredDateRange"></DatePicker>
                </div>
                <div class="col-md-6">
                  <Select style="width: 100%" v-model="selectedSortBy" clearable placeholder="Sort By">
                    <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>    
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <Button icon="search" type="primary" @click="searchInstances" long>Search</Button>
            </div>
          </div>

          <!-- <div class="searchQueries">
            <Tag @on-close="searchQuery = null" closable color="blue" v-if="searchQuery != null && searchQuery != ''">{{searchQuery}}</Tag>
            <Tag @on-close="selectedFilterBy = null, enteredDateRange= []" closable color="blue" v-if="selectedFilterBy != null && selectedFilterBy != '' && selectedFilterBy == 'customRange'">{{selectedFilterBy}} : {{enteredDateRange}}</Tag>
            <Tag @on-close="selectedFilterBy = null" closable color="blue" v-if="selectedFilterBy != null && selectedFilterBy != '' && selectedFilterBy != 'customRange'">{{selectedFilterBy}}</Tag>
            <Tag closable color="blue" v-if="selectedSortBy != null && selectedSortBy != ''">{{selectedSortBy}}</Tag>
          </div> -->
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
    <div v-show="rowview">
      <!-- <Table height="690" border :columns="mainColumns()" :data="tableData"></Table> -->
      <Table v-if="schemaId !== null" height="590" border :columns="mainColumns()" :data="tableData"></Table>
    </div>
    <div v-show="columnview">
      <Table :row-class-name="rowClassName" :columns="colviewCols" height="590" :data="colviewData"></Table>
    </div>
    <!-- <Table v-if="schemaId !== null" height="690" border :columns="mainColumns()" :data="tableData"></Table> -->

  </div>
</template>

<script>
import flowzModal from '@/api/flowz'
// import finstanceModal from '@/api/finstance'
import dataQueryModel from '@/api/dataquery'
import schemaModal from '@/api/schema'
import CellRender from '@/components/cellRender'
import ConfigExpand from '@/components/configExpand'
import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'dashboard',
  data () {
    return {
      rowview: true,
      columnview: false,
      flowName: null,
      tableData: [],
      isModel: false,
      anotherBinding: [],
      colviewCols: [
        {
          title: 'ID',
          key: 'id',
          fixed: 'left',
          width: 280
        },
        {
          title: 'Task',
          key: 'task',
          width: 150
        }
      ],
      colviewData: [],
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
      fid: null,
      schemaId: '',
      searchQuery: null,
      filterBy: [
        {
          'label': 'Last 12 Hours',
          'value': '12hours'
        }, {
          'label': 'Last 24 Hours',
          'value': '24hours'
        }, {
          'label': 'Last 7 Days',
          'value': '7days'
        }, {
          'label': 'Last 30 Days',
          'value': '30days'
        }, {
          'label': 'Last 3 months',
          'value': '3months'
        }, {
          'label': 'This Year',
          'value': 'thisYear'
        }, {
          'label': 'Custom Range',
          'value': 'customRange'
        }
      ],
      selectedFilterBy: null,
      sortBy: [
        {
          'label': 'Ascending',
          'value': 'asc'
        }, {
          'label': 'Descending',
          'value': 'desc'
        }
      ],
      selectedSortBy: null,
      enteredDateRange: null
    }
  },
  components: {
    CellRender
  },
  filters: {
    momentDate (date) {
      return moment(date).format('MMM Do YY')
    }
  },
  methods: {
    rowClassName (row, index) {
      return row.className
    },
    viewChange (item) {
      if (item === 1) {
        this.rowview = true
        this.columnview = false
      } else {
        this.rowview = false
        this.columnview = true
      }
    },
    searchInstances () {
      // this.tableData = _.filter(this.tableData, (o) => { return o.id === this.searchQuery })
    },
    ok () {
      this.$Message.success('Saved')
      this.configuration.fields = _.cloneDeep(this.anotherBinding)
    },
    cancel () {
      this.anotherBinding = _.cloneDeep(this.configuration.fields)
    },
    getByOrder (array) {
      let allProcess = []
      for (let key in array) {
        allProcess.push(array[key])
      }
      return allProcess.sort((a, b) => {
        return a.order - b.order
      })
    },
    mainColumns () {
      // console.log('mainColumns')
      let tableCols = _.filter(this.configuration.fields, {show: true})
      for (let item of tableCols) {
        item.render = (h, params) => {
          // console.log('params.column: ')
          // console.log('Item: ', item)
          // console.log('Params: ', params)
          let obj = _.find(params.row.stageReference, {StageName: item.key})
          // console.log('obj: ', obj)
          let finalValue = {
            obj: obj,
            isCurrentTask: false,
            isCompletedTask: true
          }
          if (obj) {
            finalValue.isCurrentTask = false
            finalValue.isCompletedTask = true
          } else {
            if (item.key === params.row.currentStatus) {
              finalValue.obj = null
              finalValue.isCurrentTask = true
              finalValue.isCompletedTask = false
            } else {
              finalValue.obj = null
              finalValue.isCurrentTask = false
              finalValue.isCompletedTask = false
            }
          }
          // console.log('finalValue: ', finalValue)
          return h(CellRender, {
            props: {
              item: finalValue,
              schemaId: this.schemaId
            }
          })
        }
      }
      tableCols.splice(0, 0, {
        title: 'Instance Id',
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
                  class: 'inprocessTaskDot',
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
                  class: 'completedTaskDot',
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
                  class: 'otherTaskDot',
                  title: 'Other'
                }
              })
            ])
          }
        }
      })

        // console.log('table cols: ', tableCols)
      return tableCols
    },
    async init () {
      // this.$Spin.show()
      // this.colviewCols = []
      this.colviewCols = [
        {
          title: 'ID',
          key: 'id',
          fixed: 'left',
          width: 280,
          render: (h, params) => {
            if (params.row.hasOwnProperty('first')) {
              if (params.row.first) {
                return h('div', [
                  h('span', params.row.id),
                  h('span', {
                    attrs: {
                      class: 'btn btn-default btn-sm showHideBtn'
                    },
                    on: {
                      click: () => {
                        for (let [inx, item] of this.colviewData.entries()) {
                          if (item.id === params.row.id && params.index !== inx) {
                            if (!params.row.first) {
                              item.className = ''
                            } else {
                              item.className = 'notfirst'
                            }
                          }
                          if (params.index === inx) {
                            item.first = !item.first
                          }
                        }
                      }
                    }
                  }, [
                    h('i', {
                      attrs: {
                        class: 'fa fa-angle-up'
                      }
                    })
                  ])
                ])
              } else {
                return h('div', [
                  h('span', params.row.id),
                  h('span', {
                    attrs: {
                      class: 'btn btn-sm showHideBtn'
                    },
                    on: {
                      click: () => {
                        for (let [inx, item] of this.colviewData.entries()) {
                          if (item.id === params.row.id && params.index !== inx) {
                            if (!params.row.first) {
                              item.className = ''
                            } else {
                              item.className = 'notfirst'
                            }
                          }
                          if (params.index === inx) {
                            item.first = !item.first
                          }
                        }
                      }
                    }
                  }, [
                    h('i', {
                      attrs: {
                        class: 'fa fa-angle-down'
                      }
                    })
                  ])
                ])
              }
            }
          }
        },
        {
          title: 'Task',
          key: 'task',
          width: 150
        }
      ]
      this.colviewData = []
      this.fid = this.$route.params.id
      let colviewData = []

      await flowzModal.get(this.fid, {
        $paginate: false
      }).then(res => {
        this.schemaId = res.data.schema
        this.flowName = res.data.name
        let cols = []
        // console.log('res.data.processList: ', res.data.processList)
        let listing = this.getByOrder(res.data.processList)
        for (let col of listing) {
          if (col.type !== 'startevent' && col.type !== 'endevent') {
            cols.push({
              title: col.name || col.id,
              key: col.id,
              firstColumn: false,
              show: true,
              width: 150
            })
          }
        }
        // console.log('cols: ', cols)
        this.anotherBinding = _.cloneDeep(cols)
        this.configuration.fields = _.cloneDeep(cols)

        dataQueryModel.get(null, {
          $all: true,
          fid: this.fid,
          $paginate: false
        }).then(queryresp => {
          // this.$Spin.hide()
          console.log('Res: ', queryresp)
          this.tableData = queryresp.data
          colviewData = queryresp.data
          let listing = this.getByOrder(res.data.processList)
          for (let item of colviewData) {
            let isfirst = false
            for (let task of listing) {
              if (task.type !== 'startevent' && task.type !== 'endevent') {
                // flowzdataModal.get().then(res => {

                // }).catch(e => {
                //   console.log('e', e)
                // })
                // console.log('colviewData.stageReference ', item, task)
                let dataExist = _.find(item.stageReference, {StageName: task.id})
                if (!isfirst) {
                  task.first = false
                  task.className = ''
                  isfirst = true
                } else {
                  task.className = 'notfirst'
                }
                // console.log('dataExist: ', dataExist)
                let m = {
                  id: item.id,
                  task: task.name || task.id,
                  className: task.className
                }
                if (task.hasOwnProperty('first')) {
                  m.first = task.first
                }
                if (dataExist !== null && dataExist !== undefined && dataExist.hasOwnProperty('data')) {
                  for (let k in dataExist.data) {
                    m[k] = dataExist.data[k]
                  }
                  this.colviewData.push(m)
                } else {
                  this.colviewData.push(m)
                }
              }
            }
          }
        }).catch(err => {
          console.log('Erro: ', err)
        })

        // finstanceModal.get(null, {
        //   fid: this.fid,
        //   $paginate: false
        // }).then(resp => {
        //   // console.log('resp: ', resp)
        //   this.tableData = resp.data
        //   colviewData = resp.data
        //   for (let item of colviewData) {
        //     for (let task in res.data.processList) {
        //       if (res.data.processList[task].type !== 'startevent' && res.data.processList[task].type !== 'endevent') {
        //       // flowzdataModal.get().then(res => {

        //       // }).catch(e => {
        //       //   console.log('e', e)
        //       // })
        //         this.colviewData.push({
        //           id: item.id,
        //           task: res.data.processList[task].name || res.data.processList[task].id
        //         })
        //       }
        //     }
        //   }
        //   this.$Spin.hide()
        // }).catch(err => {
        //   console.log('Error: ', err)
        //   this.$Spin.hide()
        // })

        schemaModal.get(res.data.schema).then(result => {
          // let anyCustom = false
          for (let item of result.data.entity) {
            if (!item.customtype) {
              this.colviewCols.push({
                title: item.name,
                key: item.name,
                width: 150
              })
            } else {
              // anyCustom = true
            }
          }
        }).catch(e => {
          console.log('e', e)
        })
      }).catch(err => {
        console.log('Error: ', err)
        this.$Spin.hide()
      })
    }
  },
  computed: {
    configdata () {
      return this.configuration.fields
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route.params.id': function (newValue, oldValue) {
      this.init()
    }
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

  .notfirst {
    display: none
  }


</style>
<style>
  .ivu-modal-body{
    max-height: 550px !important;
    overflow-y: auto !important;
  }

  .inprocessTaskDot{
    position: absolute;
    right: 10px;
    margin-top: 5px;
    min-width: 10px;
    min-height: 10px;
    background-color: #0000FF;
    border-radius: 10px; 
  }

  .completedTaskDot{
    position: absolute;
    right: 10px;
    margin-top: 0px;
    min-width: 10px;
    min-height: 10px;
    background-color: #00FF00;
    border-radius: 10px; 
  }

  .otherTaskDot{
    position: absolute;
    right: 10px;
    margin-top: 5px;
    min-width: 10px;
    min-height: 10px;
    background-color: #FF0000;
    border-radius: 10px; 
  }

  .ivu-table td{
    height: 40px;
  }

  .ivu-table td:first-child{
    padding-left: 10px;
  }

  .ivu-table-cell{
    padding-left: 0;
    padding-right: 0;
  }

  .searchQueries{
    margin: 5px 0;
  }

  th .ivu-table-cell > span, td .ivu-table-cell > span, td .ivu-table-cell > .ivu-poptip {
    padding-left: 10px;
  }

  .ivu-btn-circle, .ivu-btn-circle-outline{
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .notfirst {
    display: none;
  }

  .showHideBtn{
    float: right;
  }
</style>  