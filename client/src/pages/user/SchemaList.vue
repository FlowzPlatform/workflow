<template>
  <div class="SchemaList">
    <div v-if="configuration" style="">
      <Button style="float: right; margin-top: -50px;" @click="handleConfiguration" ghost><i class="fa fa-cog"></i></Button>
      <Modal v-model="isShow" title="Set Configuration" width="750px"  style="">
        <div style="margin: 10px">
          Display border <i-switch v-model="config.border" style="margin-right: 5px"></i-switch>
          Display stripe <i-switch v-model="config.stripe" style="margin-right: 5px"></i-switch>
          Display index <i-switch v-model="config.index" style="margin-right: 5px"></i-switch>
        </div>
        <div>
            <Table :columns="colConfig" :data="configData"></Table>
        </div>
      </Modal>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="card" style="padding-bottom:15px">
          <div class="row">
            <div class="col-md-12">
              <span><b>Select Action</b></span>
              <Select v-if="this.$store.state.role === 1" v-model="action" label="Select Action" style="width:200px">
                <Option v-for="item in dataActionRole1" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
              <Select v-if="this.$store.state.role === 2" v-model="action" label="Select Action" style="width:200px">
                <Option v-for="item in dataActionRole2" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </div>
            <div v-if="action === 'search'" style="margin-top: 20px;">
              <div class="col-md-4" style="margin-top: 20px;">
                <Input search enter-button placeholder="Search..." v-model="searchQuery"/>
              </div>
              <div class="col-md-4" style="margin-top: 20px;">
                <div class="row">
                  <div class="col-md-12">
                    <Select style="width: 100%" v-model="selectedFilterBy" clearable placeholder="Filter By">
                      <Option v-for="item in filterBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                    <br>
                    <DatePicker v-if="selectedFilterBy === 'customRange'" type="daterange" split-panels placeholder="Select date" style="width: 100%; margin: 5px 0;" v-model="enteredDateRange"></DatePicker>
                  </div>
                  <!-- <div class="col-md-6">
                    <Select style="width: 100%" v-model="selectedSortBy" clearable placeholder="Sort By">
                      <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>    
                  </div> -->
                </div>
              </div>
              <div class="col-md-3" style="margin-top: 20px;">
                <Button icon="search" type="primary" @click="searchData">Search</Button>
                <Tooltip content="Clear Search">
                  <Button icon="ios-trash" type="error" @click="clearSearchData"></Button>  
                </Tooltip>
                
              </div>
            </div>
            <div v-if="action === 'filter'" style="margin-top: 10px;">
              <div class="col-md-2" style="margin-top: 20px;">
                <Select v-model="selectedAssignUser" style="width:200px">
                  <Option v-for="item in stageClaimUsers" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </div>
              <div class="col-md-2 buttonAssign" style="margin-top: 20px;">
                <Button type="primary" @click="assignUser">Assign</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="datashow === 'dataA'">
      <Table ref="selection" @on-selection-change="AddRows" @on-sort-change="sortTableData" highlight-row :columns="setColumns" :data="instanceEntries" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="display: inline-block">
          <Button @click="handleSelectAll(true)">Set all selected</Button>
          <Button @click="handleSelectAll(false)">Cancel all selected</Button>
        </div>
        <div style="float: right; display: inline-block">
          <Page placement="top" :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
    <div v-if="datashow === 'dataC'">
      <Table ref="selection" @on-sort-change="sortTableData" highlight-row :columns="setColumns2" :data="instanceEntries" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page placement="top" :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
    <div v-if="datashow === 'dataU'">
      <Table ref="selection" @on-sort-change="sortTableData" highlight-row :columns="setColumns" :data="instanceEntries" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page placement="top" :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash'
  import axios from 'axios'
  import config from '../../config/index.js'
  import $ from 'jquery'
  import finstanceModal from '@/api/finstance'
  import dflowzdata from '@/api/dflowzdata'
  export default {
    name: 'schemalist',
    props: {
      'schema': Object,
      'configuration': Boolean,
      'dynamicData': Boolean,
      'flowzData': Object,
      'instanceEntries': Array,
      'dataTotal': Number,
      'pageno': Number,
      'limit': Number,
      'datashow': String
    },
    data () {
      return {
        currentFlowzId: '',
        action: 'search',
        dataActionRole1: [{
          value: 'search',
          label: 'SEARCH'
        }, {
          value: 'filter',
          label: 'FILTER'
        }],
        dataActionRole2: [{
          value: 'search',
          label: 'SEARCH'
        }],
        selectedRows: [],
        selectedAssignUser: 'noValue',
        stageClaimUsers: [],
        dataClaim: [],
        skip: 0,
        total: 0,
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
        dataConfig: [],
        isShow: false,
        mdata: [],
        config: {
          border: true,
          stripe: true,
          index: false
        },
        colConfig: [
          {
            title: 'Field Name',
            key: 'key'
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
                      this.configData[params.index].show = !this.configData[params.index].show
                    }
                  }
                })
              ])
            }
          },
          {
            title: 'Sortable',
            key: 'sortable',
            render: (h, params) => {
              return h('div', [
                h('Checkbox', {
                  props: {
                    value: params.row.sortable
                  },
                  on: {
                    'on-change': (value) => {
                      this.configData[params.index].sortable = !this.configData[params.index].sortable
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
                      if (event.target.value && event.target.value !== null && event.keyCode === 13) {
                        if (event.target.value <= 0) {
                          this.configData[params.index].width = 150
                        } else {
                          this.configData[params.index].width = parseInt(event.target.value)
                        }
                      }
                    }
                  }
                })
              ])
            }
          }
        ]
      }
    },
    computed: {
      configData () {
        this.dataConfig = []
        if (this.schema.hasOwnProperty('entity')) {
          for (let item of this.schema.entity) {
            if (this.schema.hasOwnProperty('permission')) {
              if (this.schema.permission !== undefined) {
                if (this.schema.permission[item.name].read === true) {
                  let isshow = true
                  if (item.customtype) {
                    isshow = false
                  }
                  this.dataConfig.push({
                    title: item.name,
                    key: item.name,
                    show: isshow,
                    sortable: false,
                    type: item.type,
                    width: 150
                  })
                }
              } else {
                let isshow = true
                if (item.customtype) {
                  isshow = false
                }
                this.dataConfig.push({
                  title: item.name,
                  key: item.name,
                  show: isshow,
                  sortable: false,
                  type: item.type,
                  width: 150
                })
              }
            }
          }
        }
        return this.dataConfig
      },
      setColumns () {
        const cols = []
        if (this.dynamicData && this.$store.state.role === 1) {
          cols.push({
            type: 'selection',
            width: 60,
            align: 'center',
            fixed: 'left'
          })
          cols.push({
            title: 'Action',
            width: 80,
            align: 'center',
            fixed: 'left',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    shape: 'circle',
                    icon: 'ios-play'
                  },
                  domProps: {
                    title: 'Start'
                  },
                  on: {
                    'click': async () => {
                      this.$Loading.start()
                      let values = {
                        id: this.flowzData.schema,
                        item: params.row,
                        currentState: params.row._state,
                        flowzData: this.flowzData,
                        formData: params.row
                      }
                      this.$Loading.finish()
                      await this.$emit('setValues', values)
                    }
                  }
                }, '')
              ])
            }
          })
          cols.push({
            title: 'Assigned To',
            key: 'claim',
            fixed: 'left',
            width: 200,
            render: (h, params) => {
              return h('span',
              this.selectUser(params),
              )
            }
          })
          cols.push({
            title: 'ID',
            key: '_uuid',
            fixed: 'left',
            width: 260,
            render: (h, params) => {
              return h('span', {
                attrs: {
                  title: 'Click to Copy',
                  class: 'clickToCopy'
                },
                on: {
                  click: () => {
                    var $temp = $('<input>')
                    $('body').append($temp)
                    $temp.val(params.row._uuid).select()
                    document.execCommand('copy')
                    this.$Message.info('Copied to Clipboard')
                    $temp.remove()
                  }
                }
              }, params.row._uuid)
            }
          })
        }
        if (this.dynamicData && this.$store.state.role === 2) {
          cols.push({
            title: 'Action',
            width: 200,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    shape: 'circle',
                    icon: 'ios-play'
                  },
                  domProps: {
                    title: 'Start'
                  },
                  on: {
                    'click': async () => {
                      this.$Loading.start()
                      // let indexFind = _.findIndex(this.instanceEntries, (o) => { return o.id === params.row.id })
                      // let currentObj = this.flowzData.processList[this.instanceEntries[indexFind].currentStatus]
                      let values = {
                        id: this.flowzData.schema,
                        item: params.row,
                        formName: params.row.name,
                        currentState: params.row._currentStatus,
                        flowzData: this.flowzData,
                        formData: params.row
                      }
                      this.$Loading.finish()
                      this.$emit('setValues', values)
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    shape: 'circle',
                    icon: 'ios-undo',
                    size: 'large'
                  },
                  style: {
                    marginLeft: '7px',
                    color: '#0052a9',
                    'border-radius': '32px'
                  },
                  domProps: {
                    title: 'Unclaim'
                  },
                  on: {
                    'click': async () => {
                      let fheaders = {
                        workflowid: 'workflow_' + this.$route.params.id,
                        stateid: this.$route.params.stateid
                      }
                      finstanceModal.patch(params.row.id, {claimUser: ''}, null, fheaders)
                      .then((res) => {
                        this.instanceEntries.splice(params.index, 1)
                        this.$Notice.success({title: 'Successfully Unclaim'})
                      })
                      .catch((err) => {
                        if (err.response) {
                          this.$Notice.error({title: err.response.data.message})
                        } else {
                          this.$Message.error(err.message)
                        }
                      })
                    }
                  }
                }, '')
              ])
            }
          })
          cols.push({
            title: 'ID',
            key: 'id',
            width: 260
          })
        }
        if (this.configuration) {
          if (this.config.index) {
            cols.push({
              type: 'index',
              width: 60,
              align: 'center'
            })
          }
          for (let item of this.dataConfig) {
            if (item.show) {
              if (item.type === 'file') {
                cols.push({
                  title: item.title,
                  key: item.key,
                  sortable: item.sortable,
                  width: item.width,
                  render: (h, params) => {
                    let arr = []
                    if (params.row[item.title]) {
                      for (let i = 0; i < params.row[item.title].length; i++) {
                        arr.push(h('Button', {
                          attrs: {
                            type: 'info',
                            style: 'margin: 2px',
                            title: params.row[item.title][i].split('/').pop()
                          },
                          on: {
                            click: () => {
                              window.open(params.row[item.title][i])
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
                cols.push({
                  title: item.title,
                  key: item.key,
                  sortable: item.sortable,
                  width: item.width,
                  render: (h, params) => {
                    return h('div', params.row[item.key])
                  }
                })
              }
            }
          }
        } else {
          if (this.schema.hasOwnProperty('entity')) {
            for (let item of this.schema.entity) {
              if (item.type === 'file') {
                cols.push({
                  title: item.name,
                  key: item.name,
                  width: 150,
                  render: (h, params) => {
                    let arr = []
                    if (params.row[item.title]) {
                      for (let i = 0; i < params.row[item.title].length; i++) {
                        arr.push(h('Button', {
                          attrs: {
                            type: 'info',
                            style: 'margin: 2px',
                            title: params.row[item.title][i].split('/').pop()
                          },
                          on: {
                            click: () => {
                              window.open(params.row[item.title][i])
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
                cols.push({
                  title: item.name,
                  key: item.name,
                  width: 150,
                  render: (h, params) => {
                    return h('div', params.row[item.name])
                  }
                })
              }
            }
          }
        }
        return cols
      },
      setColumns2 () {
        const cols = []
        if (this.dynamicData) {
          cols.push({
            title: 'Action',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    shape: 'circle'
                  },
                  on: {
                    'click': async () => {
                      let fheaders = {
                        workflowid: 'workflow_' + this.$route.params.id,
                        stateid: this.$route.params.stateid
                      }
                      finstanceModal.patch(params.row.id, {claimUser: this.$store.state.user._id}, null, fheaders)
                      .then((res) => {
                        this.data.splice(params.index, 1)
                        this.$Notice.success({title: 'Successfully Claim'})
                      })
                      .catch((err) => {
                        if (err.response) {
                          this.$Notice.error({title: err.response.data.message})
                        } else {
                          this.$Message.error(err.message)
                        }
                      })
                    }
                  }
                }, 'claim')
              ])
            }
          })
          cols.push({
            title: 'ID',
            key: 'id',
            width: 260
          })
        }
        if (this.configuration) {
          if (this.config.index) {
            cols.push({
              type: 'index',
              width: 60,
              align: 'center'
            })
          }
          for (let item of this.dataConfig) {
            if (item.show) {
              if (item.type === 'file') {
                cols.push({
                  title: item.title,
                  key: item.key,
                  sortable: item.sortable,
                  width: item.width,
                  render: (h, params) => {
                    let arr = []
                    if (params.row[item.title]) {
                      for (let i = 0; i < params.row[item.title].length; i++) {
                        arr.push(h('Button', {
                          attrs: {
                            type: 'info',
                            style: 'margin: 2px',
                            title: params.row[item.title][i].split('/').pop()
                          },
                          on: {
                            click: () => {
                              window.open(params.row[item.title][i])
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
                cols.push({
                  title: item.title,
                  key: item.key,
                  sortable: item.sortable,
                  width: item.width,
                  render: (h, params) => {
                    return h('div', params.row[item.key])
                  }
                })
              }
            }
          }
        } else {
          if (this.schema.hasOwnProperty('entity')) {
            for (let item of this.schema.entity) {
              if (item.type === 'file') {
                cols.push({
                  title: item.name,
                  key: item.name,
                  width: 150,
                  render: (h, params) => {
                    let arr = []
                    if (params.row[item.title]) {
                      for (let i = 0; i < params.row[item.title].length; i++) {
                        arr.push(h('Button', {
                          attrs: {
                            type: 'info',
                            style: 'margin: 2px',
                            title: params.row[item.title][i].split('/').pop()
                          },
                          on: {
                            click: () => {
                              window.open(params.row[item.title][i])
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
                cols.push({
                  title: item.name,
                  key: item.name,
                  width: 150,
                  render: (h, params) => {
                    return h('div', params.row[item.name])
                  }
                })
              }
            }
          }
        }
        return cols
      }
    },
    mounted () {
      this.currentFlowzId = this.$route.params.id.replace(/-/g, '_')
      this.total = this.dataTotal
      axios.get(config.usermodulerole)
      // usermodulerole.get()
      .then((res) => {
        let module = 'workflow_' + this.$route.params.id
        let users = _.filter(res.data.data, {'module': module})
        this.stageClaimUsers.push({value: 'noValue', label: '-- Unassign User --'})
        for (let i = 0; i < users.length; i++) {
          axios.get(config.userdetails + users[i].userId)
          .then((response) => {
            this.stageClaimUsers.push({value: users[i].userId, label: response.data.data[0].fullname})
          })
          .catch((error) => {
            console.log(error)
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
    },
    methods: {
      assignUser () {
        if (this.selectedAssignUser === '') {
          this.$Notice.error({title: 'Please first select user'})
        } else if (this.selectedRows.length === 0) {
          this.$Notice.error({title: 'Please first select Rows'})
        } else {
          for (let i = 0; i < this.selectedRows.length; i++) {
            let fheaders = {
              // workflowid: 'workflow_' + this.$route.params.id,
              normalpatch: true,
              ftablename: this.currentFlowzId
            }
            if (this.selectedAssignUser !== 'noValue') {
              dflowzdata.patch(this.selectedRows[i].id, {_claimUser: this.selectedAssignUser, _state: this.$route.params.stateid}, null, fheaders)
              .then((res) => {
                this.$Notice.success({title: 'Successfully Assign'})
              })
              .catch((err) => {
                if (err.response) {
                  this.$Notice.error({title: err.response.data.message})
                } else {
                  this.$Message.error(err.message)
                }
              })
            } else {
              dflowzdata.patch(this.selectedRows[i].id, {_claimUser: this.selectedAssignUser, _state: this.$route.params.stateid}, null, fheaders)
              .then((res) => {
                this.$Notice.success({title: 'Successfully Assign'})
              })
              .catch((err) => {
                if (err.response) {
                  this.$Notice.error({title: err.response.data.message})
                } else {
                  this.$Message.error(err.message)
                }
              })
            }
          }
        }
      },
      AddRows (selection) {
        this.selectedRows = []
        this.selectedRows = selection
      },
      handleSelectAll (status) {
        this.$refs.selection.selectAll(status)
      },
      selectUser (params) {
        if (params.row.hasOwnProperty('_claimUser')) {
          let obj = _.find(this.stageClaimUsers, {value: params.row._claimUser})
          if (obj !== undefined) {
            this.instanceEntries[params.index].claim = obj.value
            return obj.label
          }
        }
      },
      clearSearchData () {
        this.searchQuery = ''
        this.selectedFilterBy = ''
        let object = {
          text: '',
          filterBy: ''
        }
        this.$emit('search-data', object)
      },
      searchData () {
        let object = {
          text: this.searchQuery,
          filterBy: this.selectedFilterBy
        }
        this.$emit('search-data', object)
      },
      sortTableData (object) {
        this.$emit('sort-data', object)
      },
      handleConfiguration () {
        this.isShow = !this.isShow
      },
      handlePage (page) {
        this.skip = (page * this.limit) - this.limit
        this.$emit('on-paginate', this.skip, this.limit, page)
      },
      handlePagesize (size) {
        this.$emit('on-handlepage', this.skip, this.limit, size)
      }
    }
  }
</script>
<style scoped>
  .thisTable {
    max-height: 400px;
    overflow-y: auto;
    margin: 0 10px;
  }

  .card{
    box-shadow: 2px 2px 10px #dadada;
    background-color: #fff;
    margin: 10px;
    padding: 20px;
  }

  .searchQueries{
    margin: 5px 0;
  }
  .ivu-table-cell td div span{
    /*width:200px !important;*/
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  @media only screen and (max-width: 1600px ) and (min-width: 1400px) {
      .buttonAssign {
        margin-left: 30px !important
      }
  }
   @media only screen and (min-width: 900px) and (max-width: 1400px) {
     .buttonAssign {
        margin-left: 100px !important
      }
   }

</style>

<style>
/*.ivu-table td:nth-child(2) div span{
  width:200px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}*/
.ivu-table-cell div{
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }


</style>
