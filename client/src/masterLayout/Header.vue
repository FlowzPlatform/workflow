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
                <img src="../assets/images/logo.png" style="width:100%;vertical-align: inherit;">
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
                    <Menu-item name="2" v-if="getRole == 1">
                        <router-link to="/admin/schema">
                            <Icon type="filing" :size="14"></Icon>
                            Schema
                        </router-link>
                    </Menu-item>
                    <Menu-item name="3" v-if="getRole == 1">
                        <router-link to="/admin/flow">
                            <Icon type="network" :size="14"></Icon>
                            Flow
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
                </div>
                </Row>
        </i-col>
        </Row>
    </Menu>
</template>
<script>
  import psl from 'psl'
  // import axios from 'axios'
  import subscription from '@/components/subscription'
  export default {
    components: {
      subscription
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
      handleRemove () {
        let location = psl.parse(window.location.hostname)
        location = location.domain === null ? location.input : location.domain
        this.$cookie.delete('auth_token', {domain: location})
        this.$store.commit('SET_TOKEN', null)
        this.$store.commit('SET_USER', null)
        this.$store.commit('SET_ROLE', null)
        this.$router.push('/login')
      },
      handleChange (value) {
        this.$store.state.subscription = value
        this.$router.push('/')
        if (this.$store.state.user.package) {
          if (this.$store.state.user.package[value] && this.$store.state.user.package[value].role === 'admin') {
            this.$store.commit('SET_ROLE', 1)
          } else {
            this.$store.commit('SET_ROLE', 2)
          }
        } else {
          this.$store.commit('SET_ROLE', 2)
        }
        // this.$store.dispatch('getFlowzdata')
      }
    }
  }
</script>
