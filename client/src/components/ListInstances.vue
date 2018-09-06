<template>
  <div class="ListInstances">
    <!-- <div v-if="instanceEntries != null || instanceEntries.length > 0" v-for="item in instanceEntries" style="display: inline; margin: 5px; margin-bottom: 20px;">
      <a class="btn btn-info" href="javascript:void(0)" @click="getRecord(item)">{{item}}</a>
    </div> -->
    <Breadcrumb style="padding-bottom: 5px;">
        <BreadcrumbItem>{{breadItem.name}}</BreadcrumbItem>
        <BreadcrumbItem>{{breadItem.state}}</BreadcrumbItem>
    </Breadcrumb>
    <div v-if="instanceEntries !== null && instanceEntries.length !== 0" >
      <table class="table" v-loading="tableLoading">
        <thead>
          <tr>
            <th>Instance Id</th>
            <th>Current Status</th>
            <!-- <th>Process State</th> -->
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
              <!-- <td>
                <Tag v-if="item.currentState == 'Complated'" color="blue" class="uppercase"><Icon type="ios-done-all" /> {{valueStatus(item.currentStatus)}}</Tag>
                <Tag v-else color="blue" class="uppercase">{{valueStatus(item.currentStatus)}}</Tag>
              </td>
              <td>
                <Tag color="blue" type="border" class="uppercase">{{item.mainStatus}}</Tag>
                </td>
              <td>
                <a href="javascript:void(0)" @click="getRecord(item)">
                  <Tooltip content="Start" placement="top">
                    <Icon type="ios-play" />
                  </Tooltip>
                </a>
              </td> -->
            </tr>
          </tbody>
      </table>
    </div>
    <div v-else>
      <table class="table" v-loading="tableLoading">
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
import flowzModal from '@/api/flowz'
import flowzdataModal from '@/api/flowzdata'
import dataQuerymodel from '@/api/dataquery'
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
  data () {
    return {
      instanceEntries: null,
      flowzData: null,
      listEntries: null,
      tableLoading: false,
      breadItem: {
        name: '',
        state: ''
      }
    }
  },
  component: {
  },
  methods: {
    valueStatus (value) {
      if (!value) return ''
      return _.find(this.flowzData.json.processList, {id: value}).name
    },
    async getRecord (item) {
      // DeepRecord.deepRecord.getRecord(client, item, async (err, resp) => {
      //   let stageRecordId = resp.stageReference[(resp.stageReference.length) - 1].stageRecordId
      //   let previousObject = await DeepRecord.deepRecord.getRecordObject(client, stageRecordId)
      //   if (err) {
      //   }

      //   let result = await DeepRecord.deepRecord.getCurrentTraget(instanceId, resp.currentStatus)
      //   // let currentState = resp.currentStatus.toLowerCase()
      //   // let schemaId = resp[currentState].schemaId
      let currentObj = _.find(this.flowzData.json.processList, {id: item.currentStatus})
      // console.log('this.flowzData.schema', this.flowzData)
      let values = {
        id: this.flowzData.schema,
        item: item,
        formName: currentObj.name,
        currentState: currentObj.id,
        flowzData: this.flowzData,
        formData: {}
        // nextState: resp[currentState].next,
        // currentState: currentState
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
      //   // app.id = schemaId;
      //   // app.item = item;
      //   // app.nextState = resp[currentState].next;
      //   // app.currentState = currentState;
      //   // app.fetch(schemaId);
      // })
    },
    async init (id, stateid) {
      this.tableLoading = true
      this.$emit('setValues', {id: null})
      let query = {
        fid: id,
        '$paginate': false
      }
      if (stateid) {
        query.currentStatus = stateid
      }
      await flowzModal.get(id, {
        $select: ['json', 'schema']
      }).then(async res => {
        this.flowzData = res.data
        this.breadItem.name = this.flowzData.json.name
        if (stateid) {
          let m = _.find(this.flowzData.json.processList, {id: stateid})
          if (m && m !== null && Object.keys(m).length > 0) {
            this.breadItem.state = m.name
          }
        }
        // await finstanceModal.get(null, query).then(resp => {
        //   this.tableLoading = false
        //   this.instanceEntries = resp.data
        // }).catch(err => {
        //   this.tableLoading = false
        //   this.instanceEntries = null
        //   console.log('err', err)
        // })
        dataQuerymodel.get(null, {
          $last: true,
          fid: this.$route.params.id,
          currentStatus: this.$route.params.stateid
        }).then(queryresp => {
          this.tableLoading = false
          this.instanceEntries = queryresp.data.data
        }).catch(err => {
          this.tableLoading = false
          this.instanceEntries = null
          console.log('Error: ', err)
        })
      }).catch(err => {
        this.tableLoading = false
        this.instanceEntries = null
        console.log('....', err)
      })
    }
    // listChanged (entries) {
    //   this.listEntries = entries
    // },
    // updateList (entries) {
    //   this.instanceEntries = []
    //   this.listEntries = entries
    //   for (let i = 0; i < this.listEntries.length; i++) {
    //     DeepRecord.deepRecord.getRecord(client, this.listEntries[i], async (err, resp) => {
    //       if (err) {
    //         console.log('Error: ', err)
    //       }

    //       let result = await DeepRecord.deepRecord.getCurrentTraget(instanceId, resp.currentStatus)

    //       let pushValue = {
    //         instanceId: this.listEntries[i],
    //         currentState: result.name,
    //         mainStatus: resp.mainStatus
    //       }

    //       this.instanceEntries.push(pushValue)
    //     })
    //   }
    // }
  },
  async mounted () {
    // await instanceList.subscribe(this.updateList, false)
    // this.updateList()
    if (this.$route.params.id) {
      this.init(this.$route.params.id, this.$route.params.stateid)
    }
  },
  watch: {
    '$route.params.id': function (oldValue, newValue) {
      this.init(this.$route.params.id, this.$route.params.stateid)
    },
    '$route.params.stateid': function (oldValue, newValue) {
      this.init(this.$route.params.id, this.$route.params.stateid)
    }
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
</style>
