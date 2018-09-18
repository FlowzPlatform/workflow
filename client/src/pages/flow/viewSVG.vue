<template >
 <div class="text-center">
    <div class="rounded" v-html="svgStr"></div>
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
 .view-svg > div > svg {
     /* margin: auto;
  width: 233px;
  height: 74px;
  vertical-align: middle;
  padding: 10px;
  background: #29A3D8;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  font-family: lato-bold;
  font-size: 17px;
  color: white; */
    /* width: 400px;
    height: 400px; */
    /* margin: auto; */
    /* width: 233px; */
    /* height: 74px; */
     /* position: absolute; */
   /* transform: translateY(50%); or translateX(50%) -  */
   /* transform: translateY(-50%); translateX(-50%) */
    /* vertical-align: middle; */
    /* display: inline; */
    /* glyph-orientation-horizontal : center; */
    /* -ms-text-combine-horizontal: middle; */
    /* horizontal-align: middle;  */
     /* align-items: center;
     
    justify-content: center; */
    /* padding: 10px; */
    /* background: #29A3D8; */
    /* -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    font-family: lato-bold;
    font-size: 17px;
    color: white; */
    /* display: inline; */
    /* text-align: center; */
  }
</style>