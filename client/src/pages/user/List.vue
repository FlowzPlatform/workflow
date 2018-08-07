<template>
  <div class="list">
    <div v-if="Object.keys(schema).length != 0">
      <schemalist :schema="schema" :data="data" :configuration="configuration"></schemalist>
    </div>
  </div>
</template>
<script>
  import schemalist from './SchemaList'
  import schemaModel from '@/api/schema'
  export default {
    name: 'listview',
    components: {
      'schemalist': schemalist
    },
    data () {
      return {
        schema: {},
        data: [],
        configuration: true
      }
    },
    mounted () {
      console.log(this.$route.params.id)
      schemaModel.getAll(this.$route.params.id).then(res => {
        this.schema = res
        console.log('Res:: ', res)
      }).catch(err => {
        console.log('Error: ', err)
      })
    }
  }
</script>