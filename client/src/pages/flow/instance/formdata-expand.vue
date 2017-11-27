<template>
    <div>
        <Row class="expand-row">
            <Col span="24">
                <span class="expand-key">
                  <!-- Here -->
                  <Table :columns="formCol" :data="formData"></Table>
                </span>
            </Col>
        </Row>
    </div>
</template>
<script>
// import instanceModel from '@/api/flowzinstance'
// import flowzInstanceById from '@/api/flowz'
// let _ = require('lodash')
export default {
  data () {
    return {
      formCol: [],
      formData: []
    }
  },
  props: {
    row: Object
  },
  methods: {
  },
  mounted () {
    console.log('form expand............', this.row)
    this.formCol = this.row.cols
    if (this.row.rData.status === 'processing' || this.row.rData.status === 'completed') {
      this.formData = this.row.formdata
    }
  }
}
</script>
<style scoped>
</style>
