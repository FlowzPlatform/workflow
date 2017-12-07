<template>
  <div>
    <div class="registerpage">
    <div class="registerpanel">
      <Row type="flex" justify="center" align="middle">
        <Col :span="6" offset="1">
          <Form ref="formRegister" :model="formRegister" :rules="ruleRegister">
            <FormItem class="animate0 bounceIn">
              <div class="pageheader">
                <div class="pageicon"><i class="fa fa-hand-o-down"></i></div>
                <div class="pagetitle">
                  <h5>Your Information</h5>
                  <h1>Sign Up</h1>
                </div>
              </div>
              <!-- <div style="text-align: center;">
                <img src="../assets/images/logo.png" style="width:60%;"/>
              </div> -->
            </FormItem>
            <label class="subtitle animate1 bounceIn"> LOGIN INFORMATION </label>
            <FormItem prop="email" class="animate1 bounceIn">
              <Input type="text" v-model="formRegister.email" placeholder="Email ID">
              </Input>
            </FormItem>
            <FormItem prop="password" class="animate2 bounceIn">
              <Input type="password" v-model="formRegister.password" placeholder="Password">
              </Input>
            </FormItem>
            <label class="subtitle animate3 bounceIn"> USER INFORMATION </label>
            <FormItem prop="firstname" class="animate3 bounceIn">
              <Input v-model="formRegister.firstname" placeholder="First Name"></Input>
            </FormItem>
            <FormItem prop="lastname" class="animate4 bounceIn">
              <Input v-model="formRegister.lastname" placeholder="Last Name"></Input>
            </FormItem>
            <FormItem class="animate5 bounceIn">
              <Button type="primary" long @click="handleSubmit('formRegister')" :loading="loading" class="register-btn">
                <span v-if="!loading">REGISTER</span>
                <span v-else>Loading...</span>
              </Button>
            </FormItem>
          </Form>
        </Col>
        <Col :span="1">
          <div style="height: 100vh"></div>
        </Col>
      </Row>
    </div>

    <div class="registerfooter">
        <p>© 2017. Flowz technology. All Rights Reserved.</p>
    </div>
  </div>
  </div>
</template>

<script>
import modelAuthentication from '@/api/authentication'
import modelUser from '@/api/user'
export default {
  name: 'Register',
  data () {
    return {
      loading: false,
      formRegister: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        role: '3',
        userGroup: '1'
      },
      ruleRegister: {
        firstname: [
          { required: true, message: 'Please Fill First Name', trigger: 'blur' }
        ],
        lastname: [
          { required: true, message: 'Please Fill Last Name', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please Fill Email', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
        ]
      }
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loading = true
          modelAuthentication.register(this.formRegister).then(response => {
            if (response) {
              modelUser.post(this.formRegister).then(response => {
                if (response) {
                  this.loading = false
                }
              }).catch(e => {
                this.loading = false
              })
            } else {
              this.loading = false
            }
          })
          .catch(e => {
            this.$Message.error(e.response.data)
            this.loading = false
          })
        } else {
          this.$Message.error('Form validation failed!')
        }
      })
    }
  }
}
</script>
<style>
	.registerfooter {
		font-size: 11px;
    color: rgba(255,255,255,0.5);
    position: absolute;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    font-family: arial, sans-serif !important;
    padding: 5px 0;
	}
  .registerpage {
      background: #0866c6;
      min-height: 100vh;
  }
  .registerpanel .pageheader{
    background: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 0 0 25px 0;
  } 
  .registerpanel .pageicon {
      width: 70px;
      font-size: 42px;
      padding: 10px;
      color: #fff;
      border: 3px solid #fff;
      display: inline-block;
      -moz-border-radius: 50px;
      -webkit-border-radius: 50px;
      border-radius: 50px;
      float: left;
      text-align: center;
  }
  .registerpanel .pagetitle{
    margin-left: 90px;
    padding-top: 5px;
  }
  .registerpanel .pagetitle h5{
    text-transform: uppercase;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
  }
  .registerpanel .pagetitle h1{
    color: #fff;
    font-size: 32px;
  }
  .registerpanel .ivu-form-item-error-tip {
    display:none;
  }
  .registerpanel .ivu-form-item {
    margin-bottom: 10px;
  }
  .registerpanel .subtitle {
    color: rgba(255,255,255,0.5);
    font-size: 11px;
  }
  .registerpanel .ivu-input, .registerpanel .register-btn {
    border-radius: 0;
    height: 40px;
	}
	.registerpanel .register-btn{
		border: 1px solid #0c57a3
	}
	.registerpanel .redirectlink {
		color: #ddd;
		margin-top: -21px;
	}
	.registerpanel .redirectlink a { 
		color: #fff;
	}
  .animate0 {
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: 0s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: 0s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: 0s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: 0s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
}         

.animate1{
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: .2s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: .2s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: .2s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: .2s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
} 

.animate2{
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: .4s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: .4s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: .4s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: .4s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
} 

.animate3{
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: .6s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: .6s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: .6s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: .6s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
}   

.animate4{
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: .8s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: .8s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: .8s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: .8s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
}  

.animate5{
   	-webkit-animation-duration: .8s;
	-webkit-animation-delay: 1s;
	-webkit-animation-timing-function: ease;
	-webkit-animation-fill-mode: both;
	-moz-animation-duration: .8s;
	-moz-animation-delay: 1s;
	-moz-animation-timing-function: ease;
	-moz-animation-fill-mode: both;
	-ms-animation-duration: .8s;
	-ms-animation-delay: 1s;
	-ms-animation-timing-function: ease;
	-ms-animation-fill-mode: both;
	animation-duration: .8s;
	animation-delay: 1s;
	animation-timing-function: ease;
	animation-fill-mode: both;	          
}    

</style>