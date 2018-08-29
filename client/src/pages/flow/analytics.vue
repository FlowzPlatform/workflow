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
            <Button @click="modal1 = true"><i class="fa fa-cog"></i></Button>
          </Tooltip>

          <Modal
            v-model="modal1"
            title="Common Modal dialog box title"
            @on-ok="saveConfig"
            @on-cancel="cancel">
            
            <Form :model="configurations" :label-width="130">
              <FormItem label="Set Date Format">
                <RadioGroup v-model="configurations.dateFormat" vertical>
                  <Radio label="MMMM Do YYYY, h:mm:ss a">
                      <span>August 27th 2018, 5:10:26 pm</span>
                  </Radio>
                  <Radio label="MMM Do YY">
                      <span>Aug 27th 18</span>
                  </Radio>
                  <Radio label="none">
                      <span>2018-08-27T17:11:16+05:30</span>
                  </Radio>
                </RadioGroup>
              </FormItem> 

              <strong>Select Fields to show:</strong>
              <Table :columns="colConfig" :data="configData"></Table>


              <!-- <FormItem label="Select Rows to display:"> -->

                <!-- <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
                    <Checkbox
                      :indeterminate="configurations.indeterminate"
                      :value="configurations.checkAll"
                      @click.prevent.native="handleCheckAll">Select All
                    </Checkbox>
                </div> -->
                <!-- CheckboxGroup v-model="configurations.selectedTableHeaders">
                    
                    <Checkbox :label="show.name"><br></Checkbox>

                    <Checkbox :label="show.name" v-if="show.type != 'start' && show.type != 'endevent' && show.type != 'intermediatethrowevent'" v-for="show in configurations.selectedTableHeaders">{{show.name}}<br></Checkbox>
                </CheckboxGroup> -->
              <!-- </FormItem>  -->
            </Form>
            

        </Modal>
       </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="row">
            <div class="col-md-6">
              <Input search enter-button placeholder="Search..." v-model="searchQuery" @on-change="searchInTable"/>
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-md-6">
                  <Select style="width: 100%" v-model="selectedFilterBy" clearable placeholder="Filter By">
                    <Option v-for="item in filterBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>
                </div>
                <div class="col-md-6">
                  <Select style="width: 100%" v-model="selectedSortBy" clearable placeholder="Sort By">
                    <Option v-for="item in sortBy" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </Select>    
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="height: 580px; position: relative; overflow-y: auto; padding: 0">
      
      <table class="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Instance</th>
            <th width="150" v-for="(items, index) in tableHeaders" v-if="items.type != 'start' && items.type != 'endevent' && items.type != 'intermediatethrowevent'">
              <span>{{items.name}}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(items, index) in tableData">
            <td>
              {{items.id}}
              <span class="label label-info" style="float: right;" v-if="items.mainStatus == 'inprocess'">{{titleCase(items.mainStatus)}}</span>
              <span class="label label-success" style="float: right;" v-if="items.mainStatus == 'completed'">{{titleCase(items.mainStatus)}}</span>
            </td>
            <!-- <td v-for="(headerItem, headerIndex) in tableHeaders" v-if="headerItem.type != 'start' && headerItem.type != 'endevent' && headerItem.type != 'intermediatethrowevent'" :class="{ redCell : (items.currentStatus == headerItem.id) }"> -->
              <!-- <span v-if="items.currentStatus == headerItem.id"><span class="currentTask"></span></span> -->
              <!-- <span>{{headerItem.id}}</span> -->
              <td v-for="(headerItem, headerIndex) in tableHeaders" v-if="headerItem.type != 'start' && headerItem.type != 'endevent' && headerItem.type != 'intermediatethrowevent'" class="stageTuple">
                <span :class="classObject(items, headerItem.id)"></span>  
                <span :title="getAgoActualStatus(items, headerItem.id)">
                  <i class="fa fa-calendar fa-fw"></i>
                  <small>{{ getAgoStatus(items, headerItem.id) }}</small>
                  <!-- <small>{{ items.createdAt | momentDate }}</small> -->
                </span>
              
                <span class="showData" title="View Data">
                  <Poptip title="Data Entered">
                    <i class="fa fa-info-circle" @click="getPopTipData(items, headerItem.id)"></i>
                    <div class="api" slot="content">
                      <div v-if="currentPopTipData != null">
                        <span v-for="(dataitems, key, index) in currentPopTipData">
                          <div v-if="index < 5">
                            {{key}} : {{dataitems}} <br>
                          </div>
                          <div v-if="index == 6">
                            <Button style="margin: 5px 0" @click="goToDetailView(items, headerItem)">View More</Button>
                          </div>
                        </span>
                      </div> 
                      <div v-else>
                        <small>{{loadingText}}</small>
                      </div>
                    </div>
                  </Poptip>
                </span>
                <!-- <span>
                  <i class="fa fa-clock-o fa-fw"></i>
                  <small>{{ getDifference(items, headerItem.id, headerIndex) }}</small>
                </span> -->  

                <!-- <span v-if="items.currentStatus == headerItem.id" class="currentTask"></span> -->
                <!-- <span v-else class="pendingTask"></span> -->
                <!-- <span v-for="(task, index) in items.stageReference"> -->
                  <!-- <span v-if="task.StageName == headerItem.id" class="completedTask"></span> -->
                <!-- </span> -->
                <!-- <span v-if="items.stageReference.length == 0 && items.currentStatus != headerItem.id" class="pendingTask"></span> -->
              </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import moment from 'moment'
