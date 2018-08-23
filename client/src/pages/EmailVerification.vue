<template>
  <div class="loginpage">
    <div class="loginpanel">
      <vue-particles color="#dedede">
      </vue-particles>
      <Row type="flex" justify="center" align="middle">
        <Col :span="6" offset="1">
          <Form ref="formLogin" :model="formLogin" :rules="ruleLogin">
            <FormItem class="animate0 bounceIn">
							<div class="pageheader">
                <div class="pageicon"><i class="fa fa-unlock-alt"></i></div>
                <div class="pagetitle">
                  <h1>Enter Email</h1>
                </div>
              </div>
              <!-- <div style="text-align: center;">
                <img src="../assets/images/Flowz-Icon.png" style="width:60%;"/>
              </div> -->
            </FormItem>
            <FormItem prop="email" class="animate1 bounceIn">
              <Input type="text" v-model="formLogin.email" placeholder="Email ID">
              </Input>
            </FormItem>
            <FormItem class="animate3 bounceIn">
              <Button type="primary" @click="handleSubmit('formLogin')" :loading="loading" class="login-btn" long>
                <span v-if="!loading">Continue</span>
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

    <div class="loginfooter">
        <p>© 2018. Flowz technology. All Rights Reserved.</p>
    </div>

  </div>
</template>

<script>
/*eslint-disable*/
// import axios from 'axios'
import modelAuthentication from '@/api/authentication'
import modelUser from '@/api/user'
import config from '@/config'
import psl from 'psl'
export default {
  name: 'email-verification',
  data () {
    return {
      loading: false,
      formLogin: {
        email: '',
        id: null
      },
      ruleLogin: {
        email: [
          { required: true, message: 'Please fill in the email id', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
        ]
      }
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          this.loading = true
          var auth = await modelAuthentication.social(this.formLogin).catch(error => {
						this.$Message.error(error.response.data)
            return
          })
          if (auth) {
            let userInfo = {
              email: this.formLogin.email,
              id: this.formLogin.id,
              role: '3',
              userGroup: '1'
            }
            modelUser.post(userInfo).then(response => {
              if (response) {
                console.log(response)
              }
            }).catch(e => {
              console.log(e)
            })
            this.$store.commit('SET_TOKEN', auth.logintoken)
						// Token Store in cookie
						let location = psl.parse(window.location.hostname)    // get parent domain
						location = location.domain === null ? location.input : location.domain
						this.$cookie.set('auth_token', auth.logintoken, {expires: 1, domain: location})    // Store in cookie
						this.$store.commit('SET_ROLE', null)
            this.$router.push({path: '/'}) // Redirect to dashbord
          }
          this.loading = false
        } else {
          // this.$Message.error('Form validation failed!')
        }
      })
    }
  },
  mounted () {
    let params = new URLSearchParams(window.location.search)
    this.formLogin.id = params.get('ob_id')
  }
}
</script>
<style>
	.loginfooter {
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
  .loginpage {
      background: #0866c6;
      min-height: 100vh;
  }
  .loginpage .social-icon {
    cursor: pointer;
  }
	.loginpage .pageheader{
    background: none;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 0 0 25px 0;
  }
  .loginpage .pageicon {
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
  .loginpage .pagetitle{
    margin-left: 90px;
    padding-top: 5px;
  }
  .loginpage .pagetitle h5{
    text-transform: uppercase;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
  }
  .loginpage .pagetitle h1{
    color: #fff;
    font-size: 32px;
  }
  .loginpage .ivu-input, .loginpage .login-btn {
    border-radius: 0;
    height: 40px;
	}
	.loginpage .login-btn{
		border: 1px solid #0c57a3
	}
	.loginpage .redirectlink {
		color: #ddd;
		margin-top: -21px;
	}
	.loginpage .redirectlink a {
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
#particles-js {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
