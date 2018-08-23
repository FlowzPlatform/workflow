<template>
  <div class="subscription">
    <Select v-model="subid" style="width:200px" @on-change="handleChange" filterable>
        <Option v-for="(item, key, inx) in packages" :value="key" :key="inx">{{ item.name }}</Option>
    </Select>
  </div>  
</template>
<script>
  import config from '../config'
  import axios from 'axios'
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
      console.log('Value', this.value)
      this.subid = this.value
      this.init()
    },
    methods: {
      init () {
        axios.get(config.loginURL + '/userdetails', {
          headers: {
            authorization: this.token
          }
        }).then(res => {
          // console.log('res', res.data.data)
          if (res.data.data.package) {
            this.packages = res.data.data.package
          } else {
            this.$Notice.error({title: 'No Subscription', desc: 'Please Buy Subscription!! <a href="https://dashboard.' + process.env.domainKey + '/" target="_blank">Click Here</a>', duration: 0})
          }
        }).catch(err => {
          // this.$Notice.error({title: 'Error'})
          console.log('Err', err)
        })
      },
      handleChange (value) {
        console.log('child value', value)
        // this.value = value
        this.subid = value
        this.$emit('on-change', value)
      }
    }
  }
</script>
<style scoped></style>
