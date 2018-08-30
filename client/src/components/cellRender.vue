<template>
  <div class="CellRender stageTuple">
  	<span :class="classObject(item.row, item.column.key)"></span>

    <!-- <div class="row">
      <div class="col-md-9">
        <span :title="getAgoActualStatus(item.row, item.column.key)" style="display: block;">
          <i class="fa fa-calendar fa-fw"></i>
          <small>{{ getAgoStatus(item.row, item.column.key) }}</small>
        </span>
        <span title="Duration" style="display: block;">
          <i class="fa fa-clock-o fa-fw"></i>
          <small>{{ getDuration(item.row, item.column.key) }} Hours</small>
        </span>
      </div>
      <div class="col-md-3">
        <img src="http://placehold.it/20x20" style="margin-top: 20px;">
      </div>
    </div> -->
        
    <span :title="getAgoActualStatus(item.row, item.column.key)" style="display: block;">
      <i class="fa fa-calendar fa-fw"></i>
      <small>{{ getAgoStatus(item.row, item.column.key) }}</small>
      <!-- <small>{{ items.createdAt | momentDate }}</small> -->
    </span>
    <span title="Duration" style="display: block;">
      <i class="fa fa-clock-o fa-fw"></i>
      <small>{{ getDuration(item.row, item.column.key) }} Hours</small>
    </span>

    <!-- <Tooltip :content="getUserHoverDetails(item.row, item.column.key)"> -->
      <img :title="getUserHoverDetails(item.row, item.column.key)" :src="getUserAvatar(item.row, item.column.key)" style="position: absolute; right: 0; top: 17px; border-radius: 50px; width: 20px;">
    <!-- </Tooltip> -->
    <!-- <span :title="getCompletedActualStatus(item.row, item.column.key)">
      <i class="fa fa-calendar fa-fw"></i>
      <small>{{ getCompletedStatus(item.row, item.column.key) }}</small>
      <!-- <small>{{ items.createdAt | momentDate }}</small> ->
    </span> -->

    <span class="showData" title="View Data">
      <i class="fa fa-info-circle" @click="showData(item.row, item.column.key)"></i>
    </span>
    <!-- <span class="showData" title="View Data">
      <Poptip title="Data Entered">
        <i class="fa fa-info-circle" @click="getPopTipData(item.row, item.column.key)"></i>
        <div class="api" slot="content">
          <div v-if="currentPopTipData != null">
            <span v-for="(dataitems, key, index) in currentPopTipData">
              <div v-if="index < 5">
                {{key}} : {{dataitems}} <br>
              </div>
              <div v-if="index == 6">
                <Button style="margin: 5px 0" @click="goToDetailView(item.row, item.column.key)">View More</Button>
              </div>
            </span>
          </div> 
          <div v-else>
            <small>{{loadingText}}</small>
          </div>
        </div>
      </Poptip>
    </span> -->

    <Modal
        v-model="dataModal"
        title="Data"
        @on-ok="ok"
        width="1000"
        @on-cancel="cancel">
        <!-- <small>{{loadingText}}</small> -->
        <div v-if="currentPopTipData != null">
          <span v-for="(dataitems, key, index) in currentPopTipData">
            <div v-if="index < 10">
              {{key}} : {{dataitems}} <br>
            </div>
            <!-- <div v-if="index == 10">
              <Button style="margin: 5px 0" @click="goToDetailView(item.row, item.column.key)">View More</Button>
            </div> -->
          </span>
        </div> 
        <div v-else>
          <small>{{loadingText}}</small>
        </div>
    </Modal>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import flowzdataModal from '@/api/flowzdata'

export default {
  name: 'CellRender',
  props: {
    item: {
      type: Object
    }
  },
  data () {
    return {
      dataModal: false,
      currentPopTipObj: null,
      currentPopTipData: null,
      loadingText: 'Loading...'
    }
  },
  component: {
  },
  methods: {
    ok () {
    },
    cancel () {
    },
    classObject (items, type) {
      if (type === items.currentStatus) {
        return { 'currentTask': true }
      } else if (_.findIndex(items.stageReference, {StageName: type}) !== -1) {
        return { 'completedTask': true }
      } else {
        return { 'pendingTask': true }
      }
    },
    getAgoActualStatus (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      if (obj) {
        return ('Started at: ' + moment(obj.createdAt).format('MMMM Do YYYY, h:mm:ss a'))
      } else {
        return ('NA')
      }
    },
    getAgoStatus (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      if (obj) {
        return moment(obj.createdAt).fromNow()
      } else {
        return ('NA')
      }
    },
    getDuration (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      // console.log('Object created at : ', obj)
      if (obj) {
        let x = moment(obj.createdAt)
        let y = moment(obj.completedAt)
        return y.diff(x, 'hours')
      } else {
        return ('NA')
      }
    },
    getUserAvatar (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      if (obj) {
        return obj.user.avatar
      } else {
        return 'https://forums.roku.com/styles/canvas/theme/images/no_avatar.jpg'
      }
    },
    getUserHoverDetails (items, type) {
      let obj = _.find(items.stageReference, {StageName: type})
      if (obj) {
        return ('Name: ' + obj.user.name + '\nEmail: ' + obj.user.email + '\nRole: ' + obj.user.role)
      } else {
        return 'NA'
      }
    },
    async showData (items, type) {
      this.$Spin.show()
      this.currentPopTipData = null
      this.loadingText = 'Loading...'
      let obj = await _.find(items.stageReference, {StageName: type})
      if (obj) {
        this.currentPopTipObj = obj
        await flowzdataModal.get(null, {
          id: this.currentPopTipObj.stageRecordId
        }).then((resData) => {
          this.currentPopTipData = resData.data[0].data
          this.dataModal = true
          this.$Spin.hide()
        }).catch((err) => {
          console.log('err: ', err)
        })
      } else {
        // this.dataModal = true
        this.$Spin.hide()
        this.currentPopTipData = null
        this.loadingText = 'No Data...'
        this.$Message.error('No Data...')
      }
    },
    // async getPopTipData (items, type) {
    //   this.currentPopTipData = null
    //   this.loadingText = 'Loading...'
    //   let obj = await _.find(items.stageReference, {StageName: type})
    //   if (obj) {
    //     this.currentPopTipObj = obj
    //     await flowzdataModal.get(null, {
    //       id: this.currentPopTipObj.stageRecordId
    //     }).then((resData) => {
    //       this.currentPopTipData = resData.data[0].data
    //     }).catch((err) => {
    //       console.log('err: ', err)
    //     })
    //   } else {
    //     this.currentPopTipData = null
    //     this.loadingText = 'No Data'
    //   }
    // },
    goToDetailView (instance, task) {
      // this.$router.push('/admin/schemaview/' + instance.id + '/' + task.id)
    }
  },
  mounted () {
    // console.log('Data: ', this.item)
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.currentTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 3px;
  background-color: #FF0000;
  margin-top: 2px;
}

.completedTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 3px;
  background-color: #00FF00;
  margin-top: 2px;
  margin-left: 11px;
}

.pendingTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 3px;
  background-color: #DADADA;
  margin-top: 2px; 
}

.showData {
  position: absolute;
  right: 4px;
  top: 5px;
}

.showData i {
  color: #00d8ff;
  cursor: pointer;
  display: none;
}

.stageTuple {
  position: relative;
} 

.stageTuple:hover > .showData i{
  display: table-cell;
}
</style>
