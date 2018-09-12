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
        <div class="card">
          <div class="row">
            <div class="col-md-6">
              <Input search enter-button placeholder="Search..." v-model="searchQuery"/>
            </div>
            <div class="col-md-4">
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
            <div class="col-md-2">
              <Button icon="search" type="primary" @click="searchData" long>Search</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="role === 'admin'">
      <Table @on-sort-change="sortTableData" highlight-row :columns="setColumns" :data="data" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
    <div v-if="role === 'client'">
      <Table @on-sort-change="sortTableData" highlight-row :columns="setColumns2" :data="data" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
    <div v-if="role === 'client_unclaim'">
      <Table @on-sort-change="sortTableData" highlight-row :columns="setColumns" :data="data" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="total" :current="pageno" :page-size="limit" show-sizer @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash'
  import $ from 'jquery'
  import finstanceModal from '@/api/finstance'
  export default {
    name: 'schemalist',
    props: {
      'schema': Object,
      'data': Array,
      'configuration': Boolean,
      'dynamicData': Boolean,
      'flowzData': Object,
      'instanceEntries': Array,
      'dataTotal': Number,
      'pageno': Number,
      'limit': Number,
      'role': String
    },
    data () {
      return {
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
                      // console.log('show', value)
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
                      // console.log('sortable', value)
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
                      // console.log('value', event.target.value, event.keyCode)
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
            let isshow = true
            if (item.customtype) {
              isshow = false
            }
            this.dataConfig.push({
              title: item.name,
              key: item.name,
              show: isshow,
              sortable: false,
              width: 150
            })
          }
        }
        return this.dataConfig
      },
      setColumns () {
        const cols = []
        if (this.dynamicData && this.$store.state.role === 1) {
          cols.push({
            title: 'Action',
            width: 100,
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
                      let indexFind = _.findIndex(this.instanceEntries, (o) => { return o.id === params.row.id })
                      let currentObj = this.flowzData.processList[this.instanceEntries[indexFind].currentStatus]
                      let values = {
                        id: this.flowzData.schema,
                        item: this.instanceEntries[indexFind],
                        formName: currentObj.name,
                        currentState: currentObj.id,
                        flowzData: this.flowzData,
                        formData: params.row.data
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
            title: 'ID',
            key: 'iid',
            width: 260
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
                      let indexFind = _.findIndex(this.instanceEntries, (o) => { return o.id === params.row.id })
                      let currentObj = this.flowzData.processList[this.instanceEntries[indexFind].currentStatus]
                      let values = {
                        id: this.flowzData.schema,
                        item: this.instanceEntries[indexFind],
                        formName: currentObj.name,
                        currentState: currentObj.id,
                        flowzData: this.flowzData,
                        formData: params.row.data
                      }
                      this.$Loading.finish()
                      await this.$emit('setValues', values)
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
                      finstanceModal.patch(params.row.id, {claimuser: ''})
                      .then((res) => {
                        this.data.splice(params.index, 1)
                        console.log(this.data)
                        this.$Notice.success({title: 'Successfully Unclaim'})
                      })
                      .catch((err) => {
                        console.log(err)
                        this.$Notice.error({title: 'Unclaim error'})
                      })
                    }
                  }
                }, '')
              ])
            }
          })
          cols.push({
            title: 'ID',
            key: 'iid',
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
              cols.push({
                title: item.title,
                key: item.key,
                sortable: item.sortable,
                width: item.width,
                render: (h, params) => {
                  return h('div', params.row.data[item.key])
                }
              })
            }
          }
        } else {
          if (this.schema.hasOwnProperty('entity')) {
            for (let item of this.schema.entity) {
              cols.push({
                title: item.name,
                key: item.name,
                width: 150,
                render: (h, params) => {
                  return h('div', params.row.data[item.name])
                }
              })
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
                      finstanceModal.patch(params.row.id, {claimuser: this.$store.state.user._id})
                      .then((res) => {
                        console.log(params.index)
                        this.data.splice(params.index, 1)
                        console.log(this.data)
                        this.$Notice.success({title: 'Successfully Claim'})
                      })
                      .catch((err) => {
                        console.log(err)
                        this.$Notice.error({title: 'claim error'})
                      })
                    }
                  }
                }, 'claim')
              ])
            }
          })
          cols.push({
            title: 'ID',
            key: 'iid',
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
              cols.push({
                title: item.title,
                key: item.key,
                sortable: item.sortable,
                width: item.width,
                render: (h, params) => {
                  return h('div', params.row.data[item.key])
                }
              })
            }
          }
        } else {
          if (this.schema.hasOwnProperty('entity')) {
            for (let item of this.schema.entity) {
              cols.push({
                title: item.name,
                key: item.name,
                width: 150,
                render: (h, params) => {
                  return h('div', params.row.data[item.name])
                }
              })
            }
          }
        }
        return cols
      }
    },
    mounted () {
      // this.dataClaim = _.filter(this.data, function (o) { return o.claimuser === '' })
      console.log(this.data)
      this.total = this.dataTotal
      this.mdata = this.data
      $('.ivu-table td:nth-child(2) div span').mouseover(function () {
        var valueOfTd = $(this).text()
        $('.ivu-table td:nth-child(2) div span').attr('title', valueOfTd)
      })
      $('.ivu-table-cell div').mouseover(function () {
        var valueOfTd = $(this).text()
        $('.ivu-table-cell div').attr('title', valueOfTd)
      })
    },
    methods: {
      searchData () {
        let object = {
          text: this.searchQuery
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
    },
    feathers: {
      'finstance': {
        created (data) {
          // console.log('created called: ', data)
          // let findIndex = _.findIndex(this.data, (o) => { return o.id })
          // if (findIndex !== -1) {
          //   this.data.push(data)
          // }
        },
        updated (data) {
          // console.log('updated called: ', data)
          // _.remove(this.data, (o) => { return o.id === data.id })
        },
        removed (data) {
        }
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
    width:200px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
</style>

<style>
.ivu-table td:nth-child(2) div span{
  width:200px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.ivu-table-cell div{
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
</style>
