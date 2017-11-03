<template>
  <div class="flow">
      <Button type="primary" @click="back()" icon="chevron-left" style="float:right;">Back</Button>
      <CheckboxGroup v-model="loglevel" @on-change="SetData">
        <Checkbox label="Error" style="color:red;"></Checkbox>
        <Checkbox label="Info" style="color:blue;"></Checkbox>
        <Checkbox label="warning" style="color:orange;"></Checkbox>
    </CheckboxGroup>
    <Table :columns="logsCols" :data="logsData"></Table>
    {{loglevel}}
  </div>
</template>
<script>
import Log from '@/api/logs'
import _ from 'lodash'
export default {
  data () {
    return {
      lData: [],
      logsData: [],
      logsCols: [],
      loglevel: []
    }
  },
  mounted () {
    console.log('mounted call', this.$route.params.id)
    var self = this
    Log.get(this.$route.params.id).then(res => {
      this.lData = res.data.data
      this.loglevel.push('Info')
      this.loglevel.push('warning')
      console.log('$$$$$$$$$$$$$$$$$$$$$$$', res.data.data)
      _.forEach(this.lData, (d) => {
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', d.level)
        if (d.level === 40 || d.level === 30) {
          self.logsData.push(d)
        }
      })
      _.forEach(res.data.data[0], (v, k) => {
        this.logsCols.push({title: k, key: k})
      })
    })
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    SetData: function () {
      var self = this
      console.log('loglevel', this.loglevel)
      this.logsData = []
      _.forEach(this.loglevel, (obj) => {
        console.log(obj)
        _.forEach(this.lData, (d) => {
          if (d.level === 50 && obj === 'Error') {
            self.logsData.push(d)
          } else if (d.level === 40 && obj === 'Info') {
            self.logsData.push(d)
          } else if (d.level === 30 && obj === 'warning') {
            self.logsData.push(d)
          } else {
            // console.log('in else')
          }
        })
      })
    }
  }
}
</script>
<style type="text/css">
.ivu-table-wrapper{
  margin-top: 10px
}
</style>