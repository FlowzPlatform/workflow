<template>
  <div class="layout" :class="{'layout-hide-text': spanLeft < 5}">
    <f-header></f-header>
    <Row type="flex">
       <Col :span="spanLeft" class="layout-menu-left">
        <f-sidebar></f-sidebar>
      </Col>
      <Col :span="spanRight">
         <div class="f-layout-content">
          <div class="f-layout-content-main">
            <router-view></router-view>
          </div>
        </div> 
        <f-footer></f-footer>
      </Col>
    </Row>  
  </div>  
  <!-- <div class="layout" :class="{'layout-hide-text': spanLeft < 5}">
    <Row type="flex">
      <Col :span="spanLeft" class="layout-menu-left">
        <f-sidebar></f-sidebar>
      </Col>
      <Col :span="spanRight">
         <div class="f-layout-content">
          <div class="f-layout-content-main">
            <router-view></router-view>
          </div>
        </div> 
        <f-footer></f-footer>
      </Col>
    </Row>
  </div> -->
</template>

<script>
// eslint-disable
import Header from './Header'
import SideBar from './SideBar'
import Footer from './Footer'
// import Vue from 'vue'
// let events = new Vue({})
export default {
  name: 'app',
  components: {
    'f-sidebar': SideBar,
    'f-header': Header,
    'f-footer': Footer
  },
  data () {
    return {
      spanLeft: 5,
      spanRight: 19
    }
  },
  computed: {
    iconSize () {
      return this.spanLeft === 5 ? 14 : 24
    }
  },
  methods: {
    toggleClick () {
      // if (this.spanLeft === 5) {
      //   this.spanLeft = 2
      //   this.spanRight = 22
      // } else {
      //   this.spanLeft = 5
      //   this.spanRight = 19
      // }
    }
  }
}
</script>
<style lang="css">
    @import "../../assets/styles/user.css";
</style>
