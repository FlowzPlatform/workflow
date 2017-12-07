<template >
  <div>
    <div v-if="$route.params.id">
        divyesh prajpati {{ this.$route.params.id }}
    </div>
    <div v-else>
      <Row :gutter="16">
        <Col :xs="12" :sm="6" v-for="flowzitem in flowzList" v-bind:key="flowzitem.id" style="padding-bottom:15px">
            <router-link :to="'list/' + flowzitem.id">
              <div class="widget info-widget no-header" >
                <div class="widget-body">
                  <div class="info-widget-inner">
                    <div class="stats">
                      <!-- <div class="stats-number">
                        <Icon type="arrow-up-c" :size="30" :color="'#4ae387'" style="padding-right:5px;"></Icon>59
                      </div> -->
                      <div class="stats-title">{{flowzitem.ProcessName}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </router-link>  
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import flowz from '@/api/flowz'
export default {
  name: 'Flowz',
  data () {
    return {
      flowzList: []
    }
  },
  methods: {
  },
  mounted () {
    if (this.$route.params.id) {
      console.log(this.$route.params.id)
      console.log('FlowzList', this.flowzList)
    } else {
      flowz.get()
      .then(response => {
        this.flowzList = response.data.data
        console.log('this.flowzList', this.flowzList)
      })
      .catch(error => {
        console.log(error)
      })
    }
  }
}
</script>