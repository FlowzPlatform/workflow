<template>
<div>
    <div v-html="html"></div>
    <Button type="primary" @click="handleSubmit('formSchemaInstance')">Submit</Button>
</div>
</template>

<script>
import Instance from '../api/instance'
import Schema from '../api/schema'
import _ from 'lodash'

export default {
  props: {
    html: {
      type: String
    },
    row: Object
  },
  data () {
    return {
      htmlTemplate: this.html,
      formSchemaInstance: {
        data: [],
        entity: []
      },
      schema: {},
      err: []
    }
  },
  created () {
    this.fetch(this.row.properties[0].entityschema._id)
    Schema.getThis(this.row.properties[0].entityschema._id).then((response) => {
      _.forEach(response.data.entity, function (result) {
        result.name = result.name.toLowerCase()

        document.getElementsByName(result.name)[0].value = result.property.defaultValue
        document.getElementsByName(result.name)[0].placeholder = result.property.placeholder
        document.getElementsByName(result.name)[1].style = 'color: red'
        if (document.getElementsByName(result.name)[0].type === 'select-one') {
          _.forEach(result.property.options, function (value, key) {
            let opt = document.createElement('option')
            opt.value = key
            opt.textContent = value
            document.getElementsByName(result.name)[0].appendChild(opt)
          })
        }
        if (result.type === 'date') {
          document.getElementsByName(result.name)[0].setAttribute('type', 'date')
        }
        if (result.property.optional === false) {
          document.getElementsByName(result.name)[0].setAttribute('required', '')
        }
        if (result.property.regEx !== '') {
          if (document.getElementsByName(result.name)[0].type === 'text' || document.getElementsByName(result.name)[0].type === 'number' || document.getElementsByName(result.name)[0].type === 'phone' || document.getElementsByName(result.name)[0].type === 'date' || document.getElementsByName(result.name)[0].type === 'dropdown') {
            document.getElementsByName(result.name)[0].setAttribute('pattern', result.property.regEx)
          }
        }
        if (document.getElementsByName(result.name)[0].type === 'checkbox' && result.property.defaultValue === 'true') {
          let chkbx = document.getElementsByName(result.name)
          _.forEach(chkbx, function (chk) {
            chk.checked = true
          })
        }
        if (document.getElementsByName(result.name)[0].type === 'radio' && result.property.defaultValue === '') {
          document.getElementsByName(result.name)[0].checked = true
        }
      })
    })
  },
  methods: {
    async fetch (id) {
      var response = await Schema.getThis(id)
      this.formSchemaInstance.data = []
      this.schema = response.data
      this.formSchemaInstance.entity = this.schema.entity
    },
    makeObj () {
      this.formSchemaInstance.data = []
      var obj = this.schema
      this.formSchemaInstance.data.push({ 'Schemaid': this.schema._id, 'database': this.schema.database })
      obj.data = this.formSchemaInstance.data
      return obj
    },
    async checkData () {
      this.err = []
      let err = this.err
      let self = this
      await Schema.getThis(this.row.properties[0].entityschema._id).then((response) => {
        _.forEach(response.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          let val
          let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
          let numberRegEx = '^[0-9]+$'
          let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
          if (document.getElementsByName(result.name)[0].type === 'select-one') {
            val = document.getElementsByName(result.name)[0].selectedIndex
          } else {
            val = document.getElementsByName(result.name)[0].value
          } // document.getElementsByName(result.name)[0].hasAttribute('required')
          // if (result.property.optional === false) {
          if (document.getElementsByName(result.name)[0].hasAttribute('required')) {
            if (val === '' || val === null || val === undefined) {
              err.push(result.name + ' - is required..!')
              document.getElementsByName(result.name)[1].innerHTML = 'Required field..!'
            } else {
              self.formSchemaInstance.data[0][result.name] = val
              document.getElementsByName(result.name)[1].innerHTML = ''
            }
            if (document.getElementsByName(result.name)[0].type === 'checkbox') {
              if (!document.getElementsByName(result.name)[0].checked) {
                err.push(result.name + ' - is required..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Required field..!'
              } else {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              }
            }
            if (document.getElementsByName(result.name)[0].type === 'radio') {
              if (!document.getElementsByName(result.name)[0].checked) {
                err.push(result.name + ' - is required..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Required field..!'
              } else {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              }
            }
            if (document.getElementsByName(result.name)[0].hasAttribute('pattern')) {
              let pttrn = new RegExp(result.property.regEx)
              let regEx = pttrn.test(val)
              if (!regEx) {
                err.push(result.name + ' - Enter proper format..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Enter valid format..!'
              } else {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              }
            }
            if (document.getElementsByName(result.name)[0].type === 'date') {
              let inputDate = new Date(val)
              if (result.property.maxdate !== '') {
                let maxDate = new Date(result.property.maxdate)
                if (inputDate > maxDate) {
                  err.push(result.name + ' - Enter minimum date then ' + maxDate)
                  document.getElementsByName(result.name)[1].innerHTML = 'Enter minimum date then ' + maxDate
                } else {
                  self.formSchemaInstance.data[0][result.name] = val
                  document.getElementsByName(result.name)[1].innerHTML = ''
                }
              } else if (result.property.mindate !== '') {
                let minDate = new Date(result.property.mindate)
                if (inputDate < minDate) {
                  err.push(result.name + ' - Enter maximum date then ' + minDate)
                  document.getElementsByName(result.name)[1].innerHTML = 'Enter maximum date then ' + minDate
                } else {
                  self.formSchemaInstance.data[0][result.name] = val
                  document.getElementsByName(result.name)[1].innerHTML = ''
                }
              }
            }
            if (result.property.min !== 0 || result.property.max !== 0) {
              if (val.length > result.property.min && val.length > result.property.max) {
                err.push(result.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
                document.getElementsByName(result.name)[1].innerHTML = 'Minimum length :' + result.property.min + ' Maximum length :' + result.property.max
              } else if (val.length > result.property.max && val.length < result.property.min) {
                err.push(result.name + ' - Minimum length :' + result.property.min + ' Maximum length :' + result.property.max)
                document.getElementsByName(result.name)[1].innerHTML = 'Minimum length :' + result.property.min + ' Maximum length :' + result.property.max
              } else {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              }
            }
            if (result.property.allowedValue.length > 0) {
              let check = _.includes(result.property.allowedValue, val)
              if (!check) {
                err.push(result.name, ' - Allowed value are', result.property.allowedValue)
                document.getElementsByName(result.name)[1].innerHTML = 'Allowed value are ' + result.property.allowedValue
              } else {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              }
            }
          }
          switch (document.getElementsByName(result.name)[0].type) {
            case 'email':
              let re = new RegExp(emailRegEx)
              let testEmail = re.test(val)
              if (testEmail) {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              } else {
                err.push(result.name + ' - Enter valid email address..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Enter valid email address..!'
              }
              break
            case 'number':
              re = new RegExp(numberRegEx)
              testEmail = re.test(val)
              if (testEmail) {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              } else {
                err.push(result.name + ' - Enter numbers only..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Enter numbers only..!'
              }
              break
            case 'date':
              re = new RegExp(dateRegEx)
              testEmail = re.test(val)
              if (testEmail) {
                self.formSchemaInstance.data[0][result.name] = val
                document.getElementsByName(result.name)[1].innerHTML = ''
              } else {
                err.push(result.name + ' - Invalid date format..!')
                document.getElementsByName(result.name)[1].innerHTML = 'Invalid date format..!'
              }
              break
          }
          console.log('self.formSchemaInstance.data', self.formSchemaInstance.data)
        })
      })
      if (err.length > 0) {
        return false
      } else {
        return true
      }
    },
    async handleSubmit (name) {
      let obj = await this.makeObj()
      let validate = await this.checkData()
      console.log('obj', obj)
      if (validate) {
        Instance.post({ instanceid: this.$route.params.id, processid: this.row.id, data: obj.data[0] })
          .then(response => {
            this.$Notice.success({title: 'success!', desc: 'Instance Saved...'})
          })
          .catch(error => {
            console.log('Error', error)
            this.$Notice.error({title: 'Error!', desc: 'Instance Not Saved...'})
          })
      }
    }
  }
}
</script>