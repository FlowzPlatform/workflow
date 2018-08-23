<template>
	<div style="">
    <div v-if="foundobj">
       <Tabs style="background: #fff;padding: 5px;border: 1px solid #eee;">
          <TabPane v-for="(v, k) in data" :key="k" :label="k">
            <Table border :columns="getCols(v)" :data="v"></Table>
          </TabPane>
      </Tabs>      
    </div>
    <div v-else>
      <Table :loading="loading" border :columns="tCols" :data="tData"></Table>
    </div>
	</div>
</template>
<script>
import _ from 'lodash'

export default {
  name: 'expand-FormReply',
  props: ['data'],
  data () {
    return {
      loading: false,
      tCols: [],
      tData: [],
      foundobj: false
    }
  },
  methods: {
    getCols (value) {
      if (value.length > 0) {
        let sobj = _.cloneDeep(value[0])
        delete sobj._id
        delete sobj.Schemaid
        return _.map(sobj, (v, k) => {
          return { title: k, key: k, width: 150 }
        })
      } else {
        return []
      }
    }
  },
  mounted () {
    // console.log('Input >>>>>', this.data)
    this.tData = []
    if (this.data !== undefined && typeof this.data === 'object' && !_.isArray(this.data)) {
      this.foundobj = true
    } else if (this.data !== undefined && this.data.length > 0) {
      this.loading = true
      let sobj = _.cloneDeep(this.data[0])
      delete sobj._id
      delete sobj.Schemaid
      this.tCols = _.map(sobj, (v, k) => {
        return { title: k, key: k, width: 150 }
      })
      this.tData = this.data
      this.loading = false
    }
  }
}
</script>
