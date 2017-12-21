<template>
<div style="background:#eee;padding:20px;margin:50px;">
  <Card :bordered="false">
      <p slot="title">Confirm Approval</p>
      <p slot="extra" v-show="notes">Notes : {{notes}}</p>
      <div v-html="viewTemplateHtml"></div>
      <ul class="error">
        <li v-for="item in err">{{item}}</li>
      </ul>
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
import config from '../../config'
import _ from 'lodash'
import axios from 'axios'
import $ from 'jquery'

export default {
  data () {
    return {
      Aloading: false,
      Rloading: false,
      notes: '',
      input: [],
      flowInstanceLog: [],
      viewTemplateHtml: '',
      process: '',
      err: []
    }
  },
  methods: {
    async handleApproval (action) {
      let self = this
      this.err = []
      let err = this.err
      let lastLogIndex
      let inputs = {}
      this.Aloading = true

      if (action === true) {
        for (var i = 0; i < self.process.inputProperty[0].entityschema.entity.length; i++) {
          let element = self.process.inputProperty[0].entityschema.entity[i].name
          $('input[name="' + element.toLowerCase() + '"]').each(async function () {
            if (self.process.inputProperty[0].entityschema.entity[i].property.optional === false) {
              // inputs[element] = await this.value
              let result = self.process.inputProperty[0].entityschema.entity[i].property
              let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
              let numberRegEx = '^[0-9]+$'
              let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
              let val = this.value
              if (val === '' || val === null || val === undefined) {
                err.push(element + ' - is required..!')
                // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> required..!</div>')
                // }
              } else {
                // $('input[name="' + element + '"]').parent().next('.validation').remove()
              }

              if (this.hasAttribute('pattern')) {
                let pttrn = new RegExp(result.regEx)
                let regEx = pttrn.test(val)
                if (!regEx) {
                  err.push(element + ' - Enter proper format..!')
                  // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                  //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Enter proper format..!</div>')
                  // }
                } else {
                  // obj[element] = val
                  // $('input[name="' + element + '"]').parent().next('.validation').remove()
                }
              }
              if (this.type === 'date') {
                let inputDate = new Date(val)
                if (result.maxdate !== '') {
                  let maxDate = new Date(result.maxdate)
                  if (inputDate > maxDate) {
                    err.push(element + ' - Enter minimum date then ' + maxDate)
                    // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                    //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + maxDate + '</div>')
                    // }
                  } else {
                    // obj[element] = val
                    // $('input[name="' + element + '"]').parent().next('.validation').remove()
                  }
                } else if (result.mindate !== '') {
                  let minDate = new Date(result.mindate)
                  if (inputDate < minDate) {
                    err.push(element + ' - Enter maximum date then ' + minDate)
                    // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                    //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + minDate + '</div>')
                    // }
                  } else {
                    // obj[element] = val
                    // $('input[name="' + element + '"]').parent().next('.validation').remove()
                  }
                }
              }
              if (result.min !== 0 || result.max !== 0) {
                if (val.length > result.min && val.length > result.max) {
                  err.push(element + ' - Minimum length :' + result.min + ' Maximum length :' + result.max)
                  // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                  //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.min + ' Maximum length :' + result.max + '</div>')
                  // }
                } else if (val.length > result.max && val.length < result.min) {
                  err.push(element + ' - Minimum length :' + result.min + ' Maximum length :' + result.max)
                  // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                  //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.min + ' Maximum length :' + result.max + '</div>')
                  // }
                } else {
                  // obj[element] = val
                  // $('input[name="' + element + '"]').parent().next('.validation').remove()
                }
              }
              if (result.allowedValue.length > 0) {
                let check = _.includes(result.allowedValue, val)
                if (!check) {
                  err.push(element + ' - Allowed value are' + result.allowedValue)
                  // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                  //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Allowed value are' + result.allowedValue + '</div>')
                  // }
                } else {
                  // obj[element] = val
                  // $('input[name="' + element + '"]').parent().next('.validation').remove()
                }
              }
              switch (this.type) {
                case 'email':
                  let re = new RegExp(emailRegEx)
                  let testEmail = re.test(val)
                  if (testEmail) {
                    inputs[element] = await val
                    // $('input[name="' + element + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element + ' - Enter valid email address..!')
                    // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                    //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Enter valid email address..!</div>')
                    // }
                  }
                  break
                case 'number':
                  re = new RegExp(numberRegEx)
                  testEmail = re.test(val)
                  if (testEmail) {
                    inputs[element] = await val
                    $('input[name="' + element + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element + ' - Enter numbers only..!')
                    // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                    //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Enter numbers only..!</div>')
                    // }
                  }
                  break
                case 'date':
                  re = new RegExp(dateRegEx)
                  testEmail = re.test(val)
                  if (testEmail) {
                    inputs[element] = await val
                    // $('input[name="' + element + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element + ' - Invalid date format..!')
                    // if ($('input[name="' + element + '"]').parent().next('.validation').length === 0) {
                    //   $('input[name="' + element + '"]').parent().after('<div class="validation" style="color:red;"> Invalid date format..!</div>')
                    // }
                  }
                  break
                default:
                  inputs[element] = await val
              }
            }
          })
        }
      }

      if (err.length > 0 && action === true) {
        self.$Notice.error({title: 'Error..!', desc: 'Fill all the details carefully.'})
        self.Aloading = false
      } else {
        self.input.inputs = inputs
        await flowInstance.getThis(self.$route.params.fiid)
          .then(async function (response) {
            // self.process = await _.find(response.data.processList, ['id', self.$route.params.pid])
            _.forEach(self.process.target, function (item) {
              lastLogIndex = _.findIndex(response.data.process_log, self.getLastLog(item.jobid))
              // response.data.process_log[lastLogIndex].status = 'inputRequired'
              _.forEach(response.data.process_log[lastLogIndex].input, function (inputs) {
                if (inputs.Email === self.$route.params.mailid) {
                  inputs.Approved = action
                }
              })
            })

            await self.addToJobQue()
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
      }
    },
    async addToJobQue () {
      let self = this
      let lastLog = await self.getLastLog(self.$route.params.jobid)
      if (lastLog !== undefined && lastLog.status === 'sendForApproval') {
        let dataObject = await {
          'fId': self.$route.params.fiid,
          'input': self.input,
          'isExternalInput': true,
          'job': lastLog.job,
          'jobId': lastLog.jobId
        }
        let uri = await config.serverURI + '/addInputToJobQue'
        axios.post(uri, dataObject)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
      }
    },
    getLastLog (item) {
      return _.chain(this.flowInstanceLog).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.jobId === item }).value()
    },
    fillForm (log) {
      for (var i = 0; i < this.process.inputProperty[0].entityschema.entity.length; i++) {
        let element = this.process.inputProperty[0].entityschema.entity[i].name
        let result = this.process.inputProperty[0].entityschema.entity[i].property
        $('input[name="' + element.toLowerCase() + '"]').each(function () {
          if (log.input[0][element] !== undefined) {
            this.value = log.input[0][element]
          }
          if (result.type === 'date') {
            this.setAttribute('type', 'date')
          }
          if (result.regEx !== '') {
            if (this.type === 'text' || this.type === 'number' || this.type === 'phone' || this.type === 'date' || this.type === 'select-one') {
              this.setAttribute('pattern', result.property.regEx)
            }
          }
        })
      }
    }
  },
  async mounted () {
    let self = this
    let lastLogIndex, viewTemplateUrl, processLog

    await flowInstance.getThis(self.$route.params.fiid)
      .then(async function (response) {
        self.flowInstanceLog = await response.data.process_log
        self.process = await _.find(response.data.processList, ['id', self.$route.params.pid])
        processLog = await self.getLastLog(self.$route.params.jobid)
        _.forEach(self.process.target, async function (item) {
          lastLogIndex = await _.findIndex(response.data.process_log, self.getLastLog(item.id))
          _.forEach(response.data.process_log[lastLogIndex].input, function (inputs) {
            if (inputs.Email === self.$route.params.mailid) {
              self.notes = inputs.Notes
            }
          })
        })
        viewTemplateUrl = _.find(self.process.inputProperty[0].entityschema.viewTemplate, ['filename', self.process.inputProperty[0].viewTemplate])
        viewTemplateUrl = viewTemplateUrl.url
        console.log('viewTemplateUrl', viewTemplateUrl)
        await axios({
          method: 'get',
          url: viewTemplateUrl
        })
        .then(async function (res) {
          self.viewTemplateHtml = res.data
          self.viewTemplateHtml = await self.viewTemplateHtml.split('./assets/main.css').join('')
        })
      })
      .catch(function (error) {
        self.$Notice.error({title: 'Error..!', desc: 'Something went wrong please try after some time.'})
        console.log('Error : ', error)
      })
    this.fillForm(processLog)
  }
}
</script>
<style scoped>
.error {
  color: red;
}
</style>
