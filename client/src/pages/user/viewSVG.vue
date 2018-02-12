<template >
  <div class="view-svg">
    <div v-html="svgStr"></div>
  </div>
</template>
<script>
export default {
  name: 'view-svg',
  props: {
    svgStr: String
  }
}
</script>
<style>
  .view-svg {
    margin: 8px 0px;
  }
  .view-svg > div > svg {
    width: 100%;
    height: 100%
  }
</style>