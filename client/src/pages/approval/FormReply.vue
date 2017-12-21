<template>
<div style="background:#eee;padding: 20px">
  <Card :bordered="false">
    <p slot="title">Make Request</p>
    <p slot="extra" v-show="notes">Notes : {{ notes }}</p>
    <iframe id="filecontainer" allowtransparency="true" frameborder="0" @load="iframeload()" :src="html"></iframe>
    <!--  + this.$route.params.fiid + '&&pid=' + this.$route.params.pid + '' -->
    <ul class="error">
      <li v-for="item in err">{{item}}</li>
    </ul>
  </Card>
</div>
</template>
<script>
import flowInstance from '@/api/flowzinstance'
import _ from 'lodash'
import Schema from '@/api/schema'
import ReceiveForm from '@/api/receiveform'
import $ from 'jquery'

export default {
  data () {
    return {
      Aloading: false,
      notes: '',
      input: [],
      selectedProcess: {},
      entitySchema: [],
      URL: '',
      err: [],
      log: {}
    }
  },
  asyncComputed: {
    async html () {
      if (this.selectedProcess.inputProperty) {
        let index = await _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', this.selectedProcess.inputProperty[0].createTemplate])
        var url = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index].url
        url = url.substr(0, 4) + url.substr(5)
        return url
      }
    }
  },
  methods: {
    async iframeload () {
      let self = this
      let array = []
      let data = []
      await flowInstance.getThis(self.$route.params.fiid)
      .then(async function (response) {
        self.selectedProcess = await _.find(response.data.processList, ['id', self.$route.params.pid])
        await Schema.getThis(self.selectedProcess.inputProperty[0].entityschema._id).then((res) => {
          self.entitySchema = res.data
        })
        self.log = await _.chain(response.data.process_log).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === self.$route.params.pid }).value()
      })
      .catch(function (error) {
        self.$Notice.error({title: 'Error..!', desc: error})
      })
      _.forEach(self.entitySchema.entity, function (value) {
        array.push({name: value.name})
      })
      _.forEach(self.log.input, function (item) {
        data.push(item)
      })
      document.getElementById('filecontainer').contentWindow.postMessage({entity: array, formData: data}, '*')
    },
    async handleSubmit () {
      let dataObject = {
        'fId': this.$route.params.fiid,
        'inputs': this.input,
        'job': this.$route.params.pid
      }
      ReceiveForm.post(dataObject)
      .then(response => {
        this.$Notice.success({title: 'Success..!', desc: 'Form request sent.'})
        console.log('res', response.data)
      })
      .catch(err => {
        this.$Notice.success({title: 'Error..!', desc: err})
        console.log('err', err)
      })
    }
  },
  async mounted () {
    let val
    let temp = {}
    this.err = []
    let self = this
    this.input = []
    let err = this.err
    let finalInputs = this.input

    window.addEventListener('message', function (event) {
      console.log(event)
      if (_.isArray(event.data)) {
        for (let j = 0; j < event.data.length; j++) {
          console.log('event', event.data[j])
          Object.keys(event.data[j]).forEach(function (key) {
            for (let i = 0; i < self.entitySchema.entity.length; i++) {
              let result = self.entitySchema.entity[i]
              let element = {value: event.data[j][key], name: key, type: result.type}
              console.log('Elements', element)
              let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
              let numberRegEx = '^[0-9]+$'
              let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
              val = element.value
              if (result.property.optional === false) {
                if (val === '' || val === null || val === undefined) {
                  err.push(element.name + ' - is required..!')
                  if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                    $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> required..!</div>')
                  }
                } else {
                  $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                }

                if (result.property.regEx !== null || result.property.regEx !== undefined) {
                  let pttrn = new RegExp(result.property.regEx)
                  let regEx = pttrn.test(val)
                  if (!regEx) {
                    err.push(element.name + ' - Enter proper format..!')
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter proper format..!</div>')
                    }
                  } else {
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  }
                }
                if (element.type === 'date') {
                  let inputDate = new Date(val)
                  if (result.property.maxdate !== '') {
                    let maxDate = new Date(result.property.maxdate)
                    if (inputDate > maxDate) {
                      err.push(element.name + ' - Enter minimum date then ' + maxDate)
                      if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                        $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + maxDate + '</div>')
                      }
                    } else {
                      $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                    }
                  } else if (result.property.mindate !== '') {
                    let minDate = new Date(result.property.mindate)
                    if (inputDate < minDate) {
                      err.push(element.name + ' - Enter maximum date then ' + minDate)
                      if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                        $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter minimum date then ' + minDate + '</div>')
                      }
                    } else {
                      $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                    }
                  }
                }
                if (result.property.min !== 0 || result.property.max !== 0) {
                  if (val.length > result.property.min && val.length > result.property.max) {
                    err.push(element.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.property.min + ' Maximum length :' + result.property.max + '</div>')
                    }
                  } else if (val.length > result.property.max && val.length < result.property.min) {
                    err.push(element.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Minimum length :' + result.property.min + ' Maximum length :' + result.property.max + '</div>')
                    }
                  } else {
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  }
                }
                if (result.property.allowedValue.length > 0) {
                  let check = _.includes(result.property.allowedValue, val)
                  if (!check) {
                    err.push(element.name + ' - Allowed value are' + result.property.allowedValue)
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Allowed value are' + result.property.allowedValue + '</div>')
                    }
                  } else {
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  }
                }
              }
              switch (element.type) {
                case 'email':
                  let re = new RegExp(emailRegEx)
                  let testEmail = re.test(val)
                  if (testEmail) {
                    temp[element.name] = val
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element.name + ' - Enter valid email address..!')
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter valid email address..!</div>')
                    }
                  }
                  break
                case 'number':
                  re = new RegExp(numberRegEx)
                  testEmail = re.test(val)
                  if (testEmail) {
                    temp[element.name] = val
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element.name + ' - Enter numbers only..!')
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter numbers only..!</div>')
                    }
                  }
                  break
                case 'date':
                  re = new RegExp(dateRegEx)
                  testEmail = re.test(val)
                  if (testEmail) {
                    temp[element.name] = val
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element.name + ' - Invalid date format..!')
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Invalid date format..!</div>')
                    }
                  }
                  break
                default:
                  temp[element.name] = val
              }
              // }
            }
          })
          // temp.Schemaid = self.entitySchema.id
          temp.type = 'ReceiveForm'
          finalInputs.push(temp)
          temp = {}
        }
        self.handleSubmit()
      }
    })
  }
}
</script>
<style scoped>
.error {
  color: red;
}
iframe {
    min-height: 460px;
    width: 100%;
    background: #FFFFFF;
    padding: 0px;
}
</style>
