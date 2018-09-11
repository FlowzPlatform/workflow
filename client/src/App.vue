<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  mounted () {
    // this.$store.state.schema = []
    // this.$store.dispatch('getSchema')
    // this.$store.state.flowz = []
    // this.$store.dispatch('getFlowzdata')
  }
}
</script>