import flowzModel from '@/api/flowz'
import finstanceModel from '@/api/finstance'
import flowzdataModal from '@/api/flowzdata'
import Cookies from 'js-cookie'
// import schemaModel from '@/api/schema'
// import $ from 'jquery'
import _ from 'lodash'

export default {
  name: 'Analytics',
  props: {
    options: {
      type: Object
    }
  },
  data () {
    return {
      id: null,
      flowName: null,
      tableData: [],
      tableHeaders: [],
      currentFlowzJson: null,
      currentPopTipObj: null,
      currentPopTipData: null,
      loadingText: 'Loading...',
      modal1: false,
      configurations: {
        dateFormat: 'none',
        indeterminate: true,
        checkAll: false,
        allTableHeaders: [],
        selectedTableHeaders: null
      },
      dataConfig: [],
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
      ],
      searchQuery: null,
      filterBy: [
        {
          'label': 'Today',
          'value': 'today'
        }, {
          'label': 'Tomorrow',
          'value': 'tomorrow'
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
      selectedSortBy: null
    }
  },
  computed: {
    configData () {
      console.log('Configdata called: ', this.configurations.selectedTableHeaders)
      // if (this.schema.hasOwnProperty('entity')) {
      for (let item of this.configurations.selectedTableHeaders) {
        let isshow = true
        // if (item.customtype) {
        //   isshow = false
        // }
        this.dataConfig.push({
          title: item.title,
          key: item.key,
          show: isshow,
          sortable: false,
          width: 150
        })
      }
      // }
      return this.dataConfig
    }
  },
  component: {
  },
  filters: {
    // momentDate (date) {
    //   return moment(date).fromNow()
    // },
    // momentActualDate (date) {
    //   return moment(date).format('MMMM Do YYYY, h:mm:ss a')
    // }
  },
  methods: {
    searchInTable () {
      console.log('this. searchQuery: ', this.searchQuery)
      // this.tableData = _.filter(this.tableData, (o) => { return o.id === this.searchQuery })
    },
    saveConfig () {
      console.log('this.configdata: ', this.dataConfig)
      // this.configurations.selectedTableHeaders = []
      // this.configurations.selectedTableHeaders = this.dataConfig
      // Cookies.set('analyticsConfiguartions', this.configurations)
    },
    cancel () {
    },
    goToDetailView (instance, task) {
      this.$router.push('/admin/schemaview/' + this.id + '/' + task.id)
    },
    async getPopTipData (items, type) {
      this.currentPopTipData = null
      this.loadingText = 'Loading...'
      let obj = await _.find(items.stageReference, {StageName: type})
      if (obj) {
        this.currentPopTipObj = obj
        await flowzdataModal.get(null, {
          id: this.currentPopTipObj.stageRecordId
        }).then((resData) => {
          this.currentPopTipData = resData.data[0].data
        }).catch((err) => {
          console.log('err: ', err)
        })
      } else {
        this.currentPopTipData = null
        this.loadingText = 'No Data'
      }
    },
    getAgoActualStatus (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      if (obj) {
        return moment(obj.createdAt).format('MMMM Do YYYY, h:mm:ss a')
      } else {
        return ('NA')
      }
    },
    getAgoStatus (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      // console.log('Object created at : ', obj)
      if (obj) {
        return moment(obj.createdAt).fromNow()
      } else {
        return ('NA')
      }
    },
    getDifference (item, type, index) {
      let firstDate = null
      let secondDate = null
      // console.log('First Second: ', item, type, index)
      let firstBlock = _.find(item.stageReference, {StageName: type})
      if (firstBlock) {
        firstDate = firstBlock.createdAt
        // console.log('first date: ', firstDate)
      } else {
        return ('NA')
      }

      let secondBlock = _.find(this.tableData[index + 1].stageReference, {StageName: type})
      if (secondBlock) {
        secondDate = secondBlock.createdAt
        // console.log('secondDate: ', secondDate)
      } else {
        return ('NA')
      }

      let x = moment(firstDate)
      let y = moment(secondDate)

      let duration = y.diff(x, 'hours')
      console.log('Duration: ', duration)
      return duration
    },
    titleCase: function (str) {
      return str.replace(/\w+/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },
    classObject (items, type) {
      if (type === items.currentStatus) {
        return { 'currentTask': true }
      } else if (_.findIndex(items.stageReference, {StageName: type}) !== -1) {
        return { 'completedTask': true }
      } else {
        return { 'pendingTask': true }
      }
    },
    async init () {
      this.$Spin.show()
      this.id = this.$route.params.id
      await flowzModel.get(null, {
        id: this.id,
        $paginate: false
      }).then(res => {
        this.flowName = res.data[0].ProcessName
        this.currentFlowzJson = res.data[0].json
        this.tableHeaders = this.currentFlowzJson.processList
        if (Cookies.get('analyticsConfiguartions')) {
          console.log('If Called: ')
          this.configurations = Cookies.get('analyticsConfiguartions')
        } else {
          console.log('Else Called: ')
          let thisArr = []
          for (let i = 0; i < this.tableHeaders.length; i++) {
            console.log('item: ', this.tableHeaders[i])
            let value = {
              title: this.tableHeaders[i].name,
              key: this.tableHeaders[i].name,
              show: true,
              sortable: false,
              width: 150
            }
            thisArr.push(value)
          }
          this.configurations.selectedTableHeaders = thisArr
        }
      }).catch(err => {
        console.error('Error: ', err)
      })
      // get all instances of selected flow
      await finstanceModel.get(null, {
        fid: this.id,
        $paginate: false
      }).then(response => {
        console.log('res: ', response)
        this.tableData = response.data
      }).catch(err => {
        this.$Notice({duration: '3', title: 'Network Error', desc: ''})
        console.error(err)
      })
      this.$Spin.hide()
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .currentTask{
    display: block;
    position: relative;
    min-width: 100%;
    min-height: 3px;
    background-color: #FF0000;
    margin-top: 2px;
  }

  .completedTask{
    display: block;
    position: relative;
    min-width: 100%;
    min-height: 3px;
    background-color: #00FF00;
    margin-top: 2px;
  }

  .pendingTask{
    display: block;
    position: relative;
    min-width: 100%;
    min-height: 3px;
    background-color: #EEEEEE;
    margin-top: 2px; 
  }

  .grayCell {
    background-color: #eee;
  }

  .redCell {
    background-color: #FF8791
  }

  .greenCell {
    background-color: #93DE87;
  }

  tbody tr td:first-child {
    background-color: transparent;
    width: 350px;
  }

  .label{
    font-size: 12px;
  }
  thead tr{
    background-color: #292929;
    color: #FFF;
  }

  table{
    /*box-shadow: 2px 2px 10px #dadada;*/
    background-color: #fff;
    /*margin: 10px 0;*/
    /*padding: 20px;*/
  }

  /*tbody {
    max-height: 700px !important;
    overflow-y: auto !important;
  }*/

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

  .showData {
    position: absolute;
    right: 7px;
    top: 15px;
  }

  .showData i {
    color: #00d8ff;
    cursor: pointer;
    display: none;
  }

  .stageTuple {
    position: relative;
  } 

  .stageTuple:hover > .showData i{
    display: table-cell;
  }

  .settingsBtn {
    position: absolute;
    right: 20px;
    top: 14px;
  }
</style>

<style>
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  .ivu-modal-body{
    max-height: 550px !important;
    overflow-y: auto !important;
  }
</style>