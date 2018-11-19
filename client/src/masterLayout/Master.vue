<template>
  <div class="layout">
    <Row type="flex">
      <i-col v-if="$store.state.sidenavtoggle" :span="5" :style="styles">
        <f-sidebar></f-sidebar>
      </i-col>
      <i-col :span="24">
        <f-header></f-header>
      </i-col>
      <i-col :span="contentSpan" style="z-index:1" :offset="contentOffset">
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
export default {
  name: 'app',
  components: {
    'f-sidebar': (resolve) => { require(['./SideBar'], resolve) },
    'f-header': (resolve) => { require(['./Header'], resolve) },
    'f-footer': (resolve) => { require(['./Footer'], resolve) }
  },
  data () {
    return {}
  },
  computed: {
    styles () {
      let style = {}
      if (this.$store.state.sidenavtoggle && !this.$store.state.sidenavtoggle || !this.$store.state.sidenavpin) {
        style.position = 'fixed'
        style['z-index'] = '99'
        style.height = '100%'
        style.background = '#363e4f'
      }
      return style
    },
    contentSpan () {
      return this.$store.state.sidenavtoggle && this.$store.state.sidenavpin ? 19 : 24
    },
    contentOffset () {
      return this.$store.state.sidenavtoggle && this.$store.state.sidenavpin ? 5 : 0
    }
  },
  methods: {
  },
  mounted () {
  }
}
</script>
<!-- <style lang="css">
    @import "../../assets/styles/user.css";
</style> -->
<style lang="less">
    @import "../assets/styles/index.less";
</style>