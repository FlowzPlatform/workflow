<template>
  <div class="layout">
      <div class="layout-header">
          <h4>Approver</h4>
      </div>
      <div style="margin:25px;">
        <Form ref="data" :model="data">
          <FormItem label="Approval class" prop="proccessname" :rules="{required: true, trigger: 'blur'}">
            <Input type="text" v-model="data.proccessname" placeholder="proccessname"></Input>
          </FormItem>
          </br>
          <Collapse  accordion>
            <Panel name="1">
                Process
                <div slot="content">
                  <Row :gutter="16">
                    <Col span="12">
                        <fieldset><legend><strong>Approvers</strong></legend></fieldset>
                          <template v-for="(item, index) in data.items">
                            <Row :gutter="16">
                              <Col span="8">
                                <FormItem :prop="'items.' + index + '.role'" :rules="{required: true, trigger: 'blur'}">
                                  <Select v-model="item.role" @focus="setFocus(index)" placeholder="Role" style="min-width:165px">
                                    <Option v-for="item in roleList" :value="item" :key="item">{{ item }}</Option>
                                  </Select>
                                </FormItem>
                              </Col>
                              <!-- <Col span="8">
                                <FormItem
                                  :prop="'items.' + index + '.role'"
                                  :rules="{required: true, trigger: 'blur'}">
                                  <input type="text" v-model="item.role"  @focus="setFocus(index)" placeholder="Role"></input>
                                </FormItem>
                              </Col>
                            	<Col span="10">
                              	<FormItem
                              	  :prop="'items.' + index + '.email'"
                              	  :rules="{required: true, trigger: 'blur'}">
                              	  <input type="text" v-model="item.email" @focus="setFocus(index)" placeholder="Email"></input>
                              	</FormItem>
                            	</Col> -->
                              <Col span="4">
                                  <Button type="ghost" @click="handleRemove(index)">Delete</Button>
                              </Col>
                            </Row>
                          </template>
                          <Row>
                              <Col span="12">
                                  <Button type="dashed" long class="add-button" @click="handleAdd" icon="plus-round">Added</Button>
                              </Col>
                          </Row>
                        <!-- <FormItem>
                            <Button type="primary" @click="handleSubmit('formDynamic')">Submit</Button>
                            <Button type="ghost" @click="handleReset('formDynamic')" style="margin-left: 8px">Reset</Button>
                        </FormItem> -->
                    </Col>
                    <Col span="12" class="tabs-panels">
                      <property-manage :propertymanage="ind" :proccessmanage="processArr" @getData="getChildData"></property-manage>
                    </Col>
                  </Row>
                </div>
            </Panel>
            <Panel name="2">
              Final Notification
              <div slot="content">
                <Row>
                  <Col span="8">
                    <Row><h4>Approved</h4></Row>
                    <Row><Checkbox v-model="data.finalNotification.approved.requester">Requester</Checkbox></Row>
                    <Row><Checkbox v-model="data.finalNotification.approved.allParticipants">All participants</Checkbox></Row>
                    <Row><Checkbox v-model="ckbAdditionalEmails">Additional emails</Checkbox></Row>
                    <Row><Input :disabled="!ckbAdditionalEmails" v-model="data.finalNotification.approved.additionalEmails" placeholder="example@mail.com;example1@mail.com" style="width:275px"></Input></Row>
                  </Col>
                  <Col span="8">
                    <Row><h4>Rejected</h4></Row>
                    <Row><Checkbox  v-model="data.finalNotification.rejected.requester">Requester</Checkbox></Row>
                    <Row><Checkbox  v-model="data.finalNotification.rejected.allApproved">All approved</Checkbox></Row>
                    <Row><Checkbox  v-model="data.finalNotification.rejected.allParticipants">All participants</Checkbox></Row>
                    <Row><Checkbox  v-model="ckbRejectedEmails">Additional emails</Checkbox></Row>
                    <Row><Input :disabled="!ckbRejectedEmails" v-model="data.finalNotification.rejected.additionalEmails" placeholder="example@mail.com;example1@mail.com" style="width:275px"></Input></Row>
                  </Col>
                  <Col span="8">
                    <Row><h4>Progress</h4></Row>
                    <Row><Checkbox v-model="data.finalNotification.progress.requester">Requester</Checkbox></Row>
                    <Row><Checkbox v-model="data.finalNotification.progress.allParticipants">All participants</Checkbox></Row>
                    <Row><Checkbox v-model="ckbProgressEmails">Additional emails</Checkbox></Row>
                    <Row><Input :disabled="!ckbProgressEmails" v-model="data.finalNotification.progress.additionalEmails" placeholder="example@mail.com;example1@mail.com" style="width:275px"></Input></Row>
                  </Col>
                </Row>
              </div>
            </Panel>
            <Panel name="3">
              Tracking
              <div slot="content">
                <Row>
                  <Col span="8">
                    <FormItem label="To" prop="mail">
                      <Input v-model="data.tracking.to" placeholder="example@mail.com;example1@mail.com"></Input>
                    </FormItem>
                  </Col>
                  <Col span="8">
                    <FormItem label="CC" prop="mail">
                      <Input v-model="data.tracking.cc" placeholder="example@mail.com;example1@mail.com"></Input>
                    </FormItem>
                  </Col>
                  <Col span="8">
                    <FormItem label="BCc" prop="mail">
                      <Input v-model="data.tracking.bcc" placeholder="example@mail.com;example1@mail.com"></Input>
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </Panel>
          </collapse>
          <FormItem>
            <Button type="primary" @click="handleSubmit('data')">Save</Button>
          </FormItem>
        </Form>
      </div>
  </div>
