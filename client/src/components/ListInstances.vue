<template>
  <div class="ListInstances">
    <div v-if="instanceEntries != null || instanceEntries.length > 0" v-for="item in instanceEntries" style="display: inline; margin: 5px; margin-bottom: 20px;">
      <a class="btn btn-info" href="javascript:void(0)" @click="getRecord(item)">{{item}}</a>
    </div>
    <div v-else>
      <p align="center">No Data</p>
    </div>
  </div>
</template>

<script>

const deepstream = require('deepstream.io-client-js')

const DeepRecord = require('@/assets/js/deepstream/deepRecord')

const client = deepstream('ws://167.99.233.211:6020').login()
let instanceId = '39c53741_ec14_4ceb_a9db_97d7066cd424'
let instanceListName = instanceId + 'List'
let instanceName = 'NewWork247'
let instanceList = client.record.getList(instanceListName)

console.log('Data: ', instanceName, instanceList)

export default {
  name: 'ListInstances',
  data () {
    return {
      instanceEntries: null
    }
  },
  component: {
  },
  methods: {
    getRecord (item) {
      DeepRecord.deepRecord.getRecord(client, item, async (err, resp) => {
        console.log('get record resp: ', resp.stageReference)
        let stageRecordId = resp.stageReference[(resp.stageReference.length) - 1].stageRecordId
        let previousObject = await DeepRecord.deepRecord.getRecordObject(client, stageRecordId)
        console.log('stage record id:', previousObject.get())
        if (err) {
          console.log('Error: ', err)
        }

        let result = await DeepRecord.deepRecord.getCurrentTraget(instanceId, resp.currentStatus)
        console.log('resprespresprespresprespresp: ', result)
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
      this.instanceEntries = entries
    }
  },
  mounted () {
    console.log('DeepRecord: ', DeepRecord)
    instanceList.subscribe(this.listChanged, false)
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
