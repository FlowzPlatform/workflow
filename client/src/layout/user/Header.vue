<template>
    <Menu mode="horizontal" :theme="'primary'">
        <Row type="flex">
        <Col :span="1" v-if="toggeleEnable">
            <Row type="flex" justify="end" align="middle">
              <span @click="$store.state.sidenavtoggle = !$store.state.sidenavtoggle">
                <Icon type="navicon-round" :size="32" style="line-height: inherit;cursor:pointer"></Icon>
              </span>
            </Row>
        </Col>
        <i-col :span="5">
            <div class="f-logo">
                <img src="../../assets/images/Flowz-logo.png">
            </div>
        </i-col>
        <!-- <i-col :span="5" class="logo">
            <div class="f-logo">
                <Icon type="navicon-round" :size="30"></Icon>  
                <img src="../../assets/images/Flowz-logo.png">
            </div>
        </i-col> -->
        <i-col :span="18">
            <Row type="flex" justify="end">
                <div class="layout-nav">
                    
                    <Menu-item name="1">
                      <Submenu name="1">
                        <template slot="title">
                          <Icon type="person" :size="16"></Icon>
                          Krunal Mahera
                        </template>
                        <Menu-item name="1-1">
                            <a>
                                <Icon type="ios-locked-outline" :size="16"></Icon>
                                Logout
                            </a>
                        </Menu-item>
                    </Submenu>
                    </Menu-item>
                </div>
                </Row>
        </i-col>
        </Row>
      </Col>
      <!-- <i-col :span="5" class="logo">
        <div class="f-logo">
          <Icon type="navicon-round" :size="30"></Icon>  
          <img src="../../assets/images/Flowz-logo.png">
        </div>
      </i-col> -->
      <i-col :span="18">
        <Row type="flex" justify="end">
          <div class="layout-nav">
            <Menu-item name="1">
              <Submenu name="1">
                <template slot="title">
                  <Icon type="person" :size="16"></Icon>
                  Kavi Bhavsar
                </template>
                <Menu-item name="1-1">
                  <a @click="handleRemove()">
                    <Icon type="ios-locked-outline" :size="16"></Icon>
                    Logout
                  </a>
                </Menu-item>
              </Submenu>
            </Menu-item>
          </div>
        </Row>
      </i-col>
    </Row>
  </Menu>
</template>

<script>
/*eslint-disable*/
  export default {
    computed: {
      toggeleEnable () {
        return !this.$store.state.sidenavpin || (!this.$store.state.sidenavtoggle)
      }
    }
  }
</script>

