<template id="MRegister">
    <div class="content-part">
    <Card style="width:35%;margin-left:30%;margin-top:5%">
        <!-- include ../partials/flash-->
        <div>
          <div>
            <div style="box-shadow: 10px 10px 10px rgba(0,0,0,0.05);">
              <!-- Form header-->
              <div style="border-top-left-radius: 3px; border-top-right-radius: 3px; padding: 10px 15px; border-bottom: 1px solid transparent;text-align: center;color: rgb(255, 255, 255); border-bottom: 7px solid rgb(238, 238, 238); background: rgb(17, 55, 95);height: 100px">
                <h2>Registration</h2>
                <p>Already have an account?<a href="/Login" style="color:#5B97D6"> Sign in.</a></p>
              </div>
              <div style="height:400px">
                <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
                    <FormItem prop="Name" style="width:98%" label="Name">
                        <Input type="text" v-model="formInline.Name" placeholder="Name">
                          <Icon type="ios-person-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
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
                    <FormItem prop="Repassword" style="width:98%" label="Re-EnterPassword">
                        <Input type="password" v-model="formInline.Repassword" placeholder="Re-Enter Password">
                          <Icon type="ios-locked-outline" slot="prepend"></Icon>
                        </Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" @click="handleSubmit('formInline')">Create Account</Button>
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
export default {
  name: 'MRegister',
  data () {
    return {
                formInline: {
                    Name: '',
                    Email: '',
                    Password: '',
                    Repassword: ''
                },
                ruleInline: {
                    Name: [
                        { required: true, message: 'Please Fill Name', trigger: 'blur' }
                    ],
                    Email: [
                        { required: true, message: 'Please Fill Email', trigger: 'blur' },
                        { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
                    ],
                    Password: [
                        { required: true, message: 'Please Fill Password', trigger: 'blur' }
                    ],
                    Repassword: [
                        { required: true, message: 'Please Fill Re-Enter Password', trigger: 'blur' }
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
                         url: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/setup',
                         data: {
                           email: self.formInline.Email,
                           password: self.formInline.Password
                         }
                       })
                       .then(response => {
                        if(response){
                          this.$router.push('Login')
                        }else{
                          this.$router.push('Register')
                        }
                      })
                    } else {
                      alert("error")
                    }
                })
            }
        }
}
</script>
