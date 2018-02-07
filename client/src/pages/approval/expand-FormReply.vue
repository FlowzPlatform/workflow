<template>
	<div style="">
    <div v-if="found">
      <Table :columns="tCols" :data="tData"></Table>
    </div>
    <div v-else style="border: 1px solid #eee; background: #fff; padding: 5px">
      No Data
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
      found: false,
      tCols: [],
      tData: []
    }
  },
  mounted () {
    // console.log('Input', this.data)
    if (this.data !== undefined && this.data.length > 0) {
      this.found = true
      let sobj = _.cloneDeep(this.data[0])
      delete sobj._id
      delete sobj.Schemaid
      this.tCols = _.map(sobj, (v, k) => {
        return { title: k, key: k }
      })
      this.tData = this.data
    }
  }
}
</script>
