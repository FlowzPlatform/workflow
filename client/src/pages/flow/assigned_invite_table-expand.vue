<style scoped>
  .ivu-spin-main {
    width: 100% !important;
    text-align: -webkit-center !important;
  }
</style>
<template>
    <div>
      <div v-if="spinShow">
        <Spin size="large"></Spin>
      </div>
      <div v-else>
        <div v-if = 'data6.length > 0'>
          <Table border :columns="columns7" :data="data6"></Table>
        </div>
        <div v-else style="text-align:center;color:#fd5e5e">
          <!-- <h5>{{assignee}}</h5> -->
          <h5>No one is assigned</h5>
        </div>
      </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import config from '../../config/index'
    let subscriptionUrl = config.subscriptionUrl
    import Cookies from 'js-cookie'
    import moment from 'moment'
    import Vue from 'vue'
    import iView from 'iview'
    import locale from 'iview/dist/locale/en-US'
    Vue.use(iView, { locale })
    let emailTemp = require('./emailTemplate')
    let SendEmailBodyInvite = emailTemp.sendInviteemail
    export default {
      props: {
        row: Object
      },
      data () {
        return {
          spinShow: true,
          assignee: '',
          columns7: [
            {
              title: 'Assignee Email',
              key: 'toEmail'
            },
            {
              title: 'Role',
              key: 'role',
              render: (h, params) => {
                return h('div', [
                  h('strong', this.capitalize(params.row.role[Object.keys(params.row.role)]))
                ])
              }
            },
            {
              title: 'Assigned Date',
              key: 'assignDate',
              render: (h, params) => {
                var date1 = moment(params.assignDate).format('DD-MMM-YYYY')
                return h('div', [
                  h('span', date1)
                ])
              }
            },
            {
              title: 'Action',
              key: 'action',
              align: 'center',
              render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      loading: params.row.flag.sendMailFlag
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        params.row.flag.sendMailFlag = true
                        this.sendEmail(params)
                      }
                    }
                  }, 'Send Email'),
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small',
                      loading: params.row.flag.unAssignFlag
                    },
                    on: {
                      click: () => {
                        params.row.flag.unAssignFlag = true
                        this.remove(params)
                      }
                    }
                  }, 'Un-assaign')
                ])
              }
            }
          ],
          data6: []
        }
      },
      methods: {
        capitalize (str) {
          str = str[0].toUpperCase() + str.slice(1)
          return str
        },
        show (index) {
        },
        sendEmail (params) {
          let self = this
          let data = params.row
          var SendEmailBody = SendEmailBodyInvite.replace(/WriteSenderNameHere/i, data.fromEmail)
          SendEmailBody = SendEmailBody.replace(/domainKey/g, process.env.domainkey)
          SendEmailBody = SendEmailBody.replace(/SYSTEMNAME/g, Object.keys(data.role)[0])
          SendEmailBody = SendEmailBody.replace(/ROLE/g, Object.values(data.role)[0])
          axios({
            method: 'post',
            url: 'https://api.' + process.env.domainkey + '/vmailmicro/sendEmail',
            headers: { authorization: Cookies.get('auth_token') },
            data: { 'to': data.toEmail, 'from': data.fromEmail, 'subject': 'Invitation from Flowz', 'body': SendEmailBody }
          })
          .then(async (result) => {
            params.row.flag.sendMailFlag = false
            self.$Notice.success({
              duration: 0,
              desc: 'Mail Sended Successfully'
            })
            return true
          })
          .catch(function (err) {
            params.row.flag.sendMailFlag = false
            return err
          })
        },
        remove (params) {
          this.$Modal.confirm({
            title: 'Title',
            content: '<p>Do you really want to Un-assign this user ?</p><p> You Can not Undo this action</p>',
            onOk: () => {
              let self = this
              let module = [Object.keys(params.row.role)]
              let paramss = {
                subscriptionId: params.row.subscriptionId,
                toEmail: params.row.toEmail,
                role: module,
                fromEmail: params.row.fromEmail,
                subscription_invitation_id: params.row.id
              }
              axios({
                method: 'delete',
                url: subscriptionUrl + 'invite',
                params: paramss,
                headers: {
                  authorization: Cookies.get('auth_token')
                }
              })
              .then(function (response) {
                self.data6.splice(params.index, 1)
                params.row.flag.unAssignFlag = false
                self.$Notice.success({
                  duration: 0,
                  desc: 'User Un-assigned successfully'
                })
              }).catch(function (err) {
                params.row.flag.unAssignFlag = false
                console.log(err)
              })
            },
            onCancel: () => {
              params.row.flag.unAssignFlag = false
            }
          })
        },
        async init () {
          let self = this
          await axios.get(subscriptionUrl + 'subscription-invitation', {
            params: {
              subscriptionId: this.row.subscriptionId
            },
            headers: {
              authorization: Cookies.get('auth_token')
            }
          })
          .then(function (result) {
            self.spinShow = false
            if (result.data.data.length === 0) {
              self.assignee = 'No assignee found for this subscription'
            } else {
              self.assignee = result.data.data
              for (let f of self.assignee) {
                f['flag'] = {
                  sendMailFlag: false,
                  unAssignFlag: false
                }
              }
              self.data6 = self.assignee
            }
          })
          .catch((err) => { console.log('Error:', err) })
        }
      },
      mounted () {
        this.init()
      }
    }
</script>