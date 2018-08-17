<template>
  <div class="Analytics">
  	<h3 class="card">Analytics: {{ flowName }}</h3>
    <div>
      <table class="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Instance</th>
            <th v-for="(items, index) in tableHeaders" v-if="items.type != 'start' && items.type != 'endevent' && items.type != 'intermediatethrowevent'">
              <span>{{items.name}}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(items, index) in tableData">
            <td>
              {{items.id}}
              <span class="label label-info" style="float: right;" v-if="items.mainStatus == 'inprocess'">{{titleCase(items.mainStatus)}}</span>
              <span class="label label-success" style="float: right;" v-if="items.mainStatus == 'completed'">{{titleCase(items.mainStatus)}}</span>
            </td>
            <!-- <td v-for="(headerItem, headerIndex) in tableHeaders" v-if="headerItem.type != 'start' && headerItem.type != 'endevent' && headerItem.type != 'intermediatethrowevent'" :class="{ redCell : (items.currentStatus == headerItem.id) }"> -->
              <!-- <span v-if="items.currentStatus == headerItem.id"><span class="currentTask"></span></span> -->
              <!-- <span>{{headerItem.id}}</span> -->
              <td v-for="(headerItem, headerIndex) in tableHeaders" v-if="headerItem.type != 'start' && headerItem.type != 'endevent' && headerItem.type != 'intermediatethrowevent'">
                <span :class="classObject(items, headerItem.id)"></span>    
                <!-- <span v-if="items.currentStatus == headerItem.id" class="currentTask"></span> -->
                <!-- <span v-else class="pendingTask"></span> -->
                <!-- <span v-for="(task, index) in items.stageReference"> -->
                  <!-- <span v-if="task.StageName == headerItem.id" class="completedTask"></span> -->
                <!-- </span> -->
                <!-- <span v-if="items.stageReference.length == 0 && items.currentStatus != headerItem.id" class="pendingTask"></span> -->
              </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import flowzModel from '@/api/flowz'
import finstanceModel from '@/api/finstance'
// import $ from 'jquery'
import _ from 'lodash'

export default {
  name: 'Analytics',
  props: {
    options: {
      type: Object
    }
  },
  data () {
    return {
      id: null,
      flowName: null,
      tableData: [],
      tableHeaders: [],
      currentFlowzJson: null
    }
  },
  component: {
  },
  methods: {
    titleCase: function (str) {
      return str.replace(/\w+/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
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
    async init () {
      // this.$Spin.show({
      //   render: (h) => {
      //     return h('div', [
      //       h('Icon', {
      //         'class': 'demo-spin-icon-load',
      //         props: {
      //           type: 'ios-loading',
      //           size: 18
      //         }
      //       }),
      //       h('div', 'Loading')
      //     ])
      //   }
      // })
      this.$Spin.show()
      this.id = this.$route.params.id
      await flowzModel.get(null, {
        id: this.id,
        $paginate: false
      }).then(res => {
        this.flowName = res.data[0].ProcessName
        console.log('Flow Response: ', res)
        this.currentFlowzJson = res.data[0].json
        this.tableHeaders = this.currentFlowzJson.processList
      }).catch(err => {
        console.error('Error: ', err)
      })

      // get all instances of selected flow
      await finstanceModel.get(null, {
        fid: this.id,
        $paginate: false
      }).then(response => {
        console.log('Instances Response: ', response.data)
        this.tableData = response.data
        // for (let i = 0; i < response.data.data.length; i++) {
        //   let instances = {
        //     instance: response.data.data[i].fid
        //   }
        //   this.tableData.push(instances)

        //   this.tableHeaders = response.data.data[i].processList
        // }
        // console.log('tableData: ', this.tableData)
      }).catch(err => {
        this.$Notice({duration: '3', title: 'Network Error', desc: ''})
        console.error(err)
      })
      this.$Spin.hide()
      // console.log('table data: ', JSON.stringify(this.tableData))
      // console.log('table headers: ', JSON.stringify(this.tableHeaders))
      // $('.redCell').prevUntil('tr').addClass('greenCell')
      // $('.redCell').nextUntil('tr').addClass('grayCell')
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route.params.id': function (newValue, oldValue) {
      this.init()
    }
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

  .grayCell {
    background-color: #eee;
  }

  .redCell {
    background-color: #FF8791
  }

  .greenCell {
    background-color: #93DE87;
  }

  tbody tr td:first-child {
    background-color: transparent;
    width: 350px;
  }

  .label{
    font-size: 12px;
  }
  thead tr{
    background-color: #292929;
    color: #FFF;
  }

  table{
    box-shadow: 2px 2px 10px #dadada;
    background-color: #fff;
    max-height: 80vh;
    overflow-y: auto;
    /*margin: 10px 0;*/
    /*padding: 20px;*/
  }

  .card{
    box-shadow: 2px 2px 10px #dadada;
    background-color: #fff;
    margin: 10px 0;
    padding: 20px;
  }
</style>
<style>
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
</style>
