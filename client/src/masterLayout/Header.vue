<style>
  span.text {
    /* display: none; */
    font-weight: normal;
  }
  @media only screen and (max-width: 1500px) {
		  span.text {
        display: none;
      }
  }
</style>
<template>
    <Menu mode="horizontal" :theme="'primary'">
        <Row type="flex">
        <Col :span="1" v-if="toggeleEnable">
            <Row type="flex" justify="end" align="middle">
              <span @click="$store.state.sidenavtoggle = !$store.state.sidenavtoggle">
                <Icon type="navicon-round" :size="32" style="line-height: inherit;cursor:pointer"></Icon>
              </span>
            </Row>
        </Col>
        <i-col :span="4">
            <div class="f-logo">
              <a href="javascript:void(0)" @click="gotoDashboard">
                <img src="../assets/images/logo.png" style="width:100%;vertical-align: inherit;">
              </a>
            </div>
        </i-col>
        <i-col :span="calculateLength">
            <Row type="flex" justify="end">
                <div class="layout-nav">
                    <!-- <Menu-item name="1">
                      <router-link to="/">
                        Home
                      </router-link>
                    </Menu-item> -->
                    <Menu-item name="4" v-if="getRole == 1">
                        <router-link to="/admin/emailtemplate">
                          <Tooltip content="Email Template">
                            <Icon type="email" :size="14"></Icon>
                          </Tooltip>
                            
                            <span class="text">Email Template</span>
                        </router-link>
                    </Menu-item>
                    <Menu-item name="2" v-if="getRole == 1">
                        <router-link to="/admin/schema">
                          <Tooltip content="Schema">
                            <Icon type="filing" :size="14"></Icon>
                          </Tooltip>
                            <span class="text">Schema</span>
                        </router-link>
                    </Menu-item>
                    <Menu-item name="3" v-if="getRole == 1">
                        <router-link to="/admin/flow">
                          <Tooltip content="Flow">
                            <Icon type="network" :size="14"></Icon>
                          </Tooltip>
                            <span class="text">Flow</span>
                        </router-link>
                    </Menu-item>
                    <!-- <Menu-item name="4" v-if="getRole == 1">
                        <router-link to="/admin/DbSettings">
                            <Icon type="gear-b" :size="14"></Icon>
                            Db-settings
                        </router-link>
                    </Menu-item> -->
                    <Menu-item name="1-1">
                      <subscription :value="$store.state.subscription" :token="$store.state.token" @on-change="handleChange"></subscription>
                    </Menu-item>
                    <Menu-item name="5">
                      <Submenu name="2">
                        <template slot="title">
                          <Icon type="person" :size="16"></Icon>
                          {{getUserName}}
                        </template>
                        <Menu-item name="1-1"  v-if="getRole == 1">
                            <router-link to="/admin/bpmn-plugin">
                                <i class="fa fa-plug"></i>
                                Plugins
                            </router-link>
                        </Menu-item>
                        <Menu-item name="2-1">
                            <a @click="handleRemove">
                                <Icon type="ios-locked-outline" :size="16"></Icon>
                                Logout
                            </a>
                        </Menu-item>
                    </Submenu>
                    </Menu-item>
                    <Menu-item name="5">
                      <i @click="hardRefresh" class="fa fa-refresh" aria-hidden="true" title="hard refresh"></i>
                    </Menu-item>
                </div>
                </Row>
        </i-col>
        </Row>
    </Menu>
</template>
<script>
  import psl from 'psl'
  export default {
    components: {
      subscription: (resolve) => { require(['@/components/subscription'], resolve) }
    },
    computed: {
      getRole () {
        return this.$store.state.role
      },
      calculateLength () {
        if (this.toggeleEnable) {
          return 19
        } else {
          return 20
        }
      },
      toggeleEnable () {
        return !this.$store.state.sidenavpin || (!this.$store.state.sidenavtoggle)
      },
      getUserName () {
        // console.log('this.$store.state.user', this.$store.state.user)
        if (this.$store.state.user) {
          let name = this.$store.state.user.fullname || ''
          if (name === '' && this.$store.state.user.email) {
            name = this.$store.state.user.email
          }
          return name
        } else {
          return ''
        }
      }
    },
    methods: {
      hardRefresh () {
        this.$store.state.flowz = []
        this.$store.state.schema = []
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
        this.$store.state.registerRoles = null
        this.$store.state.registerRoles = {}
        this.$store.state.registerResources = null
        this.$store.state.registerResources = {}
        window.location.reload()
      },
      gotoDashboard () {
        if (this.$store.state.role === 1) {
          this.$router.push('/admin/dashboard')
        } else {
          this.$router.push('/dashboard')
        }
      },
      handleRemove () {
        let location = psl.parse(window.location.hostname)
        location = location.domain === null ? location.input : location.domain
        this.$cookie.delete('auth_token', {domain: location})
        this.$store.commit('SET_TOKEN', null)
        this.$store.commit('SET_USER', null)
        this.$store.commit('SET_ROLE', null)
        this.$store.state.flowz = []
        this.$store.state.schema = []
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
        this.$router.push('/login')
      },
      handleChange (value) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
        this.$store.state.subscription = value
        if (this.$store.state.user.package) {
          if (this.$store.state.user.package[value] && this.$store.state.user.package[value].role === 'admin') {
            this.$store.commit('SET_ROLE', 1)
            this.$router.push('/admin/dashboard')
          } else {
            this.$store.commit('SET_ROLE', 2)
            this.$router.push('/')
          }
        } else {
          this.$store.commit('SET_ROLE', 2)
          this.$router.push('/')
        }
        // console.log('done')
        // this.$router.push('/')
        // this.$store.dispatch('getFlowzdata')
      }
    }
  }
</script>
