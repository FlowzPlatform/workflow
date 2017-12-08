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
                <img src="../assets/images/logo.png" style="width:100%;vertical-align: inherit;">
            </div>
        </i-col>
        <i-col :span="18">
            <Row type="flex" justify="end">
                <div class="layout-nav">
                    <Menu-item name="1">
                        <router-link to="/admin/approval">
                            <Icon type="filing" :size="14"></Icon>
                            Approval
                        </router-link>
                    </Menu-item>
                    <Menu-item name="2">
                        <router-link to="/admin/schema">
                            <Icon type="filing" :size="14"></Icon>
                            Schema
                        </router-link>
                    </Menu-item>
                    <Menu-item name="3">
                        <router-link to="/admin/flow">
                            <Icon type="network" :size="14"></Icon>
                            Flow
                        </router-link>
                    </Menu-item>
                    <Menu-item name="4">
                        <router-link to="/admin/DbSettings">
                            <Icon type="gear-b" :size="14"></Icon>
                            Db-settings
                        </router-link>
                    </Menu-item>
                    <Menu-item name="5">
                      <Submenu name="1">
                        <template slot="title">
                          <Icon type="person" :size="16"></Icon>
                          {{$store.state.user.fullname}}
                        </template>
                        <Menu-item name="1-1">
                            <router-link to="/admin/bpmn-plugin">
                                <i class="fa fa-plug"></i>
                                Plugins
                            </router-link>
                        </Menu-item>
                        <Menu-item name="1-1">
                            <router-link to="/admin/userconfig">
                                <Icon type="person-stalker"></Icon>
                                User Config
                            </router-link>
                        </Menu-item>
                        <Menu-item name="1-1">
                            <a @click="handleRemove()">
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
/*eslint-disable*/
  export default {
    computed: {
      toggeleEnable () {
        return !this.$store.state.sidenavpin || (!this.$store.state.sidenavtoggle)
      }
    },
    methods:{
      handleRemove () {
        let location = psl.parse(window.location.hostname)
        location = location.domain === null ? location.input : location.domain
        this.$cookie.delete('auth_token', {domain: location});
        this.$store.commit('SET_TOKEN', null)
        this.$store.commit('SET_USER', null)
        this.$store.commit('SET_ROLE', null)
        this.$router.push('/login')
      }
    }
  }
</script>
