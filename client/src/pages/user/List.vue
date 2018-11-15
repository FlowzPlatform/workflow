<template>
  <div class="list">
    <div v-if="Object.keys(schema).length != 0">
      <schemalist :schema="schema" :data="mdata" :configuration="configuration"></schemalist>
      <!-- {{mdata}} -->
    </div>
  </div>
</template>
<script>
  import schemaModel from '@/api/schema'
  // const deepstream = require('deepstream.io-client-js')
  // const client = deepstream('ws://204.48.26.167:6020').login()

  export default {
    name: 'listview',
    components: {
      'schemalist': (resolve) => { require(['./SchemaList'], resolve) },
    },
    data () {
      return {
        schema: {},
        mdata: [],
        configuration: true
      }
    },
    mounted () {
      if (this.$store.state.activeList !== null) {
        // let ids = this.$store.state.activeList.split('/')
        // this.setSchema(ids[1])
        // this.setList(ids[0])
      }
    },
    methods: {
      listChanged (entries) {
        this.mdata = []
        // for (let i of entries) {
        //   let recordObj = client.record.getRecord(i)
        //   recordObj.whenReady((record) => {
        //     this.mdata.push(record.get())
        //   })
        // }
      },
      setSchema (id) {
        if (id !== null && id !== undefined) {
          schemaModel.getAll(id).then(res => {
            this.schema = res
          }).catch(err => {
            console.log('Error: ', err)
          })
        }
      },
      setList (StageId) {
        // let orderEntryList = client.record.getList(StageId + 'List')
        // orderEntryList.subscribe(this.listChanged, false)
      }
    },
    watch: {
      '$store.state.activeList': function (oldValue, newValue) {
        this.schema = []
        this.mdata = []
        newValue = newValue.split('/')
        this.setSchema(newValue[1])
        this.setList(newValue[0])
      }
    }
  }
</script>
