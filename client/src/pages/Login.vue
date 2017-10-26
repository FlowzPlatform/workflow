<template id="M_Login">
    <div class="content-part">
    <Card style="width:35%;margin-left:30%;margin-top:10%">
        <!-- include ../partials/flash-->
        <div>
          <div>
            <div style="box-shadow: 10px 10px 10px rgba(0,0,0,0.05);">
              <!-- Form header-->
              <div style="border-top-left-radius: 3px; border-top-right-radius: 3px; padding: 10px 15px; border-bottom: 1px solid transparent;text-align: center;color: rgb(255, 255, 255); border-bottom: 7px solid rgb(238, 238, 238); background: rgb(17, 55, 95);height: 100px">
                <h2>Login</h2>
                <p>Don't have an account?<a href="/Register" style="color:#5B97D6"> Create one.</a></p>
              </div>
              <div style="height:220px">
                <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
                    <FormItem prop="Email" style="width:98%" label="Email">
                        <Input type="email" v-model="formInline.Email" placeholder="Email">
                          <Icon type="ios-person-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem prop="Password" style="width:98%" label="Password">
                        <Input type="password" v-model="formInline.Password" placeholder="Password">
                          <Icon type="ios-locked-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" @click="handleSubmit('formInline')">Login</Button>
                    </FormItem>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </Card>
      </div>
</template>

<script>
 /*eslint-disable*/
 import axios from 'axios'

export default {
  name: 'M_Login',
  data () {
    return {
                formInline: {
                    Email: '',
                    Password: ''
                },
                ruleInline: {
                    Email: [
                        { required: true, message: 'Please Fill Email', trigger: 'blur' },
                        { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
                    ],
                    Password: [
                        { required: true, message: 'Please Fill Password', trigger: 'blur' }
                    ]
                }
            }
  },
  methods: {
            handleSubmit(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                      let self = this
                      axios({
                         method: 'post',
                         url: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/login',
                         data: {
                           email: self.formInline.Email,
                           password: self.formInline.Password
                         }
                       })
                       .then(response => {
                        //  console.log(response)
                         localStorage.setItem("logintoken", response.data.logintoken)
                       })
                      if(localStorage.getItem("logintoken")){
                        console.log(localStorage.getItem("logintoken"));
                        this.$router.push('dashboard')
                      }else{
                        this.$router.push('Login')
                      }
                      // this.$Message.success('Submitted successfully!')

                    } else {
                      this.$Message.error('Form validation failed!')
                    }
                })
            }
        }
}
</script>
