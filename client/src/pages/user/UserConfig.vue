<template>
    <div>
      <Form ref="formConfig" :model="formConfig" :rules="ruleConfig" label-position="top">
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
                  <!-- <Option value="1">Administrator</Option> -->
                  <Option value="2">Admin</Option>
                  <Option value="3">User</Option>
              </Select>
          </Col><br><br>
            </FormItem>
           <FormItem>
            <Button type="primary" @click="handleSubmit('formConfig')">Submit</Button>
          </FormItem>
        </Row>
      </Form>  
    </div>
</template>
<script>
// import config from '@/config'
import api from '@/api/user'
export default {
  data () {
    return {
      userList: [],
      selected: '',
      formConfig: {
        role: '',
        user: ''
      },
      ruleConfig: {
        role: [
          { required: true, message: 'Please select role', trigger: 'blur' }
        ],
        user: [
          { required: true, message: 'Please select one user', trigger: 'blur' }
        ]
      }
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