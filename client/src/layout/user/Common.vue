<template>
  <div class="layout">
    <Row type="flex">
      <i-col :span="contentSpan" style="z-index:1">
         <f-header></f-header>
         <div class="f-layout-content">
          <div class="f-layout-content-main">
            <router-view></router-view>
          </div>
        </div> 
        <f-footer></f-footer>
      </i-col>
    </Row>  
  </div>  
</template>

<script>
// eslint-disable
import Header from './CommonHeader'
import Footer from './Footer'
// import Vue from 'vue'
// let events = new Vue({})
export default {
  name: 'app',
  components: {
    'f-header': Header,
    'f-footer': Footer
  },
  data () {
  },
  computed: {
    iconSize () {
      return this.spanLeft === 5 ? 14 : 24
    },
    contentSpan () {
      return this.$store.state.sidenavtoggle && this.$store.state.sidenavpin ? 24 : 24
    }
  },
  methods: {
  }
}
</script>
<!-- <style lang="css">
    @import "../../assets/styles/user.css";
</style> -->
