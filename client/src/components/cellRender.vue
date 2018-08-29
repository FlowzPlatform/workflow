<template>
  <div class="CellRender stageTuple">
  	<span :class="classObject(item.row, item.column.key)"></span>

    <span :title="getAgoActualStatus(item.row, item.column.key)">
      <i class="fa fa-calendar fa-fw"></i>
      <small>{{ getAgoStatus(item.row, item.column.key) }}</small>
      <!-- <small>{{ items.createdAt | momentDate }}</small> -->
    </span>

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
        return moment(obj.createdAt).format('MMMM Do YYYY, h:mm:ss a')
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
}

.pendingTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 3px;
  background-color: #EEEEEE;
  margin-top: 2px; 
}

.showData {
  position: absolute;
  right: 0px;
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
