<template>
  <Tabs type="card">
      <TabPane label="Properties">
        <FormItem label="No of retries">
          <Input v-model="proccessdata[propertyIndex].property.noofretrieve" placeholder="Please enter no of retries"></Input>
        </FormItem>
        <FormItem label="Wait (InHours)">
          <Input v-model="proccessdata[propertyIndex].property.wait" placeholder="Please enter wait (InHours)"></Input>
        </FormItem>
        <FormItem label="Default Action" style="width:400px">
            <Select v-model="proccessdata[propertyIndex].property.defaultaction" placeholder="Select action name">
                <Option value="Pass">Pass</Option>
                <Option value="Fail">Fail</Option>
                <Option value="Continue">Continue</Option>
            </Select>
        </FormItem>
        <Collapse accordion>
          <Panel name="1-1">
          Times
          <div slot="content">
            <Row :gutter="16">
                <Col span="8">
                    <div>Days</div>
                </Col>
                <Col span="8">
                    <div>In-Time</div>
                </Col>
                <Col span="8">
                    <div>Out-Time</div>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox v-model="sunday">Sunday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="sundayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="sundayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="monday">Monday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--"  style="width: 168px" v-model="mondayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--"  style="width: 168px" v-model="mondayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="tuesday">Tuesday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="tuesdayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="tuesdayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="wednesday">Wednesday</Checkbox>
                </Col>
                <Col span="8">
                </Col>
                <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" name=">wednesdayintime"></TimePicker>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" name="wednesdayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="thursday">Thursday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="thursdayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="thursdayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="friday">Friday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="fridayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="fridayouttime"></TimePicker>
                </Col>
            </Row>
            <Row :gutter="16">
                <Col span="8">
                    <Checkbox  v-model="saturday">Saturday</Checkbox>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="saturdayintime"></TimePicker>
                </Col>
                <Col span="8">
                    <TimePicker type="time" format="HH:mm" placeholder="--:--" style="width: 168px" v-model="saturdayouttime"></TimePicker>
                </Col>
            </Row>
          </div>
          </Panel>
          <Panel name="1-2">
          Approve Label
            <div slot="content">
              <FormItem label="Action">
                <Input v-model="proccessdata[propertyIndex].property.approveLabel.action" placeholder="Approve"></Input>
              </FormItem>
              <FormItem label="Status">
                <Input v-model="proccessdata[propertyIndex].property.approveLabel.status" placeholder="Approved"></Input>
              </FormItem>
            </div>
          </Panel>
          <Panel name="1-3">
          Reject Label
            <div slot="content">
              <FormItem label="Action">
                <Input v-model="proccessdata[propertyIndex].property.rejectLabel.action" placeholder="Reject"></Input>
              </FormItem>
              <FormItem label="Status">
                <Input v-model="proccessdata[propertyIndex].property.rejectLabel.status" placeholder="Rejected"></Input>
              </FormItem>
            </div>
          </Panel>
        </Collapse>
      </TabPane>
      <TabPane label="Manage">
        <FormItem label="Class name">
            <Select v-model="proccessdata[propertyIndex].property.manageemail" placeholder="Select class name" style="width:400px">
                <Option value="Server down">Server down</Option>
                <Option value="Email not found">Email not found</Option>
                <Option value="Time out">Time out</Option>
                <Option value="Fatal error">Fatal error</Option>
            </Select>
        </FormItem>
      </TabPane>
  </Tabs>
</template>