</template>


<script>
  import propertyManage from '@/pages/approval/PropertyManage.vue'
  import approval from '@/api/approval'
  import approvalrole from '@/api/approvalrole'

  let approvalSchema = {
    finalNotification: {
      approved: {
        additionalEmails: '',
        allParticipants: '',
        requester: false
      },
      progress: {
        additionalEmails: '',
        allParticipants: false,
        requester: false
      },
      rejected: {
        additionalEmails: '',
        allApproved: false,
        allParticipants: false,
        requester: false
      }
    },
    proccessname: '',
    tracking: {
      bcc: '',
      cc: '',
      to: ''
    },
    items: [
      {
        role: '',
        email: ''
      }
    ],
    process: null
}

  export default {
    name: 'process',
    components: { 'property-manage': propertyManage },
    data () {
      return {
        data: approvalSchema,
        ckbAdditionalEmails: false,
        ckbRejectedEmails: false,
        ckbProgressEmails: false,
        ind: 0,
        processArr: null,
        roleList: []
        // formDynamic: {
        //   items: [
        //     {
        //       role: '',
        //       email: ''
        //     }
        //   ]
        // }
      }
    },
    async mounted () {
      var rowId = this.$route.params.id
      if (rowId) {
        let processData = await approval.getOne(rowId)
        this.data.id = rowId
        this.data.proccessname = (processData.proccessname.length > 0) ? processData.proccessname : ''
        this.data.finalNotification.approved.additionalEmails = processData.finalNotification.approved.additionalEmails
        this.data.finalNotification.approved.allParticipants = processData.finalNotification.approved.allParticipants
        this.data.finalNotification.approved.requester = processData.finalNotification.approved.requester
        this.data.finalNotification.progress.additionalEmails = processData.finalNotification.progress.additionalEmails
        this.data.finalNotification.progress.allParticipants = processData.finalNotification.progress.allParticipants
        this.data.finalNotification.progress.requester = processData.finalNotification.progress.requester
        this.data.finalNotification.rejected.additionalEmails = processData.finalNotification.rejected.additionalEmails
        this.data.finalNotification.rejected.allParticipants = processData.finalNotification.rejected.allParticipants
        this.data.finalNotification.rejected.requester = processData.finalNotification.rejected.requester
        this.data.finalNotification.rejected.allApproved = processData.finalNotification.rejected.allApproved
        this.data.tracking.to = processData.tracking.to
        this.data.tracking.cc = processData.tracking.cc
        this.data.tracking.bcc = processData.tracking.bcc

        if (processData.process.length !== 0) {
          let items = []
          let processArr = []
          for (var i = 0; i < processData.process.length; i++) {
            items.push({
              email: processData.process[i].email,
              role: processData.process[i].role
            })
            processArr.push(processData.process[i])
          }
          this.data.items = items
          this.processArr = processArr
        }
        this.data.items[0].role = processData.items[0].role
      }
      let approvalroleList = await approvalrole.get()
      for (i = 0; i < approvalroleList.length; i++) {
        this.roleList.push(approvalroleList[i])
      }
    },
    methods: {
      setFocus (index) {
        this.ind = index
      },
      getChildData (data) {
        if (data.length !== 0) {
          for (var i = 0; i < data.length; i++) {
            data[i].email = this.data.items[i].email
            data[i].role = this.data.items[i].role
          }
        }
        this.data.process = data
      },
      handleSubmit (name) {
        this.$refs[name].validate(async(valid) => {
          if (valid) {
            let actionResponse
            if (this.data.hasOwnProperty('id')) {
              actionResponse = await approval.update(this.data, this.data.id)
            } else {
              actionResponse = await approval.add(this.data)
            }
            if (actionResponse.status === 'success') {
              this.$Notice.success({duration: 3, title: 'Success!!', desc: actionResponse.message})
              this.$router.push('/approval')
            } else {
              this.$Notice.error({duration: 3, title: 'Error!!', desc: actionResponse.message})
            }
          } else {
            this.$Message.error('Please enter below required details!')
          }
        })
      },
      // handleReset (name) {
      //   this.$refs[name].resetFields()
      // },
      handleAdd () {
        this.$refs['data'].validate((valid) => {
          if (valid) {
            this.data.items.push({
              role: '',
              email: ''
            })
          }
        })
      },
      handleRemove (index) {
        if (index > 0) {
          this.data.items.splice(index, 1)
        }
      }
    }
  }
</script>
<style scoped>
    .layout{
      border: 1px solid #d7dde4;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
    }
    .layout-header{
      height: 60px;
      background: #f5f7f9;
      box-shadow: 0 1px 1px rgba(0,0,0,.1);
      padding: 15px
    }
    .ivu-row{
      /*height: 500px;*/
      margin-top: 10px;
    }
    fieldset{
      min-width: 0;
      padding: 0;
      margin: 0;
      border: 0;
    }
    fieldset legend {
      font-size: 16px;
      padding: 0px 20px 6px 0px;
      border-bottom: 2px solid #eaedf1;
      font-weight: bold;
    }
    .tabs-panels > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab{
        border-radius: 0;
        background: #fff;
        border-top: 1px solid #3399ff;
    }
    .tabs-panels > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active{
        border-top: 1px solid #3399ff;
    }
    .tabs-panels > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active:before{
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background: #3399ff;
        position: absolute;
        top: 0;
        left: 0;
    }
    .ivu-form-item{
      margin: 5px
    }
    .add-button{
      margin-top: 15px;
    }
</style>
