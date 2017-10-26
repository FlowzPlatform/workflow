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
      editableTabsValue2: '1',
      editableTabs2: [{
        title: 'Tab 1',
        name: '1',
        content: 'Tab 1 content'
      }],
      tabIndex: 1
    }
  },
  computed: {
    tabdata () {
      console.log('this.$store.getters.TabData', this.$store.getters.TabData)
      return this.$store.getters.TabData
    },
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
  },
  methods: {
    addTab (targetName) {
      console.log('this.$store.getters.TabData ready', this.$store.getters.TabData)
      // console.log('Called.........')
      let newTabName = ++this.tabIndex + ''
      this.editableTabs2.push({
        title: 'New Tab',
        name: newTabName,
        content: 'New Tab content' + newTabName
      })
      this.editableTabsValue2 = newTabName
    },
    removeTab (targetName) {
      let tabs = this.editableTabs2
      let activeName = this.editableTabsValue2
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue2 = activeName
      this.editableTabs2 = tabs.filter(tab => tab.name !== targetName)
    },
    HandleSideNavToggel () {
      if (this.$store.state.sidenavtoggle && !this.$store.state.sidenavpin) {
        this.$store.state.sidenavtoggle = false
      }
    }
  }
}
</script>
<style>
    /*.f-layout-content{
        margin: 0px;
    }
    .f-layout-content-main {
        padding:0px;
    }*/
</style>

<!-- <template>
  <div>
    <f-header></f-header>
    <Row type="flex">
      <i-col :span="5">
        <f-sidebar></f-sidebar>
      </i-col>
      <i-col :span="19">
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
import Header from './Header'
import SideBar from './SideBar'
import Footer from './Footer'
export default {
  name: 'app',
  components: {
    'f-sidebar': SideBar,
    'f-header': Header,
    'f-footer': Footer
  }
}
</script> -->
