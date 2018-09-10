<template>
  <div class="ListInstances">
    <!-- <div v-if="instanceEntries != null || instanceEntries.length > 0" v-for="item in instanceEntries" style="display: inline; margin: 5px; margin-bottom: 20px;">
      <a class="btn btn-info" href="javascript:void(0)" @click="getRecord(item)">{{item}}</a>
    </div> -->
    <Breadcrumb style="padding-bottom: 5px;">
        <BreadcrumbItem>{{setBreadcrumbs.name}}</BreadcrumbItem>
        <BreadcrumbItem>{{setBreadcrumbs.state}}</BreadcrumbItem>
    </Breadcrumb>
    <div v-if="instanceEntries !== null && instanceEntries.length !== 0" >
      <table class="table" id="data">
        <thead>
          <tr>
            <th>Instance Id</th>
            <th>Current Status</th>
            <th width="150px">Action</th>
          </tr>
        </thead>
        <tbody>
            <tr v-for="(item, inx) in instanceEntries">
              <td>{{item.id}}</td>
              <td>
                <Tag color="blue" type="border" class="uppercase">{{item.mainStatus}}</Tag>
              </td>
              <td>
                <a href="javascript:void(0)" @click="getRecord(item)">
                  <Tooltip content="Start" placement="top">
                    <Icon type="ios-play" />
                  </Tooltip>
                </a>
              </td>
            </tr>
          </tbody>
      </table>
    </div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>Instance Id</th>
            <th>Current Status</th>
            <th>Process State</th>
            <th width="150px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="4" style="text-align:center">No Data</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div v-else>
      <p align="center">No Data</p>
    </div> -->
  </div>
</template>

<script>

// const deepstream = require('deepstream.io-client-js')
// import finstanceModal from '@/api/finstance'
// import flowzModal from '@/api/flowz'
import $ from 'jquery'
import flowzdataModal from '@/api/flowzdata'
// import dataQuerymodel from '@/api/dataquery'
import _ from 'lodash'

// const DeepRecord = require('@/assets/js/deepstream/deepRecord')
// const client = deepstream('ws://204.48.26.167:6020').login()
// let instanceId = '39c53741_ec14_4ceb_a9db_97d7066cd424'
// let instanceId1 = '39c53741-ec14-4ceb-a9db-97d7066cd424'
// let instanceListName = instanceId + 'List'
// let instanceName = 'NewWork247'
// let instanceList = client.record.getList(instanceListName)

export default {
  name: 'ListInstances',
  props: ['instanceEntries', 'flowzData'],
  data () {
    return {
      breadItem: {
        name: '',
        state: ''
      }
    }
  },
  computed: {
    setBreadcrumbs () {
      let state = ''
      let m = this.flowzData.processList[this.$route.params.stateid]
      if (m && m !== null && Object.keys(m).length > 0) {
        state = m.name
      }
      return {
        name: this.flowzData.name,
        state: state
      }
    }
  },
  methods: {
    async getRecord (item) {
      console.log('Item: ', this.flowzData)
      let currentObj = this.flowzData.processList[item.currentStatus]
      let values = {
        id: this.flowzData.schema,
        item: item,
        formName: currentObj.name,
        currentState: currentObj.id,
        flowzData: this.flowzData,
        formData: {}
      }
      if (item.stageReference.length > 0) {
        let lastObj = item.stageReference[item.stageReference.length - 1]
        await flowzdataModal.get(lastObj.stageRecordId).then(res => {
          values.formData = res.data.data
        }).catch(err => {
          console.log('error', err)
        })
      }
      await this.$emit('setValues', values)
    }
  },
  mounted () {
    $('#data tr').click(function () {
      var selected = $(this).hasClass('highlight')
      console.log(selected)
      $('#data tr').removeClass('highlight')
      if (!selected) {
        $(this).addClass('highlight')
      }
    })
  },
  feathers: {
    'finstance': {
      created (data) {
        let self = this
        if (data.fid === this.$route.params.id) {
          if (this.$route.params.stateid) {
            if (data.currentStatus === this.$route.params.stateid) {
              self.instanceEntries.push(data)
            }
          } else {
            self.instanceEntries.push(data)
          }
        }
      },
      updated (data) {
        let self = this
        if (data.fid === this.$route.params.id) {
          if (this.$route.params.stateid) {
            if (data.currentStatus !== this.$route.params.stateid) {
              let inx = _.findIndex(this.instanceEntries, {id: data.id})
              if (inx !== -1) {
                self.instanceEntries.splice(inx, 1)
                self.id = null
              }
            }
          } else {
            let inx = _.findIndex(this.instanceEntries, {id: data.id})
            if (inx !== -1) {
              self.instanceEntries.splice(inx, 1)
              self.instanceEntries.splice(inx, 0, data)
            }
          }
        }
      },
      removed (data) {
        let self = this
        let inx = _.findIndex(this.instanceEntries, {id: data.id})
        if (inx !== -1) {
          self.instanceEntries.splice(inx, 1)
        }
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .ListInstances {
    margin: 20px 0;
  }

  .table thead tr{
    background-color: #F7F7F7;
    border-color: #E6E6E6;
  }

  .table thead tr th{
    padding: 15px;
    text-transform: uppercase;
    color: #4A4A4A;
    font-size: 14px;
    font-weight: semibold;
  }

  .table tbody tr{
    border-bottom: 1px solid #E6E6E6;
    border-color: #E6E6E6;
  }

  .table tbody tr:hover{
    background-color: #F5F8FC;
  }

  .table tbody tr:hover > td a{
    display: block;
  }

  .table tbody tr td{
    padding: 15px;
    color: #4A4A4A;
    font-size: 14px;
    text-align: left;
  }

  .table tbody tr td a{
    color: #0954AB;
    display: none;
  }

  .uppercase{
    text-transform: uppercase;
  }

  .highlight {
    background-color:#ebf7fe;
  }
</style>
