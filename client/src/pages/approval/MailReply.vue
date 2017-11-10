<template>
<div style="background:#eee;padding: 20px">
  <Card :bordered="false">
      <p slot="title">Perform Action</p>
      <div v-html="viewTemplate"></div><br>
      <Button id="approve" type="primary" :loading="Aloading" v-on:click="handleApprove(true)">
          <span v-if="!Aloading">Approve</span>
          <span v-else>Updating...</span>
      </Button>
      <Button id="reject" type="error" :loading="Rloading" v-on:click="handleReject(true)">
          <span v-if="!Rloading">Reject</span>
          <span v-else>Updating...</span>
      </Button>
  </Card>
</div>
</template>
<script>
import flowInstance from '../../api/flowzinstance'
// import _ from 'lodash'
// import instanceTest from '../api/instance'
// import axios from 'axios'
export default {
  data () {
    return {
      viewTemplate: '',
      inputs: [],
      inputsId: '',
      Aloading: false,
      Rloading: false
    }
  },
  methods: {
    async handleApprove (action) {
      let self = this
      this.Aloading = true
      // let approvalLog = [
      //   {
      //     'process_id': this.$route.params.pid,
      //     'input': this.inputes,
      //     'status': 'approved',
      //     'approvedAt': Date()
      //   }
      // ]
      await flowInstance.getThis(this.$route.params.fiid)
        .then(function (response) {
          console.log('response.data', response.data)
          // for (let i = 0; i < response.data.approval_log.length; i++) {
          //   approvalLog.push(response.data.approval_log[i])
          // }
          // console.log(approvalLog)
          // for (let i = 0; i < response.data.processList.length; i++) {
          //   if (response.data.processList[i].id === self.$route.params.pid) {
          //     for (let j = 0; j < response.data.processList[i].properties.length; j++) {
          //       for (let k = 0; k < response.data.processList[i].properties[j].approvalClass.process.length; k++) {
          //         if (response.data.processList[i].properties[j].approvalClass.process[k].id === self.$route.params.aid) {
          //           flowInstance.patch(self.$route.params.fid, {'approval_log': approvalLog})
          //         }
          //       }
          //     }
          //   }
          // }
          self.Aloading = false
          self.$Notice.success({title: 'Approval confirmed...!'})
        })
        .catch(function (error) {
          self.$Notice.error({title: 'Error..!', desc: 'Action can not perform please try again...'})
          console.log('Error..!', error)
          self.Aloading = false
        })
      for (let item in this.inputs[0]) {
        let element = item.toLowerCase()
        this.inputs[0][item] = document.getElementsByName(element)[0].value
      }
      // await instanceTest.put(this.inputsId, { instanceid: this.$route.params.fid, processid: this.$route.params.pid, data: this.inputs[0] })
      //   .then(response => {
      //     console.log('response', response.data)
      //   })
      //   .catch(error => {
      //     console.log('Error', error)
      //     this.$Notice.error({title: 'Error!', desc: 'Worker has stopped working...'})
      //   })
    },
    async handleReject (action) {
      // let self = this
      this.Rloading = true
      // let approvalLog = [
      //   {
      //     'id': this.$route.params.aid,
      //     'fid': this.$route.params.fid,
      //     'process_id': this.$route.params.pid,
      //     'input': this.inputes,
      //     'status': 'rejected',
      //     'rejectedAt': Date()
      //   }
      // ]
      // await flowInstance.getThis(this.$route.params.fid)
      //   .then(function (response) {
      //     for (let i = 0; i < response.data.approval_log.length; i++) {
      //       approvalLog.push(response.data.approval_log[i])
      //     }
      //     for (let i = 0; i < response.data.processList.length; i++) {
      //       if (response.data.processList[i].id === self.$route.params.pid) {
      //         for (let j = 0; j < response.data.processList[i].properties.length; j++) {
      //           for (let k = 0; k < response.data.processList[i].properties[j].approvalClass.process.length; k++) {
      //             if (response.data.processList[i].properties[j].approvalClass.process[k].id === self.$route.params.aid) {
      //               flowInstance.patch(self.$route.params.fid, {'approval_log': approvalLog})
      //             }
      //           }
      //         }
      //       }
      //     }
      //     self.Rloading = false
      //     self.$Notice.success({title: 'Approval rejected...!'})
      //   })
      //   .catch(function (error) {
      //     self.$Notice.error({title: 'Error..!', desc: 'Action can not perform please try again...'})
      //     console.log('Error..!', error)
      //     self.Rloading = false
      //   })

      // for (let item in this.inputs[0]) {
      //   let element = item.toLowerCase()
      //   this.inputs[0][item] = document.getElementsByName(element)[0].value
      // }

      // await instanceTest.put(this.inputsId, { instanceid: this.$route.params.fid, processid: this.$route.params.pid, data: this.inputs[0] })
      //   .then(response => {
      //     console.log('response', response.data)
      //   })
      //   .catch(error => {
      //     console.log('Error', error)
      //     this.$Notice.error({title: 'Error!', desc: 'Worker has stopped working...'})
      //   })
    },
    getData () {
      // let self = this
      // instanceTest.get()
      //   .then(function (res) {
      //     for (let i = 0; i < res.data.data.length; i++) {
      //       if (res.data.data[i].instanceid === self.$route.params.fid && res.data.data[i].processid === self.$route.params.pid) {
      //         self.inputs.push(res.data.data[i].data)
      //         self.inputsId = res.data.data[i].id
      //         console.log('inputsId', self.inputsId)
      //         for (let item in res.data.data[i].data) {
      //           let element = item.toLowerCase()
      //           document.getElementsByName(element)[0].value = res.data.data[i].data[item]
      //         }
      //         break
      //       }
      //     }
      //   })
      //   .catch(function (err) {
      //     console.log('Error...!', err)
      //   })
    }
  },
  async mounted () {
    // let self = this
    // await flowInstance.getThis(this.$route.params.fid)
    //   .then(function (res) {
    //     for (let i = 0; i < res.data.processList.length; i++) {
    //       if (res.data.processList[i].id === self.$route.params.pid) {
    //         for (let j = 0; j < res.data.processList[i].properties.length; j++) {
    //           axios({
    //             method: 'get',
    //             url: res.data.processList[i].properties[j].entityschema.viewTemplate[0].url // add for loop if multiple view templates
    //           })
    //           .then(function (res) {
    //             self.viewTemplate = res.data
    //           })
    //         }
    //       }
    //     }
    //   })
    //   .catch(function (err) {
    //     console.log('Error...!', err)
    //   })
    // this.getData()
  }
}
</script>
