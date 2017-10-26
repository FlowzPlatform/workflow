<template>
  <div class="gridmanager">
    <Input v-model="templatename" placeholder="File Name" style="width:200px"></Input>
    <Input type="textarea" v-model="notes" :autosize="{minRows: 1,maxRows: 5}" placeholder="Notes..." size="small" style="width:200px"></Input>
    <Button type="primary" @click="savedata">Save</Button>
    <Button type="error" @click="cancel">Cancel</Button>
    <div id="mygridmanager" class="clearfix"></div>
  </div>
</template>
<script>

import $ from 'jquery'
import '../../static/jquery-ui.js'
import '../../static/gridmanager.js'
import Emitter from '../mixins/emitter'
import 'bootstrap/dist/css/bootstrap.css'
import axios from 'axios'

let gm = null

export default {
  name: 'gridmanager',
  data () {
    return {
      templatename: '',
      notes: ''
    }
  },
  mixins: [Emitter],
  mounted () {
    if (gm != null) {
      gm.deinitCanvas()
    }
    gm = $('#mygridmanager').gridmanager().data('gridmanager')
    if (this.$store.state.editTemplate !== undefined) {
      this.templatename = this.$store.state.editTemplate.data.filename
      this.notes = this.$store.state.editTemplate.data.notes
      axios.get(this.$store.state.editTemplate.data.url)
      .then((res) => {
        $('#gm-canvas').empty().append(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
    }
  },
  methods: {
    savedata () {
      console.log('Savedata')
      if (this.templatename !== '' && this.templatename !== undefined) {
        let gridobject = {}
        let canvas = gm.$el.find('#' + gm.options.canvasId)
        gm.deinitCanvas()
        gridobject.templatename = this.templatename
        gridobject.html = canvas.html()
        gm.initCanvas()
        this.dispatch('schema', 'close-grid', gridobject)
      } else {
        this.$message.error('Oops, provide template name.')
      }
    },
    cancel () {
      this.dispatch('schema', 'close-grid', undefined)
    }
  }
}
</script>
<style lang="less">
  @import '../../static/jquery.gridmanager.css';
</style>
