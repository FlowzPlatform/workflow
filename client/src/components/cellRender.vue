<template>
  <div class="CellRender stageTuple" :class="classObject(item)">
    <!-- <div class="CellRender stageTuple" :class="classObject(item.row, item.column.key)"> -->
  	<!-- <span :class="classObject(item.row, item.column.key)"></span> -->

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
    <span v-if="item.obj != null && item.isCompletedTask == true" :title="getAgoActualStatus(item.obj.createdAt)" style="display: block;">
      <i class="fa fa-calendar fa-fw"></i>
      <small>{{getAgoStatus(item.obj.createdAt)}}</small>
    </span>

    <span v-if="item.obj != null && item.isCompletedTask == false && item.isCurrentTask == true" :title="getAgoActualStatus(item.obj.completedAt)" style="display: block;">
      <i class="fa fa-calendar fa-fw"></i>
      <!-- {{item.obj}} -->
      <small>{{getAgoStatus(item.obj.completedAt)}}</small>
    </span>

    <span v-if="item.obj != null && item.isCompletedTask == true" title="Duration" style="display: block;">
      <i class="fa fa-clock-o fa-fw"></i>
      <small>{{ getDuration(item.obj.createdAt, item.obj.completedAt) }} Hours</small>
    </span>

    <span v-if="item.obj != null && item.isCompletedTask == false" title="Duration" style="display: block;">
      <i class="fa fa-clock-o fa-fw"></i>
      <small>{{ getDuration(item.obj.completedAt) }} Hours</small>
    </span>

    <img v-if="item.obj != null && item.isCompletedTask == true" :title="getUserHoverDetails(item)" :src="getUserAvatar(item)" class="avatarImg" alt="User Avatar">
    
    <!-- <span :title="getCompletedActualStatus(item.row, item.column.key)">
      <i class="fa fa-calendar fa-fw"></i>
      <small>{{ getCompletedStatus(item.row, item.column.key) }}</small>
      <!- <small>{{ items.createdAt | momentDate }}</small> ->
    </span> -->

    <span v-if="item.obj != null && item.isCompletedTask == true" class="showData" title="View Data">
      <i class="fa fa-info-circle" @click="showData(item)"></i>
    </span>

    <Modal
        v-model="dataModal"
        title="Data"
        @on-ok="ok"
        width="1000"
        @on-cancel="cancel">
        <div v-if="currentPopTipData != null">
          <schemasubformview ref="schemasubformview" :schemainstance="schemainstance" id="schemasubformview"></schemasubformview>
        </div> 
        <div v-else>
          <small>{{loadingText}}</small>
        </div>
        <div slot="footer">
            <Button @click="ok">Close</Button>
        </div>
    </Modal>
  </div>
</template>

<script>
// import _ from 'lodash'
import moment from 'moment'
import flowzdataModal from '@/api/flowzdata'
import schemaModel from '@/api/schema'
import SchemaSubFormView from './SchemaSubFormView'

export default {
  name: 'CellRender',
  props: ['item', 'schemaId'],
  data () {
    return {
      dataModal: false,
      currentPopTipObj: null,
      currentPopTipData: null,
      loadingText: 'Loading...',
      schemainstance: {
        data: [],
        entity: []
      }
    }
  },
  components: {
    'schemasubformview': SchemaSubFormView
  },
  filters: {
    getAgoStatus (item) {
      return moment(item).fromNow()
    }
  },
  methods: {
    ok () {
      this.dataModal = false
    },
    cancel () {
    },
    classObject (item) {
      // console.log('item: ', item)
      if (item.isCurrentTask === true && item.isCompletedTask === false) {
        return { 'currentTask': true }
      } else if (item.isCurrentTask === false && item.isCompletedTask === true) {
        return { 'completedTask': true }
      } else {
        return { 'pendingTaskk': true }
      }
    },
    getAgoActualStatus (item) {
      return ('Started at: ' + moment(item).format('MMMM Do YYYY, h:mm:ss a'))
    },
    getAgoStatus (item) {
      return moment(item).fromNow()
    },
    getDuration (x, y) {
      if (y) {
        let x1 = moment(x)
        let y1 = moment(y)
        return y1.diff(x1, 'hours')
      } else {
        let x1 = moment(x)
        let y1 = moment()
        return y1.diff(x1, 'hours')
      }
    },
    getUserAvatar (item) {
      if (item.obj.user.avatar) {
        return item.obj.user.avatar
      } else {
        return ('https://www.sigmanest.com/wp-content/uploads/2017/11/Dummy.jpg')
      }
    },
    getUserHoverDetails (item) {
      if (item.obj.user.name && item.obj.user.email && item.obj.user.role) {
        return ('Name: ' + item.obj.user.name + '\nEmail: ' + item.obj.user.email + '\nRole: ' + item.obj.user.role)
      } else {
        return ('User details not available.')
      }
    },
    async showData (item) {
      this.$Spin.show()
      this.currentPopTipData = null
      this.loadingText = 'Loading...'
      let obj = item.obj
      if (obj) {
        this.currentPopTipObj = obj
        await flowzdataModal.get(null, {
          id: this.currentPopTipObj.stageRecordId
        }).then(async (resData) => {
          this.currentPopTipData = resData.data[0].data
          await schemaModel.get(this.schemaId).then(async schemaRes => {
            this.schemainstance.entity = schemaRes.data.entity
            for (let [index, entity] of this.schemainstance.entity.entries()) {
              if (entity.customtype) {
                this.schemainstance.entity[index]['entity'] = await this.getChildEntity(entity.type)
              }
            }
            this.schemainstance.data.push(this.currentPopTipData)
            this.dataModal = true
            this.$Spin.hide()
          }).catch(err => {
            console.log('Error: ', err)
            this.$Spin.hide()
          })
        }).catch((err) => {
          console.log('err: ', err)
          this.$Spin.hide()
        })
      } else {
        this.$Spin.hide()
        this.currentPopTipData = null
        this.loadingText = 'No Data...'
        this.$Message.error('No Data...')
      }
    },
    async getChildEntity (id) {
      // alert('entity')
      var self = this
      var res = []
      // var _res = await axios.get('https://api.flowzcluster.tk/eng/schema/' + id).catch(function (error) { console.log(error) })
      let _res = await schemaModel.get(id).catch(err => {
        console.log('err', err)
      })
      for (let [index, entity] of _res.data.entity.entries()) {
        if (entity.customtype) {
          _res.data.entity[index]['entity'] = await self.getChildEntity(entity.type)
        }
      }
      res.push(_res.data)
      return res
    }
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
  },
  mounted () {
    // console.log('this.item: ', this.item)
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.currentTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 40px;
  background-color: #FFC5CF;
  /*margin-top: 2px;*/
}

.completedTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 40px;
  background-color: #BCEDC7;
  /*margin-top: 2px;*/
  /*margin-left: 11px;*/
  border-radius: 0;
  padding: 0 5px;
}

.pendingTask{
  display: block;
  position: relative;
  min-width: 100%;
  min-height: 40px;
  background-color: #B7D9FD;
  /*margin-top: 2px; */
}

.showData {
  position: absolute;
  right: 4px;
  top: 5px;
}

.showData i {
  color: #000000;
  cursor: pointer;
  display: none;
}

.stageTuple {
  position: relative;
} 

.stageTuple:hover > .showData i{
  display: table-cell;
}

.avatarImg {
  position: absolute; 
  right: 5px; 
  top: 17px; 
  border-radius: 50px; 
  width: 20px;
}
</style>
