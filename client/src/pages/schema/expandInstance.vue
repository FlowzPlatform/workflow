<template>
  <div>
    <div v-if="viewTemplate" v-html="viewTemplate">
    </div>
    <Table v-else :columns="instanceOneCol" :data="instanceOneData"></Table>
  </div>
</template>
<script type="text/javascript">
  import Schema from '@/api/schema'
  import instance from '@/api/schema/instance'
  import _ from 'lodash'
  import axios from 'axios'
  export default {
    data () {
      return {
        viewTemplate: '',
        instanceOneData: [],
        instanceOneCol: []
      }
    },
    props: {
      row: Object
    },
    methods: {
    },
    mounted () {
      var self = this
      instance.getThis(this.row.id).then(response => {
        Schema.getThis(response.data.Schemaid).then(res => {
          if (res.data.viewTemplate.length !== 0) {
            var urlViewtemplate = res.data.viewTemplate[0].url
            axios.get(res.data.viewTemplate[0].url).then(html => {
              self.viewTemplate = html.data
            })
          } else {
            this.instanceOneData.push(response.data)
            _.forEach(response.data, (v, k) => {
              this.instanceOneCol.push({title: k, key: k})
            })
          }
        })
      })
    }
  }
</script>