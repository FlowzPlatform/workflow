<template>
<div style="background:#eee;padding: 20px">
  <Card :bordered="false">
    <p slot="title">Make Request</p>
    <p slot="extra" v-show="notes">Notes : {{ notes }}</p>
    <div v-if="isdefault">
      <schema-instance :id="entitySchema.id" :processid="$route.params.pid" :instanceid="$route.params.fiid" :lastLog="log"></schema-instance>
    </div>
    <div v-else >
      <iframe id="filecontainer" allowtransparency="true" frameborder="0" @load="iframeload()" :src="html"></iframe>
    </div>
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
import SchemaInstance from '../../components/SchemaInstance.vue'

export default {
  components: {'schema-instance': SchemaInstance},
  data () {
    return {
      Aloading: false,
      notes: '',
      input: [],
      selectedProcess: {},
      entitySchema: [],
      customSchema: [],
      URL: '',
      err: [],
      log: {},
      isdefault: false
    }
  },
  computed: {
    html () {
      if (this.selectedProcess.inputProperty) {
        let index = _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', this.selectedProcess.inputProperty[0].createTemplate])
        // console.log('index', index)
        let url = ''
        if (index === -1) {
          url = this.selectedProcess.inputProperty[0].entityschema.createTemplate[index].url
          url = url.substr(0, 4) + url.substr(5)
        }
        return url
      }
    }
  },
  methods: {
    async iframeload () {
      // alert('1')
      let self = this
      let array = []
      let data = []
      let custom = []
      let customSchema = []

      await flowInstance.getThis(self.$route.params.fiid)
      .then(async function (response) {
        // console.log('self.selectedProcess.inputProperty[0].entityschema', self.selectedProcess.inputProperty[0].entityschema)
        // self.selectedProcess = await _.find(response.data.processList, ['id', self.$route.params.pid])
        // self.entitySchema = await self.getSchema(self.selectedProcess.inputProperty[0].entityschema.id)
        // console.log('response.data.process_log', response.data.process_log)
        self.log = await _.chain(response.data.process_log).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === self.$route.params.pid }).value()
      })
      .catch(function (error) {
        self.$Notice.error({title: 'Error..!', desc: error})
      })
      for (let i = 0; i < self.entitySchema.entity.length; i++) {
        if (self.entitySchema.entity[i].customtype === true) {
          custom = await self.getCustom(self.entitySchema.entity[i].type, true)
          array.push({customtype: true, name: self.entitySchema.entity[i].name, entity: custom})
          custom = await self.getCustom(self.entitySchema.entity[i].type, false)
          customSchema.push(custom)
        } else {
          array.push({name: self.entitySchema.entity[i].name})
          customSchema.push(self.entitySchema.entity[i])
        }
      }
      _.forEach(self.log.input, function (item) {
        data.push(item)
      })
      self.customSchema = customSchema
      document.getElementById('filecontainer').contentWindow.postMessage({entity: array, formData: data}, '*')
    },
    async getCustom (id, flag) {
      let tempSchema
      let tempData = []
      let customData = []
      let data = []
      let self = this
      tempSchema = await self.getSchema(id)
      for (let i = 0; i < tempSchema.entity.length; i++) {
        if (tempSchema.entity[i].customtype === true) {
          tempData = await self.getCustom(tempSchema.entity[i].type, true)
          data.push({customtype: true, name: tempSchema.entity[i].name, entity: tempData})
          tempData = await self.getCustom(tempSchema.entity[i].type, false)
          customData.push(tempData)
        } else {
          data.push({name: tempSchema.entity[i].name})
          customData.push(tempSchema.entity[i])
        }
      }
      return flag ? data : customData
    },
    async getSchema (id) {
      let data
      await Schema.getThis(id).then((res) => {
        data = res.data
      })
      return data
    },
    async handleSubmit (validated) {
      let dataObject = {
        'fId': this.$route.params.fiid,
        'inputs': this.input,
        'job': this.$route.params.pid
      }
      console.log(validated, this.input.length)
      if (validated && this.input.length > 0) {
        ReceiveForm.post(dataObject)
        .then(response => {
          this.$Notice.success({title: 'Success..!', desc: 'Form request sent.'})
          this.$router.push('/')
        })
        .catch(err => {
          this.$Notice.success({title: 'Error..!', desc: err})
        })
      } else {
        this.$Notice.error({
          title: 'Error..!',
          desc: 'Details are in bottom of page.'
        })
        this.input = []
      }
    }, // method for validation purpos
    async getValidate (event, schema) {
      let self = this
      let err = this.err
      let val, result, element, newSchema
      schema === undefined ? newSchema = self.customSchema : newSchema = schema
      let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
      let numberRegEx = '^[0-9]+$'
      let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
      await Object.keys(event).forEach(async function (key, index) {
        for (var i = 0; i < newSchema.length; i++) {
          if (key === newSchema[i].name || Array.isArray(newSchema[i])) {
            val = event[key]
            result = newSchema[i]
            element = {value: event[key], name: key, type: Array.isArray(event[key]) ? 'customtype' : newSchema[i].type}
            if (element.type === 'customtype') {
              self.getValidate(event[key][0], newSchema[i])
            } else {
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
                    // temp[element.name] = val
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
                    // temp[element.name] = val
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
                    // temp[element.name] = val
                    $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                  } else {
                    err.push(element.name + ' - Invalid date format..!')
                    if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                      $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Invalid date format..!</div>')
                    }
                  }
                  break
                default:
                  console.log(element.name, ': ', val)
              }
            }
          }
        }
      })
      if (err.length > 0) { return false } else { return true }
    },
    async init (fid) {
      let self = this
      let response = await flowInstance.getThis(fid)
      .then(function (response) {
        // self.selectedProcess = _.find(response.data.processList, ['id', self.$route.params.pid])
        // console.log('self.selectedProcess.inputProperty[0].entityschema', self.selectedProcess.inputProperty[0].entityschema)
        // self.entitySchema = self.getSchema(self.selectedProcess.inputProperty[0].entityschema._id)
        // console.log('this.selectedProcess.inputProperty[0].entityschema.createTemplate', self.selectedProcess.inputProperty[0].entityschema.createTemplate, self.selectedProcess.inputProperty[0].entityschema.createTemplate.length)
        // self.log = await _.chain(response.data.process_log).orderBy(['lastModified'], ['asc']).findLast((f) => { return f.job === self.$route.params.pid }).value()
        return response
      })
      .catch(function (error) {
        console.log('Error', error)
        self.$Notice.error({title: 'Error..!', desc: error})
        return []
      })
      self.selectedProcess = _.find(response.data.processList, ['id', self.$route.params.pid])
      // console.log('self.selectedProcess', self.selectedProcess)
      // console.log('self.log', self.log)
      self.entitySchema = await self.getSchema(self.selectedProcess.inputProperty[0].entityschema.id)
      // console.log('Schema', self.entitySchema)
      // console.log('createTemplate length', self.selectedProcess.inputProperty[0].entityschema.createTemplate, self.selectedProcess.inputProperty[0].entityschema.createTemplate.length)
      let index = _.findIndex(this.selectedProcess.inputProperty[0].entityschema.createTemplate, ['filename', self.selectedProcess.inputProperty[0].createTemplate])
      // console.log('index................', index)
      if (index < 0) {
        this.isdefault = true
      }
    }
  },
  async mounted () {
    let self = this
    let validated
    this.init(self.$route.params.fiid)
    window.addEventListener('message', async function (event) {
      self.err = []
      if (_.isArray(event.data)) {
        for (let j = 0; j < event.data.length; j++) {
          validated = await self.getValidate(event.data[j])
          self.input.push(event.data[j])
        }
        self.handleSubmit(validated)
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
