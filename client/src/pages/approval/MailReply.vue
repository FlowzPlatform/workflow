<template>
<div style="background:#eee;padding:20px;margin:50px;">
  <Card :bordered="false">
      <p slot="title">Appraval Action</p>
      <p slot="extra" v-show="notes">Notes : {{notes}}</p>
			<div v-html="viewTemplateHtml"></div>
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
import axios from 'axios'
import $ from 'jquery'

export default {
  data () {
    return {
      Aloading: false,
      Rloading: false,
      notes: '',
      flowInstanceLog: [],
      viewTemplateHtml: ''
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
    let lastLogIndex, viewTemplateUrl

    flowInstance.getThis(self.$route.params.fiid)
      .then(async function (response) {
        self.flowInstanceLog = await response.data.process_log
        let process = await _.find(response.data.processList, ['id', self.$route.params.pid])
        let processLog = await self.getLastLog(self.$route.params.pid)
        _.forEach(process.target, async function (item) {
          lastLogIndex = await _.findIndex(response.data.process_log, self.getLastLog(item.id))
          _.forEach(response.data.process_log[lastLogIndex].input, function (inputs) {
            if (inputs.Email === self.$route.params.mailid) {
              self.notes = inputs.Notes
            }
          })
        })
        viewTemplateUrl = _.find(process.inputProperty[0].entityschema.viewTemplate, ['filename', process.inputProperty[0].viewTemplate])
        viewTemplateUrl = viewTemplateUrl.url
        await axios({
          method: 'get',
          url: viewTemplateUrl
        })
        .then(async function (res) {
          self.viewTemplateHtml = res.data
          self.viewTemplateHtml = await self.viewTemplateHtml.split('./assets/main.css').join('')
          console.log(self.viewTemplateHtml)
          for (var i = 0; i < process.inputProperty[0].entityschema.entity.length; i++) {
            let element = process.inputProperty[0].entityschema.entity[i].name
            console.log('-1->', element)
            // element = element.toLowerCase()
            // element = _.capitalize(element)
            console.log('0000', document.getElementsByName(element.toLowerCase())[0])
            console.log('1111', processLog.input[0][_.capitalize(element)])
            document.getElementsByName(element.toLowerCase())[0].val = 'hello'
            // console.log('2222', $('input[name="' + element.toLowerCase() + '"]').val())
            $('input[name="' + element.toLowerCase() + '"]').each(function () {
              console.log('-2->', this)
              // this.val = processLog.input[0][element]
            })
          }
        })
      })
      .catch(function (error) {
        self.$Notice.error({title: 'Error..!', desc: 'Something went wrong please try after some time.'})
        console.log('Error : ', error)
      })
  }
}
</script>
