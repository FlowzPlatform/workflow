<template>
<div style="background:#eee;padding:20px;margin:50px;">
  <Card :bordered="false">
      <p slot="title">Appraval Action</p>
      <p slot="extra">Notes : {{notes}}</p>
      <Button id="approve" type="primary" :loading="Aloading" v-on:click="handleApproval(true)">
        <span v-if="!Aloading">Approve</span>
        <span v-else>Updating...</span>
      </Button>
      <Button id="reject" type="error" :loading="Rloading" v-on:click="handleApproval(false)">
        <span v-if="!Rloading">Reject</span>
        <span v-else>Updating...</span>
      </Button>
  </Card>
</div>
</template>
<script>
import flowInstance from '../../api/flowzinstance'
import _ from 'lodash'

export default {
  data () {
    return {
      Aloading: false,
      Rloading: false,
      notes: '',
      flowInstanceLog: []
    }
  },
  methods: {
    async handleApproval (action) {
      let self = this
      let lastLogIndex
      this.Aloading = true
      await flowInstance.getThis(self.$route.params.fiid)
        .then(async function (response) {
          let process = await _.find(response.data.processList, ['id', self.$route.params.pid])
          _.forEach(process.target, function (item) {
            lastLogIndex = _.findIndex(response.data.process_log, self.getLastLog(item.id))
            _.forEach(response.data.process_log[lastLogIndex].input, function (inputs) {
              if (inputs.Email === self.$route.params.mailid) {
                inputs.Approved = action
              }
            })
          })
          flowInstance.put(self.$route.params.fiid, response.data)
            .then(async function (res) {
              self.Aloading = false
              self.$Notice.success({title: 'Approval confirmed...!'})
            })
            .catch(function (error) {
              self.$Notice.error({title: 'Error..!', desc: 'Server is busy please try again after some time'})
              console.log('Error..!', error)
              self.Aloading = false
            })
        })
        .catch(function (error) {
          self.$Notice.error({title: 'Error..!', desc: 'Action can not perform please try again...'})
          console.log('Error..!', error)
          self.Aloading = false
        })
    },
    getLastLog (item) {
      return _.chain(this.flowInstanceLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === item }).value()
    }
  },
  async mounted () {
    let self = this
    let lastLogIndex
    flowInstance.getThis(self.$route.params.fiid)
      .then(async function (response) {
        self.flowInstanceLog = await response.data.process_log
        let process = await _.find(response.data.processList, ['id', self.$route.params.pid])
        _.forEach(process.target, async function (item) {
          lastLogIndex = await _.findIndex(response.data.process_log, self.getLastLog(item.id))
          _.forEach(response.data.process_log[lastLogIndex].input, function (inputs) {
            if (inputs.Email === self.$route.params.mailid) {
              self.notes = inputs.Notes
            }
          })
        })
      })
      .catch(function (error) {
        self.$Notice.error({title: 'Error..!', desc: 'Something went wrong please try after some time.'})
        console.log('Error : ', error)
      })
  }
}
</script>
