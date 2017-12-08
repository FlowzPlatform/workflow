<template>
    <div>
      <Row>
        <Col span="12" style="padding-right:10px">
            <Select v-model="selected" filterable>
                <Option v-for="item in userList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
        </Col>
      </Row>  
    </div>
</template>
<script>
import config from '@/config'
export default {
  data () {
    return {
      userList: [],
      selected: ''
    }
  },
  mounted () {
    console.log(config.serverURI)
  }
}
</script>