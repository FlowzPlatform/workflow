<template>
  <div class="subscription">
    <Select v-model="subid" style="min-width:300px" @on-change="handleChange" filterable>
        <Option v-for="(item, key, inx) in packages" :value="key" :key="inx">{{ item.name }}</Option>
    </Select>
  </div>  
</template>
<script>
  export default {
    name: 'subscription',
    props: {
      token: String,
      value: String
    },
    data () {
      return {
        subid: '',
        packages: null
      }
    },
    mounted () {
      this.subid = this.value
      this.init()
    },
    methods: {
      init () {
        (this.$store.state.user !== null && this.$store.state.user !== undefined) ? (this.$store.state.user.package) ? this.packages = this.$store.state.user.package : this.$Notice.error({title: 'No Subscription', desc: 'Please Buy Subscription!! <a href="https://dashboard.' + process.env.domainKey + '/" target="_blank">Click Here</a>', duration: 0}) : this.$router.push('/login')
      },
      handleChange (value) {
        this.subid = value
        this.$emit('on-change', value)
      }
    }
  }
</script>
<style scoped></style>
