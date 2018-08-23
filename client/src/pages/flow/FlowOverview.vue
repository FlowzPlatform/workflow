<template>
  <div class="FlowOverview">
    Flowz Overview
  </div>
</template>

<script>

export default {
  name: 'FlowOverview',
  props: {
  },
  data () {
    return {
      id: null
    }
  },
  component: {
  },
  methods: {
    init () {
      this.id = this.$route.params.id
    }
  },
  mounted () {
    this.init()
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
