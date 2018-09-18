<template>
  <div class="loginpage" id="main-panel">
    <div class="loginpanel">
      <vue-particles color="#dedede">
      </vue-particles>
      <Row type="flex" justify="center" align="middle">
        <Col :span="6" offset="1">
          <form id="form-facebook" name="form-facebook" :action="loginWithFacebookUrl" method="post">
            <input type="hidden" name="success_url" :value="facebookSuccessCallbackUrl">
          </form>
          <form id="form-google" name="form-google" :action ="loginWithGoogleUrl" method="post">
            <input type="hidden" name="success_url" :value="googleSuccessCallbackUrl">
          </form>
          <form id="form-twitter" name="form-twitter" :action="loginWithTwitterUrl" method="post">
            <input type="hidden" name="success_url" :value="twitterSuccessCallbackUrl">
          </form>
          <form id="form-linkedin" name="form-linkedin" :action ="loginWithLinkedinUrl" method="post">
            <input type="hidden" name="success_url" :value="linkedinSuccessCallbackUrl">
          </form>
          <form id="form-github" name="form-github" :action ="loginWithGithubUrl" method="post">
            <input type="hidden" name="success_url" :value="githubSuccessCallbackUrl">
          </form>
          <Form ref="formLogin" :model="formLogin" :rules="ruleLogin">
            <FormItem class="animate0 bounceIn">
							<div class="pageheader">
                <div class="pageicon"><i class="fa fa-unlock-alt"></i></div>
                <div class="pagetitle">
                  <h5>Your Login Information</h5>
                  <h1>Login</h1>
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
            <FormItem prop="password" class="animate2 bounceIn">
              <Input type="password" v-model="formLogin.password" placeholder="Password">
              </Input>
            </FormItem>
            <FormItem class="animate3 bounceIn">
              <Button type="primary" @click="handleSubmit('formLogin')" :loading="loading" class="login-btn" long>
                <span v-if="!loading">SIGN IN</span>
                <span v-else>Loading...</span>
              </Button>
            </FormItem>
						<FormItem  class="animate4 bounceIn redirectlink">
							<Row>
								<Col style="float:left;">
                  <Tooltip content="Facebook">
                    <span @click="handleFacebook" class="fa-stack fa-lg animated fadeInRight social-icon" style="-webkit-animation-delay: 1s;animation-delay: 1s;-moz-animation-delay: 1s;">
                      <i class="fa fa-square-o fa-stack-2x"></i>
                      <i class="fa fa-facebook fa-stack-1x"></i>
                    </span>
                  </Tooltip>
                  <Tooltip content="Google">
                    <span @click="handleGoogle" class="fa-stack fa-lg animated fadeInRight social-icon" style="-webkit-animation-delay: 2s;animation-delay: 2s;-moz-animation-delay: 2s;">
                      <i class="fa fa-square-o fa-stack-2x"></i>
                      <i class="fa fa-google fa-stack-1x"></i>
                    </span>
                  </Tooltip>
                  <Tooltip content="Twitter">
                    <span @click="handleTwitter" class="fa-stack fa-lg animated fadeInRight social-icon" style="-webkit-animation-delay: 2.5s;animation-delay: 2.5s;-moz-animation-delay: 2.5s;">
                      <i class="fa fa-square-o fa-stack-2x"></i>
                      <i class="fa fa-twitter fa-stack-1x"></i>
                    </span>
                  </Tooltip>
                  <Tooltip content="Github">
                    <span @click="handleGithub" class="fa-stack fa-lg animated fadeInRight social-icon" style="-webkit-animation-delay: 3s;animation-delay: 3s;-moz-animation-delay: 3s;">
                      <i class="fa fa-square-o fa-stack-2x"></i>
                      <i class="fa fa-github fa-stack-1x"></i>
                    </span>
                  </Tooltip>
                  <Tooltip content="Linkedin">
                    <span @click="handleLinkedin" class="fa-stack fa-lg animated fadeInRight social-icon" style="-webkit-animation-delay: 3.5s;animation-delay: 3.5s;-moz-animation-delay: 3.5s;">
                      <i class="fa fa-square-o fa-stack-2x"></i>
                      <i class="fa fa-linkedin fa-stack-1x"></i>
                    </span>
                  </Tooltip>
								</Col>
								<Col  style="float:right;">
									Not a member?&nbsp;
									<router-link to="/register" >Sign Up</router-link>
								</Col>
							</Row>
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
import modelAuthentication from '@/api/authentication'
import config from '@/config'
import psl from 'psl'
export default {
  name: 'login',
  data () {
    return {
      loading: false,
      formLogin: {
        email: '',
        password: ''
      },
      ruleLogin: {
        email: [
          { required: true, message: 'Please fill in the email id', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
        ],
        password: [
          { required: true, message: 'Please fill in the password.', trigger: 'blur' }
        ]
      },
      facebookSuccessCallbackUrl: config.facebookSuccessCallbackUrl,
      googleSuccessCallbackUrl: config.googleSuccessCallbackUrl,
      loginWithFacebookUrl: config.loginWithFacebookUrl,
      loginWithGoogleUrl: config.loginWithGoogleUrl,
      twitterSuccessCallbackUrl: config.twitterSuccessCallbackUrl,
      loginWithTwitterUrl: config.loginWithTwitterUrl,
      linkedinSuccessCallbackUrl: config.linkedinSuccessCallbackUrl,
      loginWithLinkedinUrl: config.loginWithLinkedinUrl,
      githubSuccessCallbackUrl: config.githubSuccessCallbackUrl,
      loginWithGithubUrl: config.loginWithGithubUrl
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          this.loading = true
          var auth = await modelAuthentication.login(this.formLogin).catch(error => {
            if (error.response) {
              this.$Message.error(error.response.data)
            } else {
              this.$Message.error('Fail login.')
            }
            return
          })
          if (auth) {
            this.$store.commit('SET_TOKEN', auth.logintoken) // Token Store in cookie
            let location = psl.parse(window.location.hostname)    // get parent domain
            location = location.domain === null ? location.input : location.domain
            this.$cookie.set('auth_token', auth.logintoken, {expires: 1, domain: location})    // Store in cookie
            this.$store.state.flowz = []
            this.$store.state.schema = []
            this.$store.state.Cache = null
            this.$store.state.Cache = {}
            let userData = await this.$store.dispatch('authenticate', auth.logintoken)
            this.$store.commit('SET_ROLE', 2)
            if (userData.hasOwnProperty('package')) {
              if (this.$store.state.subscription !== '' && this.$store.state.subscription !== undefined) {
                if (userData.package[this.$store.state.subscription].role === 'admin') {
                  this.$store.commit('SET_ROLE', 1)
                }
              } else {
                if (userData.hasOwnProperty('defaultSubscriptionId')) {
                  this.$store.state.subscription = userData.defaultSubscriptionId
                  if (userData.package[this.$store.state.subscription].role === 'admin') {
                    this.$store.commit('SET_ROLE', 1)
                  }
                }
              }
            }
            this.$router.push({path: '/'}) // Redirect to dashbord
          }
          this.loading = false
        } else {
          // this.$Message.error('Form validation failed!')
        }
      })
    },
    handleFacebook () {
      document.getElementById('form-facebook').submit()
    },
    handleGoogle () {
      document.getElementById('form-google').submit()
    },
    handleTwitter () {
      document.getElementById('form-twitter').submit()
    },
    handleLinkedin () {
      document.getElementById('form-linkedin').submit()
    },
    handleGithub () {
      document.getElementById('form-github').submit()
    }
  },
  mounted () {
    var mainDiv = document.getElementById('main-panel')
    let self = this
    mainDiv.onkeypress = function (e) {
      if (e.key === 'Enter') self.handleSubmit('formLogin')
    }
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
