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
        <i-col :span="5">
            <div class="f-logo">
                <img src="../../assets/images/logo.png" style="width:100%;vertical-align: inherit;">
            </div>
        </i-col>
        <i-col :span="18">
            <Row type="flex" justify="end">
                <div class="layout-nav">
                    <Menu-item name="1">
                      <router-link to="/">
                              Home
                      </router-link>
                    </Menu-item>
                    <Menu-item name="1.1">
                      <subscription :value="$store.state.subscription" :token="$store.state.token" @on-change="handleChange"></subscription>
                    </Menu-item>
                    <Menu-item name="2">
                      <Submenu name="2">
                        <template slot="title">
                          <Icon type="person" :size="16"></Icon>
                          {{$store.state.user.fullname}}
                        </template>
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
      toggeleEnable () {
        return !this.$store.state.sidenavpin || (!this.$store.state.sidenavtoggle)
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
        console.log('value parent', value)
        // console.log('', value)
        this.$store.state.subscription = value
        // axios.defaults.headers.common['subscriptionid'] = value
      }
    }
  }
</script>
