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
              <Button icon="search" type="primary" long>Search</Button>
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

    <div>
      <Table highlight-row :columns="setColumns" :data="data" :border="config.border" :stripe="config.stripe"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="total" :current="pageno" :page-size="limit" @on-change="handlePage" @on-page-size-change="handlePagesize"></Page>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _ from 'lodash'
  import $ from 'jquery'
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
      'pageno': Number
    },
    data () {
      return {
        limit: 10,
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
        if (this.dynamicData) {
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
                  on: {
                    'click': async () => {
                      // console.log('Params: ', this.instanceEntries, params)
                      this.$Loading.start()
                      let indexFind = _.findIndex(this.instanceEntries, (o) => { return o.id === params.row.id })
                      // console.log('indexfind: ', indexFind)
                      // this.$emit('setValues', this.instanceEntries[indexFind])
                      // console.log('Click: ', params.row, params.index)
                      // console.log('this.flowzData: ', this.flowzData)
                      let currentObj = this.flowzData.processList[this.instanceEntries[indexFind].currentStatus]
                      // console.log('this.flowzData.schema SchemaList', this.flowzData.schema)
                      let values = {
                        id: this.flowzData.schema,
                        item: this.instanceEntries[indexFind],
                        formName: currentObj.name,
                        currentState: currentObj.id,
                        flowzData: this.flowzData,
                        formData: params.row.data
                        // nextState: resp[currentState].next,
                        // currentState: currentState
                      }
                      // console.log('_____________values', item)
                      // console.log('this.instanceEntries[indexFind].stageReference.length: ', this.instanceEntries[indexFind].stageReference.length)
                      // if (this.instanceEntries[indexFind].stageReference.length > 0) {
                      //   let lastObj = this.instanceEntries[indexFind].stageReference[this.instanceEntries[indexFind].stageReference.length - 1]
                      //   // console.log('last obj: ', lastObj)
                      //   await flowzdataModal.get(lastObj.stageRecordId).then(res => {
                      //     values.formData = res.data.data
                      //     this.$Spin.hide()
                      //   }).catch(err => {
                      //     this.$Spin.hide()
                      //     console.log(err)
                      //   })
                      // }
                      // console.log('Values emitted: ', values)
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
                  // console.log('params.row.data: ', params.row.data)
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
                  // console.log('params.row.data: ', params.row.data)
                  return h('div', params.row.data[item.name])
                }
              })
            }
          }
        }
        // console.log('cols: ', cols)
        return cols
      }
    },
    mounted () {
      this.total = this.dataTotal
      this.mdata = this.data
      $('.ivu-table td:nth-child(2) div span').mouseover(function () {
        var valueOfTd = $(this).text()
        $('.ivu-table td:nth-child(2) div span').attr('title', valueOfTd)
      })
    },
    methods: {
      handleConfiguration () {
        this.isShow = !this.isShow
      },
      handlePage (page) {
        this.skip = (page * this.limit) - this.limit
        this.$emit('on-paginate', this.skip, this.limit, page)
      },
      handlePagesize (size) {
        this.limit = size
        this.skip = 0
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
          _.remove(this.data, (o) => { return o.id === data.id })
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
</style>

<style>
.ivu-table td:nth-child(2) div span{
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>
