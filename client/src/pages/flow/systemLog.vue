<template>
  <div class="flow">
    <h1>hello</h1>
  </div>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  mounted () {
    console.log('mounted call', this.$route.params.id)
  },
  methods: {
  }
}
</script>