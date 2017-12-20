<template>
    <div>
      <!-- <Form ref="formConfig" :model="formConfig" :rules="ruleConfig" label-position="top">
        <Row>
            <FormItem prop="user" label="Select User">
          <Col span="6" style="padding-right:10px">
              <Select v-model="formConfig.user" filterable>
                  <Option v-for="item in userList" :value="item.email" :key="item.email">{{ item.email }}</Option>
              </Select>
          </Col>
            </FormItem>
            <FormItem prop="role" label="Select user role">
         <Col span="6" style="padding-right:10px">
              <Select v-model="formConfig.role" filterable>
                  <Option value="1">Administrator</Option>
                  <Option value="2">Admin</Option>
                  <Option value="3">User</Option>
              </Select>
          </Col><br><br>
            </FormItem>
           <FormItem>
            <Button type="primary" @click="handleSubmit('formConfig')">Submit</Button>
          </FormItem>
        </Row>  
      </Form> -->
      <row type="flex" justify="end">
        <Button type="primary" size="small" style="margin-bottom: 8px;" @click="changeRole()"> Update</Button>
      </row>
      <Table size="small" :columns="columns10" :data="userList"></Table>
    </div>
</template>
<script>
// import config from '@/config'
import api from '@/api/user'
export default {
  data () {
    return {
      userList: [],
      columns10: [{
        title: 'User Name',
        width: 200,
        key: 'firstname'
      }, {
        title: 'User Email',
        key: 'email'
      }, {
        title: 'Role',
        key: 'role',
        width: 200,
        align: 'center',
        render: (h, params) => {
          if (params.row.role === '1') {
            this.userList.splice(params.index, 1)
          }
          return h('div', [
            h('Select', {
              props: {
                value: params.row.role
              },
              on: {
                'on-change': (value) => {
                  this.updateRole(params.index, value)
                }
              }
            }, [
              h('Option', {
                props: {
                  value: '2'
                }
              }, 'Admin'),
              h('Option', {
                props: {
                  value: '3'
                }
              }, 'User')
            ])
          ])
        }
      }],
      selected: ''
      // formConfig: {
      //   role: '',
      //   user: ''
      // },
      // ruleConfig: {
      //   role: [
      //     { required: true, message: 'Please select role', trigger: 'blur' }
      //   ],
      //   user: [
      //     { required: true, message: 'Please select one user', trigger: 'blur' }
      //   ]
      // }
    }
  },
  methods: {
    async changeRole () {
      let check
      for (let i = 0; i < this.userList.length; i++) {
        // console.log(this.userList[i])
        await api.put(this.userList[i].id, this.userList[i])
        .then(res => {
          check = 1
        })
        .catch(error => {
          this.$Notice.error({
            title: 'Please try again',
            desc: error
          })
        })
      }
      if (check === 1) {
        this.$Message.success('New role assigned successfully..!')
      }
    },
    updateRole (index, value) {
      this.userList[index].role = value
    }
  },
  mounted () {
    let self = this
    api.get()
    .then(response => {
      console.log('Response :', response.data.data)
      self.userList = response.data.data
    })
    .catch(error => {
      console.log('Error : ', error)
    })
  }
}
</script>