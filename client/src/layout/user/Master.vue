<template>
  <div class="layout" :class="{'layout-hide-text': spanLeft < 5}">
    <f-header></f-header>
    <Row type="flex">
       <Col :span="spanLeft" class="layout-menu-left">
        <f-sidebar></f-sidebar>
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
<style scoped>
    .ivu-menu-primary {
      background: #363636
    }
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .layout-breadcrumb{
        padding: 10px 15px 0;
    }
    .layout-content{
        min-height: 200px;
        margin: 15px;
        overflow: hidden;
        background: #fff;
        border-radius: 4px;
    }
    .layout-content-main{
        padding: 10px;
    }
    .layout-copy{
        text-align: center;
        padding: 10px 0 20px;
        color: #9ea7b4;
    }
    .layout-menu-left{
        background: #464c5b;
    }
    .layout-header{
        height: 60px;
        background: #fff;
        box-shadow: 0 1px 1px rgba(0,0,0,.1);
    }
    .layout-logo-left{
        width: 90%;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        margin: 15px auto;
    }
    .layout-ceiling-main a{
        color: #9ba7b5;
    }
    .layout-hide-text .layout-text{
        display: none;
    }
    .ivu-col{
        transition: width .2s ease-in-out;
    }

  
</style>
