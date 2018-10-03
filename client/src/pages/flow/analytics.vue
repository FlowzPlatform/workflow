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
      <Table :loading="tableLoading" v-if="schemaId !== null" border :columns="mainColumns()" :data="tableData"></Table>
      <Row style="margin-top: 4px; float: right">
        <Page placement="top" :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
      </Row>
    </div>
    <div v-show="columnview">
      <Table :loading="tableLoading" :row-class-name="rowClassName" :columns="colviewCols" :data="colviewData"></Table>
      <Row style="margin-top: 4px; float: right">
        <Page placement="top" :total="total" :current="cpage" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
      </Row>
    </div>
    <!-- <Table v-if="schemaId !== null" height="690" border :columns="mainColumns()" :data="tableData"></Table> -->

  </div>
</template>

<script>
import flowzModal from '@/api/flowz'
// import finstanceModal from '@/api/finstance'
// import dataQueryModel from '@/api/dataquery'
import schemaModal from '@/api/schema'
import CellRender from '@/components/cellRender'
import ConfigExpand from '@/components/configExpand'
import _ from 'lodash'
import moment from 'moment'
import $ from 'jquery'
import dflowzdata from '@/api/dflowzdata'
// import config from '@/config'
// import axios from 'axios'

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
      colviewCols: [],
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
      enteredDateRange: null,
      currentSchema: null,
      tableLoading: false,
      limit: 10,
      cpage: 1,
      skip: 0,
      total: 0
    }
  },
  components: {
  },
  filters: {
    momentDate (date) {
      return moment(date).format('MMM Do YY')
    }
  },
  methods: {
    handlePage (page) {
      this.cpage = page
      this.skip = (page * this.limit) - this.limit
      this.init()
    },
    handlePagesize (size) {
      this.limit = size
      this.skip = 0
      this.init()
    },
    rowClassName (row, index) {
      return ((row.hasOwnProperty('_first')) ? '' : row._uuid + ' notfirst')
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
      let query = this.searchQuery
      let sort = this.selectedSortBy
      console.log('query', query, sort)
      this.dataLoading = true
      this.tableLoading = true

      // New Custom Dynamic FLowz Data call
      let heads = {
        ftablename: this.flowzData.id.replace(/-/g, '_')
      }
      if (query === null) {
        query = {
          text: '',
          filter: ''
        }
      }
      let params = {
        $skip: this.skip,
        $limit: this.limit,
        '_currentStatus': true,
        '_state': this.$route.params.stateid,
        // 'id[$search]': '^' + query.text
        '$search': query,
        $group: '_uuid'
      }
      if (sort !== undefined || sort !== null) {
        if (sort === 'asc') {
          params['$sort[' + sort + ']'] = 1
        } else if (sort === 'desc') {
          params['$sort[' + sort + ']'] = -1
        }
      }
      dflowzdata.get(null, params, heads)
      .then(res => {
        console.log('res: ', res)
        if (res.data.data.length > 0) {
          this.total = res.data.total
          let tableDataArr = []
          for (let item of res.data.data) {
            let value = {
              _uuid: item.group,
              states: item.reduction
            }
            tableDataArr.push(value)
          }
          // let groupedData = _.groupBy(res.data.data, (o) => { return o._uuid })
          // console.log('Grouped Data: ', groupedData)
          // // let tableGroupedArray = []
          // for (let item in groupedData) {
          //   console.log('Item: ', item)
          //   let value = groupedData[item]
          //   console.log('Value: ', value)
          // }
          // console.log('tableGroupedArray: ', tableGroupedArray)
          this.tableData = tableDataArr
          // this.colviewData = tableDataArr
          // this.colviewData = tableDataArr
          for (let inst in tableDataArr) {
            for (let items in tableDataArr[inst]) {
              if (items === 'states') {
                for (let [inx, item] of tableDataArr[inst][items].entries()) {
                  if (inx === 0) {
                    item._first = true
                  }
                  this.colviewData.push(item)
                }
              }
            }
          }
          this.tableLoading = false
        } else {
          this.tableData = []
          this.colviewData = []
          this.tableLoading = false
        }
      }).catch(e => {
        this.$Loading.error()
        this.dataLoading = false
        this.tableLoading = false
        console.log('error', e)
        this.bLoading = false
        if (e.response.data.message) {
          this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
        } else {
          this.$Notice.error({title: 'Error', desc: e.message})
        }
      })
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
        allProcess[array[key].order] = array[key]
      }
      return allProcess
    },
    mainColumns () {
      // console.log('mainColumns')
      let tableCols = _.filter(this.configuration.fields, {show: true})
      for (let item of tableCols) {
        item.render = (h, params) => {
          // console.log('params.column: ')
          // console.log('Item: ', item)
          // console.log('Params: ', params)
          // console.log('item.key: ', item.key)
          let obj = _.find(params.row.states, {_state: item.key})
          // console.log('obj: ', obj)
          if (obj) {
            let finalValue = {
              obj: obj,
              isCurrentTask: false,
              isCompletedTask: true
            }

            if (obj._currentStatus === true) {
              // console.log('Oject Date: ', obj._currentStatus)
              finalValue.isCurrentTask = true
              finalValue.isCompletedTask = false
            } else if (obj._currentStatus === false) {
              // alert('Completed Task')
              finalValue.isCurrentTask = false
              finalValue.isCompletedTask = true
              // axios.get(config.userdetails + obj.userId)
              // .then((response) => {
              //   finalValue.obj['userDetails'] = response.data.data[0]
              //   // console.log('user details: ', obj['userDetails'])
              // })
              // .catch((error) => {
              //   console.log(error)
              // })
            }
            // if (obj) {
            //   obj['createdAt'] = params.row.createdAt
            //   finalValue.isCurrentTask = false
            //   finalValue.isCompletedTask = true
            // } else {
            //   if (item.key === params.row.currentStatus) {
            //     // console.log('params.row.stageReference.length: ', params.row.stageReference[(params.row.stageReference.length - 1)])
            //     // obj = params.row.stageReference[(params.row.stageReference.length - 1)]
            //     finalValue.obj = params.row.stageReference[(params.row.stageReference.length - 1)]
            //     finalValue.isCurrentTask = true
            //     finalValue.isCompletedTask = false
            //   } else {
            //     finalValue.obj = null
            //     finalValue.isCurrentTask = false
            //     finalValue.isCompletedTask = false
            //   }
            // }
            // console.log('finalValue: ', finalValue)
            return h(CellRender, {
              props: {
                item: finalValue,
                schemaId: this.schemaId
              }
            })
          }
        }
      }
      tableCols.splice(0, 0, {
        title: 'Instance Id',
        key: '_uuid',
        firstColumn: true,
        width: 270,
        fixed: 'left',
        render: (h, params) => {
          // console.log('Params: ', params.row)
          let findInProcessIndex = _.findIndex(params.row.states, function (o) { return o._currentStatus === true })
          if (findInProcessIndex !== -1) {
            return h('div', [
              h('span', {
                attrs: {
                  title: 'Click to Copy',
                  class: 'clickToCopy'
                },
                on: {
                  click: () => {
                    var $temp = $('<input>')
                    $('body').append($temp)
                    $temp.val(params.row.id).select()
                    document.execCommand('copy')
                    this.$Message.info('Copied to Clipboard')
                    $temp.remove()
                  }
                }
              }, params.row._uuid),
              h('span', {
                props: {
                },
                attrs: {
                  class: 'inprocessTaskDot',
                  title: 'In Process'
                }
              })
            ])
          } else {
            return h('div', [
              h('span', {
                attrs: {
                  title: 'Click to Copy',
                  class: 'clickToCopy'
                },
                on: {
                  click: () => {
                    var $temp = $('<input>')
                    $('body').append($temp)
                    $temp.val(params.row.id).select()
                    document.execCommand('copy')
                    this.$Message.info('Copied to Clipboard')
                    $temp.remove()
                  }
                }
              }, params.row._uuid),
              h('span', {
                props: {
                },
                attrs: {
                  class: 'completedTaskDot',
                  title: 'Completed'
                }
              })
            ])
          }
          // if (params.row.mainStatus === 'inprocess') {

          // } else if (params.row.mainStatus === 'completed') {

          // } else {
          //   return h('div', [
          //     h('span', {
          //       attrs: {
          //         title: 'Click to Copy',
          //         class: 'clickToCopy'
          //       },
          //       on: {
          //         click: () => {
          //           var $temp = $('<input>')
          //           $('body').append($temp)
          //           $temp.val(params.row.id).select()
          //           document.execCommand('copy')
          //           this.$Message.info('Copied to Clipboard')
          //           $temp.remove()
          //         }
          //       }
          //     }, params.row._uuid),
          //     h('span', {
          //       props: {
          //       },
          //       attrs: {
          //         class: 'otherTaskDot',
          //         title: 'Other'
          //       }
          //     })
          //   ])
          // }
        }
      })

        // console.log('table cols: ', tableCols)
      return tableCols
    },

    getFlowz () {
      return flowzModal.get(this.fid, {
        $paginate: false
      })
      .then((res) => {
        return (res.data)
      }).catch(err => {
        this.tableLoading = false
        console.log('Error: ', err)
        return
      })
    },

    getSchema (id) {
      return schemaModal.getAll(id).then(res => {
        return res
      }).catch(err => {
        this.tableLoading = false
        console.log('Error: ', err)
        return
      })
    },

    populateTables () {
      this.schemaId = this.currentSchema.id
      this.flowName = this.flowzData.name

      let cols = []
      // let colviewData = []
      // console.log('res.data.processList: ', res.data.processList)
      let listing = this.getByOrder(this.flowzData.processList)
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

      // New Custom Dynamic FLowz Data call
      let heads = {
        ftablename: this.$route.params.id.replace(/-/g, '_')
      }
      dflowzdata.get(null, {
        $skip: this.skip,
        $limit: this.limit,
        $group: '_uuid',
        '$sort[_createdAt]': 1
      }, heads)
      .then(res => {
        // console.log('res: ', res)
        this.total = res.data.total
        let tableDataArr = []
        for (let item of res.data.data) {
          let value = {
            _uuid: item.group,
            states: item.reduction
          }
          tableDataArr.push(value)
        }
        // let groupedData = _.groupBy(res.data.data, (o) => { return o._uuid })
        // console.log('Grouped Data: ', groupedData)
        // // let tableGroupedArray = []
        // for (let item in groupedData) {
        //   console.log('Item: ', item)
        //   let value = groupedData[item]
        //   console.log('Value: ', value)
        // }
        // console.log('tableGroupedArray: ', tableGroupedArray)
        this.tableData = tableDataArr
        // this.colviewData = tableDataArr
        for (let inst in tableDataArr) {
          for (let items in tableDataArr[inst]) {
            if (items === 'states') {
              for (let [inx, item] of tableDataArr[inst][items].entries()) {
                if (inx === 0) {
                  item._first = true
                }
                this.colviewData.push(item)
              }
            }
          }
        }
        // console.log('this.colviewData', this.colviewData)
        this.tableLoading = false
      }).catch(e => {
        this.tableLoading = false
        this.$Loading.error()
        console.log('error', e)
        this.bLoading = false
        if (e.response.data.message) {
          this.$Notice.error({title: 'Error', desc: e.response.data.message.toString()})
        } else {
          this.$Notice.error({title: 'Error', desc: e.message})
        }
      })

      // dataQueryModel.get(null, {
      //   $all: true,
      //   fid: this.fid,
      //   $skip: this.skip,
      //   $limit: this.limit
      // }).then(queryresp => {
      //   // this.$Spin.hide()
      //   this.tableData = queryresp.data.data
      //   colviewData = queryresp.data.data
      //   this.total = queryresp.data.total
      //   let listing = this.getByOrder(this.flowzData.processList)
      //   for (let item of colviewData) {
      //     let isfirst = false
      //     for (let task of listing) {
      //       if (task.type !== 'startevent' && task.type !== 'endevent') {
      //         // flowzdataModal.get().then(res => {

      //         // }).catch(e => {
      //         //   console.log('e', e)
      //         // })
      //         // console.log('colviewData.stageReference ', item, task)
      //         let dataExist = _.find(item.stageReference, {StageName: task.id})
      //         if (!isfirst) {
      //           task.first = false
      //           task.className = ''
      //           isfirst = true
      //         } else {
      //           task.className = 'notfirst'
      //         }
      //         // console.log('dataExist: ', dataExist)
      //         let m = {
      //           id: item.id,
      //           task: task.name || task.id,
      //           className: task.className
      //         }
      //         if (task.hasOwnProperty('first')) {
      //           m.first = task.first
      //         }
      //         if (dataExist !== null && dataExist !== undefined && dataExist.hasOwnProperty('data')) {
      //           for (let k in dataExist.data) {
      //             m[k] = dataExist.data[k]
      //           }
      //           this.colviewData.push(m)
      //         } else {
      //           this.colviewData.push(m)
      //         }
      //       }
      //     }
      //   }
      //   this.tableLoading = false
      // }).catch(err => {
      //   this.tableLoading = false
      //   console.log('Erro: ', err)
      // })
    },
    async init () {
      this.tableLoading = true
      this.colviewCols = [
        {
          title: 'ID',
          key: '_uuid',
          fixed: 'left',
          width: 280,
          render: (h, params) => {
            if (params.row._first) {
              return h('div', [
                h('span', {
                  attrs: {
                    title: 'Click to Copy',
                    class: 'clickToCopy'
                  },
                  on: {
                    click: () => {
                      let $temp = $('<input>')
                      $('body').append($temp)
                      $temp.val(params.row._uuid).select()
                      document.execCommand('copy')
                      this.$Message.info('Copied to Clipboard')
                      $temp.remove()
                    }
                  }
                }, params.row._uuid),
                h('span', {
                  attrs: {
                    class: 'btn btn-default btn-sm showHideBtn'
                  },
                  on: {
                    click: () => {
                      $('.' + params.row._uuid).toggle()
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
            } else {
              return h('span', '')
            }
          }
          // render: (h, params) => {
          //   if (params.row.hasOwnProperty('first')) {
          //     if (params.row.first) {
          //       console.log('Id: ', params.row.id)
          //       return h('div', [
          //         h('span', {
          //           attrs: {
          //             title: 'Click to Copy',
          //             class: 'clickToCopy'
          //           },
          //           on: {
          //             click: () => {
          //               var $temp = $('<input>')
          //               $('body').append($temp)
          //               $temp.val(params.row.id).select()
          //               document.execCommand('copy')
          //               this.$Message.info('Copied to Clipboard')
          //               $temp.remove()
          //             }
          //           }
          //         }, params.row._uuid),
          //         h('span', {
          //           attrs: {
          //             class: 'btn btn-default btn-sm showHideBtn'
          //           },
          //           on: {
          //             click: () => {
          //               for (let [inx, item] of this.colviewData.entries()) {
          //                 if (item.id === params.row.id && params.index !== inx) {
          //                   if (!params.row.first) {
          //                     item.className = ''
          //                   } else {
          //                     item.className = 'notfirst'
          //                   }
          //                 }
          //                 if (params.index === inx) {
          //                   item.first = !item.first
          //                 }
          //               }
          //             }
          //           }
          //         }, [
          //           h('i', {
          //             attrs: {
          //               class: 'fa fa-angle-up'
          //             }
          //           })
          //         ])
          //       ])
          //     } else {
          //       console.log('Id: ', params.row.id)
          //       return h('div', [
          //         h('span', {
          //           attrs: {
          //             title: 'Click to Copy',
          //             class: 'clickToCopy'
          //           },
          //           on: {
          //             click: () => {
          //               var $temp = $('<input>')
          //               $('body').append($temp)
          //               $temp.val(params.row.id).select()
          //               document.execCommand('copy')
          //               this.$Message.info('Copied to Clipboard')
          //               $temp.remove()
          //             }
          //           }
          //         }, params.row._uuid),
          //         h('span', {
          //           attrs: {
          //             class: 'btn btn-sm showHideBtn'
          //           },
          //           on: {
          //             click: () => {
          //               for (let [inx, item] of this.colviewData.entries()) {
          //                 if (item.id === params.row.id && params.index !== inx) {
          //                   if (!params.row.first) {
          //                     item.className = ''
          //                   } else {
          //                     item.className = 'notfirst'
          //                   }
          //                 }
          //                 if (params.index === inx) {
          //                   item.first = !item.first
          //                 }
          //               }
          //             }
          //           }
          //         }, [
          //           h('i', {
          //             attrs: {
          //               class: 'fa fa-angle-down'
          //             }
          //           })
          //         ])
          //       ])
          //     }
          //   }
          // }
        },
        {
          title: 'Task',
          key: '_state',
          width: 150,
          render: (h, params) => {
            if (this.flowzData.processList[params.row._state].name && this.flowzData.processList[params.row._state].name !== '') {
              return h('span', this.flowzData.processList[params.row._state].name)
            } else {
              return h('span', params.row._state)
            }
          }
        }
      ]
      this.colviewData = []
      this.fid = this.$route.params.id

      this.flowzData = await this.getFlowz()
      this.currentSchema = await this.getSchema(this.flowzData.schema)
      this.populateTables()

      //   // let anyCustom = false
      for (let item of this.currentSchema.entity) {
        if (!item.customtype) {
          if (item.type === 'file') {
            this.colviewCols.push({
              title: item.name,
              key: item.name,
              width: 150,
              render: (h, params) => {
                let arr = []
                if (params.row[item.name]) {
                  for (let i = 0; i < params.row[item.name].length; i++) {
                    arr.push(h('Button', {
                      attrs: {
                        type: 'info',
                        style: 'margin: 2px',
                        title: params.row[item.name][i].split('/').pop()
                      },
                      on: {
                        click: () => {
                          window.open(params.row[item.name][i])
                        }
                      }
                    }, [
                      h('i', {
                        attrs: {
                          class: 'fa fa-link'
                        }
                      })
                    ]))
                  }
                  return arr
                }
              }
            })
          } else {
            this.colviewCols.push({
              title: item.name,
              key: item.name,
              width: 150
            })
          }
        } else {
          // anyCustom = true
        }
      }
    }
  },
  computed: {
    configdata () {
      return this.configuration.fields
    }
    // colviewCols () {
    //   this.colviewCols = []

    //   let cols = []
    //   cols.push({
    //     title: 'ID',
    //     key: '_uuid',
    //     fixed: 'left',
    //     width: 280
    //   })

    //   cols.push({
    //     title: 'Task',
    //     key: '_state',
    //     width: 150
    //   })

    //   this.colviewCols = cols

    //   return this.colviewCols
    // }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route.params.id': function (newValue, oldValue) {
      this.init()
    },
    '$store.state.updateView': function (newValue, oldValue) {
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
  .ivu-table-cell{
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
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

  .clickToCopy{
    cursor: pointer;
  }
</style>  