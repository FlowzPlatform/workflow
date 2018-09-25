<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  mounted () {
  },
  feathers: {
    'schema': {
      created (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      },
      updated (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      },
      removed (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      }
    },
    'flowz': {
      created (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      },
      updated (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
        this.$store.state.registerRoles = null
        this.$store.state.registerRoles = {}
        this.$store.state.registerResources = null
        this.$store.state.registerResources = {}
      },
      removed (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      }
    },
    'emailtemplate': {
      created (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      },
      updated (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      },
      removed (data) {
        this.$store.state.Cache = null
        this.$store.state.Cache = {}
      }
    }
  }
}
</script>