<script>
  import moment from 'moment'
  // let processObj = {
  //   email: '',
  //   index: 1,
  //   property: {
  //     approveLabel: {
  //       action: '',
  //       status: ''
  //     },
  //     availableonweek: {
  //       monday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       tuesday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       wednesday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       thursday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       friday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       saturday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       },
  //       sunday: {
  //         available: false,
  //         intime: '',
  //         outtime: ''
  //       }
  //     },
  //     defaultaction: '',
  //     manageemail: '',
  //     noofretrieve: 0,
  //     rejectLabel: {
  //       action: '',
  //       status: ''
  //     },
  //     wait: ''
  //   },
  //   role: ''
  // }
  // let processdataSchema = [
  //   processObj
  // ]

  export default {
    name: 'propertyManage',
    props: [
      'propertymanage',
      'proccessmanage'
    ],
    data () {
      return {
        proccessdata: [
          {
            email: '',
            index: 1,
            property: {
              approveLabel: {
                action: '',
                status: ''
              },
              availableonweek: {
                monday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                tuesday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                wednesday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                thursday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                friday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                saturday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                sunday: {
                  available: false,
                  intime: '',
                  outtime: ''
                }
              },
              defaultaction: '',
              manageemail: '',
              noofretrieve: 0,
              rejectLabel: {
                action: '',
                status: ''
              },
              wait: ''
            },
            role: ''
          }
        ],
        modelindex: 0
      }
    },
    watch: {
      propertyIndex: function (val) {
        var keyexists = this.key_exists(val, this.proccessdata)
        if (keyexists === false) {
          let propertyObj = {
            email: '',
            index: 1,
            property: {
              approveLabel: {
                action: '',
                status: ''
              },
              availableonweek: {
                monday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                tuesday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                wednesday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                thursday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                friday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                saturday: {
                  available: false,
                  intime: '',
                  outtime: ''
                },
                sunday: {
                  available: false,
                  intime: '',
                  outtime: ''
                }
              },
              defaultaction: '',
              manageemail: '',
              noofretrieve: 0,
              rejectLabel: {
                action: '',
                status: ''
              },
              wait: ''
            },
            role: ''
          }
          this.proccessdata.push(propertyObj)
        }
        this.modelindex = this.propertymanage
      },
      proccessdata: {
        handler: function (val, oldVal) {
          this.$emit('getData', val)
        },
        deep: true
      },
      proccessmanage: function (val) {
        this.proccessdata = val
      }
    },
    methods: {
      key_exists (key, arr) {
        let keys = Object.keys(arr)
        for (var i = 0; i < arr.length; i++) {
          if (parseInt(keys[i]) === key) {
            return true
          }
        }
        return false
      }
    },
    computed: {
      propertyIndex: {
        get: function () {
          return this.propertymanage
        },
        set: function (val) {
          this.propertymanage = val
        }
      },
      monday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.monday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.monday.available = val
        }
      },
      mondayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.monday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.monday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      mondayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.monday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.monday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      tuesday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.available = val
        }
      },
      tuesdayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      tuesdayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.tuesday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      wednesday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.available = val
        }
      },
      wednesdayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      wednesdayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.wednesday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      thursday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.thursday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.thursday.available = val
        }
      },
      thursdayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.thursday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.thursday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      thursdayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.thursday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.thursday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      friday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.friday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.friday.available = val
        }
      },
      fridayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.friday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.friday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      fridayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.friday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.friday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      saturday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.saturday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.saturday.available = val
        }
      },
      saturdayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.saturday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.saturday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      saturdayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.saturday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.saturday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      sunday: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.sunday.available
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.sunday.available = val
        }
      },
      sundayintime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.sunday.intime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.sunday.intime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      },
      sundayouttime: {
        get: function () {
          return this.proccessdata[this.propertyIndex].property.availableonweek.sunday.outtime
        },
        set: function (val) {
          this.proccessdata[this.propertyIndex].property.availableonweek.sunday.outtime = moment(val, 'ddd, DD MMM YYYY HH:mm:ss ZZ').format('H:m')
        }
      }
    },
    mounted () {
      this.propertyIndex = this.propertymanage
      if (typeof this.proccessmanage !== undefined || this.proccessmanage != null) {
        // this.proccessdata = this.proccessmanage
      }
    }
  }
</script>
