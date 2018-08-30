<template>
  <div class="dashboard">
    Dashboard {{$store.state.role}}
    <div v-if="$store.state.role === 1">

      <div class="row">
        <div class="col-md-3">
          <div class="card-counter primary">
            <i class="fa fa-code-fork"></i>
            <span class="count-numbers">{{countFlowz}}</span>
            <span class="count-name">Flowz</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter danger">
            <i class="fa fa-ticket"></i>
            <span class="count-numbers">{{countInstances}}</span>
            <span class="count-name">Instances</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter success">
            <i class="fa fa-database"></i>
            <span class="count-numbers">{{countData}}</span>
            <span class="count-name">Data</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-counter info">
            <i class="fa fa-users"></i>
            <span class="count-numbers">{{countUsers}}</span>
            <span class="count-name">Users</span>
          </div>
        </div>
      </div>
      <!-- <div class="row">
        <div id="chartContainer" style="height: 370px; width: 100%;"></div>
        <button class="btn " id="backButton" @click="backButton">&lt; Back</button>
      </div> -->
    </div>
  </div>
</template>

<script>

import flowzModel from '../api/flowz'
import finstanceModel from '../api/finstance'
import flowzDataModel from '../api/flowzdata'

export default {
  name: 'dashboard',
  data () {
    return {
      countFlowz: null,
      countInstances: null,
      countData: null,
      countUsers: null,
      // chart: {
      totalVisitors: 883000,
      visitorsData: {
        "New vs Returning Visitors": [{
          click: this.visitorsChartDrilldownHandler,
          cursor: "pointer",
          explodeOnClick: false,
          innerRadius: "75%",
          legendMarkerType: "square",
          name: "New vs Returning Visitors",
          radius: "100%",
          showInLegend: true,
          startAngle: 90,
          type: "doughnut",
          dataPoints: [
            { y: 519960, name: "New Visitors", color: "#E7823A" },
            { y: 363040, name: "Returning Visitors", color: "#546BC1" }
          ]
        }],
        "New Visitors": [{
          color: "#E7823A",
          name: "New Visitors",
          type: "column",
          dataPoints: [
            { x: new Date("1 Jan 2015"), y: 33000 },
            { x: new Date("1 Feb 2015"), y: 35960 },
            { x: new Date("1 Mar 2015"), y: 42160 },
            { x: new Date("1 Apr 2015"), y: 42240 },
            { x: new Date("1 May 2015"), y: 43200 },
            { x: new Date("1 Jun 2015"), y: 40600 },
            { x: new Date("1 Jul 2015"), y: 42560 },
            { x: new Date("1 Aug 2015"), y: 44280 },
            { x: new Date("1 Sep 2015"), y: 44800 },
            { x: new Date("1 Oct 2015"), y: 48720 },
            { x: new Date("1 Nov 2015"), y: 50840 },
            { x: new Date("1 Dec 2015"), y: 51600 }
          ]
        }],
        "Returning Visitors": [{
          color: "#546BC1",
          name: "Returning Visitors",
          type: "column",
          dataPoints: [
            { x: new Date("1 Jan 2015"), y: 22000 },
            { x: new Date("1 Feb 2015"), y: 26040 },
            { x: new Date("1 Mar 2015"), y: 25840 },
            { x: new Date("1 Apr 2015"), y: 23760 },
            { x: new Date("1 May 2015"), y: 28800 },
            { x: new Date("1 Jun 2015"), y: 29400 },
            { x: new Date("1 Jul 2015"), y: 33440 },
            { x: new Date("1 Aug 2015"), y: 37720 },
            { x: new Date("1 Sep 2015"), y: 35200 },
            { x: new Date("1 Oct 2015"), y: 35280 },
            { x: new Date("1 Nov 2015"), y: 31160 },
            { x: new Date("1 Dec 2015"), y: 34400 }
          ]
        }]
      },
      // },
      newVSReturningVisitorsOptions: {
        animationEnabled: true,
        theme: "light2",
        title: {
          text: "New VS Returning Visitors"
        },
        subtitles: [{
          text: "Click on Any Segment to Drilldown",
          backgroundColor: "#2eacd1",
          fontSize: 16,
          fontColor: "white",
          padding: 5
        }],
        legend: {
          fontFamily: "calibri",
          fontSize: 14,
          itemTextFormatter: (e) => {
            return e.dataPoint.name + ": " + Math.round(e.dataPoint.y / this.totalVisitors * 100) + "%";  
          }
        },
        data: []
      },
       visitorsDrilldownedChartOptions: {
        animationEnabled: true,
        theme: "light2",
        axisX: {
          labelFontColor: "#717171",
          lineColor: "#a2a2a2",
          tickColor: "#a2a2a2"
        },
        axisY: {
          gridThickness: 0,
          includeZero: false,
          labelFontColor: "#717171",
          lineColor: "#a2a2a2",
          tickColor: "#a2a2a2",
          lineThickness: 1
        },
        data: []
      },
      chart: null
    }
  },
  methods: {
    init () {
      flowzModel.get(null, {})
      .then((res) => { 
        this.countFlowz = res.data.total 
      })
      
      finstanceModel.get(null, {})
      .then((res) => { 
        this.countInstances = res.data.total 
      })

      flowzDataModel.get(null, {})
      .then((res) => { 
        console.log('resp data:', res)
        this.countData = res.total 
      })
    },
    visitorsChartDrilldownHandler(e) {
      this.chart = new CanvasJS.Chart("chartContainer", this.visitorsDrilldownedChartOptions);
      this.chart.options.data = this.visitorsData[e.dataPoint.name];
      this.chart.options.title = { text: e.dataPoint.name }
      this.chart.render();
      // $("#backButton").toggleClass("invisiblex")
    },
    backButton () {
      this.chart = new CanvasJS.Chart("chartContainer", this.newVSReturningVisitorsOptions);
      this.chart.options.data = this.visitorsData["New vs Returning Visitors"];
      this.chart.render()
    }
  },
  mounted () {
    this.init()
    this.chart = new CanvasJS.Chart("chartContainer", this.newVSReturningVisitorsOptions);
    this.chart.options.data = this.visitorsData["New vs Returning Visitors"];
    this.chart.render();
  }
}
</script>
<style scoped>
  .card-counter{
    box-shadow: 2px 2px 10px #DADADA;
    margin: 5px;
    padding: 20px 10px;
    background-color: #fff;
    height: 100px;
    border-radius: 5px;
    transition: .3s linear all;
  }

  .card-counter:hover{
    box-shadow: 4px 4px 20px #DADADA;
    transition: .3s linear all;
  }

  .card-counter.primary{
    background-color: #007bff;
    color: #FFF;
  }

  .card-counter.danger{
    background-color: #ef5350;
    color: #FFF;
  }  

  .card-counter.success{
    background-color: #66bb6a;
    color: #FFF;
  }  

  .card-counter.info{
    background-color: #26c6da;
    color: #FFF;
  }  

  .card-counter i{
    font-size: 5em;
    opacity: 0.2;
  }

  .card-counter .count-numbers{
    position: absolute;
    right: 35px;
    top: 20px;
    font-size: 32px;
    display: block;
  }

  .card-counter .count-name{
    position: absolute;
    right: 35px;
    top: 65px;
    font-style: italic;
    text-transform: capitalize;
    opacity: 0.5;
    display: block;
    font-size: 18px;
  }
</style>
<style>
#backButton {
  border-radius: 4px;
  padding: 8px;
  border: none;
  font-size: 16px;
  background-color: #2eacd1;
  color: white;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
.invisiblex {
  display: none;
}

</style>
