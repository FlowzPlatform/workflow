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
import $ from 'jquery'

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
      entitySchema: {},
      customEntity: {'entity': []},
      formSchemaInstance: {
        data: [],
        entity: []
      },
      schema: {},
      err: []
    }
  },
  async created () {
    // let self = this
    this.fetch(this.row.inputProperty[0].entityschema._id)
    Schema.getThis(this.row.inputProperty[0].entityschema._id).then((response) => {
      this.entitySchema = response
      _.forEach(response.data.entity, function (result) {
        result.name = result.name.toLowerCase()
        $('input#custom_input').each(function () {
          let element = this
          if (result.name === element.name.slice(0, result.name.length)) {
            if (result.property.placeholder !== undefined && result.property.placeholder !== '') {
              element.placeholder = result.property.placeholder
            }
            if (result.property.defaultValue !== undefined && result.property.defaultValue !== '') {
              element.value = result.property.defaultValue
            }

            if (result.type === 'date') {
              element.setAttribute('type', 'date')
            }

            if (result.property.optional === false) {
              element.setAttribute('required', '')
            }

            if (result.property.regEx !== '') {
              if (element.type === 'text' || element.type === 'number' || element.type === 'phone' || element.type === 'date' || element.type === 'select-one') {
                element.setAttribute('pattern', result.property.regEx)
              }
            }
          }
        })
        $('select#select1').each(function () {
          let element = this
          if (result.name === element.name.slice(0, result.name.length)) {
            if (result.property.optional === false) {
              element.setAttribute('required', '')
            }
            if (element.type === 'select-one') {
              _.forEach(result.property.options, function (value, key) {
                let opt = document.createElement('option')
                opt.value = key
                opt.textContent = value
                element.appendChild(opt)
              })
            }
          }
        })
        // if (result.type.length > 30) {
        //   Schema.getThis(result.type).then((res) => {
        //     _.forEach(res.data.entity, function (rslt) {
        //       self.customEntity.entity.push(rslt)
        //     })
        //   })
        // }
      })
      // _.forEach(self.customEntity.entity, function (result) {
      //   console.log('---->>', self.customEntity.entity)
      //   result.name = result.name.toLowerCase()
      //   console.log('property', result.property)
      //   $('input#custom_input').each(function () {
      //     let element = this
      //     if (result.name === element.name.slice(0, result.name.length)) {
      //       if (result.property.placeholder !== undefined && result.property.placeholder !== '') {
      //         element.placeholder = result.property.placeholder
      //       }
      //       if (result.property.defaultValue !== undefined && result.property.defaultValue !== '') {
      //         element.value = result.property.defaultValue
      //       }

      //       if (result.type === 'date') {
      //         element.setAttribute('type', 'date')
      //       }

      //       if (result.property.optional === false) {
      //         element.setAttribute('required', '')
      //       }

      //       if (result.property.regEx !== '') {
      //         if (element.type === 'text' || element.type === 'number' || element.type === 'phone' || element.type === 'date' || element.type === 'select-one') {
      //           element.setAttribute('pattern', result.property.regEx)
      //         }
      //       }
      //     }
      //   })
      //   $('select#select1').each(function () {
      //     let element = this
      //     if (result.name === element.name.slice(0, result.name.length)) {
      //       if (result.property.optional === false) {
      //         element.setAttribute('required', '')
      //       }
      //       if (element.type === 'select-one') {
      //         _.forEach(result.property.options, function (value, key) {
      //           let opt = document.createElement('option')
      //           opt.value = key
      //           opt.textContent = value
      //           element.appendChild(opt)
      //         })
      //       }
      //     }
      //   })
      // })
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
      this.formSchemaInstance.data.push({ 'schemaid': this.schema._id, 'database': this.schema.database })
      obj.data = this.formSchemaInstance.data
      return obj
    },
    async checkData () {
      this.err = []
      let err = this.err
      let self = this
      let val
      let obj = {}

      $('input#custom_input').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            let emailRegEx = '(\\w+)\\@(\\w+)\\.[a-zA-Z]'
            let numberRegEx = '^[0-9]+$'
            let dateRegEx = '(0?[1-9]|[12]\\d|30|31)[^\\w\\d\\r\\n:](0?[1-9]|1[0-2])[^\\w\\d\\r\\n:](\\d{4}|\\d{2})'
            val = element.value
            // document.getElementsByName(element.name)[0].hasAttribute('required') result.property.optional === false
            if (result.property.optional === false) {
            // if (element.hasAttribute('required')) {
              if (val === '' || val === null || val === undefined) {
                err.push(element.name + ' - is required..!')
                if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                  $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> required..!</div>')
                }
              } else {
                // obj[element.name] = val
                // self.formSchemaInstance.data[0][element.name] = val
                $('input[name="' + element.name + '"]').parent().next('.validation').remove()
              }

              if (element.hasAttribute('pattern')) {
                let pttrn = new RegExp(result.property.regEx)
                let regEx = pttrn.test(val)
                if (!regEx) {
                  err.push(element.name + ' - Enter proper format..!')
                  if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                    $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Enter proper format..!</div>')
                  }
                } else {
                  // obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
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
                    // obj[element.name] = val
                    // self.formSchemaInstance.data[0][element.name] = val
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
                    // obj[element.name] = val
                    // self.formSchemaInstance.data[0][element.name] = val
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
                  // obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
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
                  // obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
                  $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                }
              }
            }
            switch (element.type) {
              case 'email':
                let re = new RegExp(emailRegEx)
                let testEmail = re.test(val)
                if (testEmail) {
                  obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
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
                  obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
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
                  obj[element.name] = val
                  // self.formSchemaInstance.data[0][element.name] = val
                  $('input[name="' + element.name + '"]').parent().next('.validation').remove()
                } else {
                  err.push(element.name + ' - Invalid date format..!')
                  if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                    $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> Invalid date format..!</div>')
                  }
                }
                break
              default:
                obj[element.name] = val
                // self.formSchemaInstance.data[0][element.name] = val
            }
          }
        })
      })
      $('input#radio1').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            $('#' + element.id).attr('required', '')
          }
        })
      })
      $('input#checkbox1').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            $('#' + element.id).attr('required', '')
          }
        })
      })
      $('input#radio1').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            if (element.hasAttribute('required')) {
              if ($('input[name="' + element.name + '"]:checked').length < 1) {
                err.push(element.name + ' - is required..!')
                if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                  $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;">' + result.name + ' required..!</div>')
                }
              } else {
                let myRadio = $('input[name="' + element.name + '"]')
                let checkedValue = myRadio.filter(':checked').val()
                obj[element.name] = checkedValue
                // self.formSchemaInstance.data[0][element.name] = val
                $('input[name="' + element.name + '"]').parent().next('.validation').remove()
              }
            } else {
              let myRadio = $('input[name="' + element.name + '"]')
              let checkedValue = myRadio.filter(':checked').val()
              obj[element.name] = checkedValue
            }
          }
        })
      })
      $('input#checkbox1').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            if (element.hasAttribute('required')) {
              if ($('input[name="' + element.name + '"]:checked').length < 1) {
                err.push(element.name + ' - is required..!')
                if ($('input[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                  $('input[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;">' + result.name + ' required..!</div>')
                }
              } else {
                let checkedVal = []
                $('input[name="' + element.name + '"]:checked').each(function () {
                  checkedVal.push(this.value)
                })
                obj[element.name] = checkedVal
                // self.formSchemaInstance.data[0][element.name] = val
                $('input[name="' + element.name + '"]').parent().next('.validation').remove()
              }
            } else {
              let checkedVal = []
              $('input[name="' + element.name + '"]:checked').each(function () {
                checkedVal.push(this.value)
              })
              obj[element.name] = checkedVal
              // self.formSchemaInstance.data[0][element.name] = val
            }
          }
        })
      })
      $('select#select1').each(function () {
        let element = this
        _.forEach(self.entitySchema.data.entity, function (result) {
          result.name = result.name.toLowerCase()
          if (result.name === element.name.slice(0, result.name.length)) {
            let tag = element.selectedIndex
            let options = element.options
            val = options[tag].text
            if (result.property.optional === false) {
              if (val === 'Please Select' || val === null || val === undefined || val === '') {
                err.push(element.name + ' - is required..!')
                if ($('select[name="' + element.name + '"]').parent().next('.validation').length === 0) {
                  $('select[name="' + element.name + '"]').parent().after('<div class="validation" style="color:red;"> required..!</div>')
                }
              } else {
                obj[element.name] = val
                // self.formSchemaInstance.data[0][element.name] = val
                $('select[name="' + element.name + '"]').parent().next('.validation').remove()
              }
            }
          }
        })
      })
      if (err.length > 0) {
        return false
      } else {
        let keys = []
        _.forEach(Object.keys(obj), function (key) {
          keys.push(key.charAt(key.length - 2))
        })
        let position = Math.max(...keys)
        _.forEach(obj, function (value, key) {
          if (position === 0) {
            self.formSchemaInstance.data[0][key.slice(0, key.length - 3)] = value
          } else {
            let index = key.charAt(key.length - 2)
            if (self.formSchemaInstance.data[index]) {
              self.formSchemaInstance.data[index][key.slice(0, key.length - 3)] = value
            } else {
              self.formSchemaInstance.data.push({'schemaid': self.schema._id, 'database': self.schema.database, [key.slice(0, key.length - 3)]: value})
            }
          }
        })
        return true
      }
    },
    async handleSubmit (name) {
      let obj = await this.makeObj()
      let validate = await this.checkData()
      console.log('validated data', validate)
      if (validate) {
        console.log('Submitted Data', obj)
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