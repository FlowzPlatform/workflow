<template>
  <div class="ListInstances">
    <!-- <div v-if="instanceEntries != null || instanceEntries.length > 0" v-for="item in instanceEntries" style="display: inline; margin: 5px; margin-bottom: 20px;">
      <a class="btn btn-info" href="javascript:void(0)" @click="getRecord(item)">{{item}}</a>
    </div> -->
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
        <tr v-if="instanceEntries != null || instanceEntries.length != 0" v-for="item in instanceEntries">
          <td>{{item.instanceId}}</td>
          <td>
            <Tag v-if="item.currentState == 'Complated'" color="blue" class="uppercase"><Icon type="ios-done-all" /> {{item.currentState}}</Tag>
          </td>
          <td>
            <Tag color="blue" type="border" class="uppercase">{{item.mainStatus}}</Tag>
            </td>
          <td>
            <a href="javascript:void(0)" @click="getRecord(item.instanceId)">
              <!-- <Button type="text" icon="ios-play"></Button> -->
              <Tooltip content="Start" placement="top">
                <Icon type="ios-play" />
              </Tooltip>
            </a>
          </td>
        </tr>
        <tr v-else>
          <td colspan="2">No Data</td>
        </tr>
      </tbody>
    </table>
    <!-- <div v-else>
      <p align="center">No Data</p>
    </div> -->
  </div>
</template>

<script>

const deepstream = require('deepstream.io-client-js')

const DeepRecord = require('@/assets/js/deepstream/deepRecord')

const client = deepstream('ws://204.48.26.167:6020').login()
let instanceId = '39c53741_ec14_4ceb_a9db_97d7066cd424'
let instanceListName = instanceId + 'List'
let instanceName = 'NewWork247'
let instanceList = client.record.getList(instanceListName)

console.log('Data: ', instanceName, instanceList)

export default {
  name: 'ListInstances',
  data () {
    return {
      instanceEntries: null,
      listEntries: null
    }
  },
  component: {
  },
  methods: {
    getRecord (item) {
      console.log('item: ', item)
      DeepRecord.deepRecord.getRecord(client, item, async (err, resp) => {
        console.log('get record resp: ', resp)
        let stageRecordId = resp.stageReference[(resp.stageReference.length) - 1].stageRecordId
        let previousObject = await DeepRecord.deepRecord.getRecordObject(client, stageRecordId)
        // console.log('stage record id:', previousObject.get())
        if (err) {
          console.error('Error: ', err)
        }

        let result = await DeepRecord.deepRecord.getCurrentTraget(instanceId, resp.currentStatus)
        // console.log('resprespresprespresprespresp: ', result)
        // let currentState = resp.currentStatus.toLowerCase()
        // let schemaId = resp[currentState].schemaId
        let values = {
          id: result.inputProperty[0].entityschema.id,
          item: item,
          formName: result.name,
          formData: previousObject.get()
          // nextState: resp[currentState].next,
          // currentState: currentState
        }
        this.$emit('setValues', values)
        // app.id = schemaId;
        // app.item = item;
        // app.nextState = resp[currentState].next;
        // app.currentState = currentState;
        // app.fetch(schemaId);
      })
    },
    listChanged (entries) {
      this.listEntries = entries
    },
    updateList (entries) {
      this.instanceEntries = []
      this.listEntries = entries
      for (let i = 0; i < this.listEntries.length; i++) {
        DeepRecord.deepRecord.getRecord(client, this.listEntries[i], async (err, resp) => {
          if (err) {
            console.log('Error: ', err)
          }

          console.log('resp: ', resp)

          let result = await DeepRecord.deepRecord.getCurrentTraget(instanceId, resp.currentStatus)
          console.log('result: ', result)

          let pushValue = {
            instanceId: this.listEntries[i],
            currentState: result.name,
            mainStatus: resp.mainStatus
          }

          this.instanceEntries.push(pushValue)
        })
      }
    }
  },
  async mounted () {
    console.log('DeepRecord: ', DeepRecord)
    await instanceList.subscribe(this.updateList, false)
    // this.updateList()
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
