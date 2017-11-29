<template>
  <div>
    <Row type="flex">
      <i-col v-if="$store.state.sidenavtoggle" :span="5" :style="styles">
        <f-sidebar></f-sidebar>
      </i-col>
      <i-col :span="contentSpan" style="z-index:1">
        <f-header></f-header>
        <div class="f-layout-content" @click="HandleSideNavToggel">
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
import Header from './Header'
import SideBar from './SideBar'
import Footer from './Footer'
export default {
  name: 'app',
  components: {
    'f-sidebar': SideBar,
    'f-header': Header,
    'f-footer': Footer
  },
  methods: {
    HandleSideNavToggel () {
      if (this.$store.state.sidenavtoggle && !this.$store.state.sidenavpin) {
        this.$store.state.sidenavtoggle = false
      }
    }
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
    }
  }
}
</script>