<template>
    <Menu mode="horizontal" :theme="'primary'">
        <Row type="flex">
        <Col :span="1" v-if="toggeleEnable">
            <Row type="flex" justify="end" align="middle">
              <span>
                <Icon type="navicon-round" :size="32" style="line-height: inherit;cursor:pointer"></Icon>
              </span>
            </Row>
        </Col>
        <i-col :span="5" class="logo">
            <div class="f-logo">
                <Icon type="navicon-round" :size="30"></Icon>  
                <img src="../../assets/images/Flowz-logo.png">
            </div>
        </i-col>
        <i-col :span="18">
            <Row type="flex" justify="end">
                <div class="layout-nav">
                    <Menu-item name="1">
                        <router-link to="/approval">
                            <Icon type="filing" :size="14"></Icon>
                            Approval
                        </router-link>
                    </Menu-item>
                    <Menu-item name="2">
                        <router-link to="/schema">
                            <Icon type="filing" :size="14"></Icon>
                            Schema
                        </router-link>
                    </Menu-item>
                    <Menu-item name="3">
                        <router-link to="/flow">
                            <Icon type="network" :size="14"></Icon>
                            Flow
                        </router-link>
                    </Menu-item>
                    <Menu-item name="4">
                        <router-link to="/DbSettings">
                            <Icon type="gear-b" :size="14"></Icon>
                            Db-settings
                        </router-link>
                    </Menu-item>
                    <Menu-item name="5">
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
    </Menu>
</template>
