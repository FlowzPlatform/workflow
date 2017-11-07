<template>
  <div>
    <div class="col-md-4"></div>
    <div align="right">
      <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
        <FormItem prop="filename">
          <Input type="text" v-model="formInline.filename" placeholder="File Name" style="width:200px"></Input>
        </FormItem>
        <FormItem prop="textarea">
          <Input type="textarea" v-model="formInline.notes" :autosize="{minRows: 1,maxRows: 5}" placeholder="Notes..." style="width:200px;vertical-align: inherit;"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" :loading="formInline.loading" @click="getMjml('formInline')">
            <span v-if="!formInline.loading">Save</span>
            <span v-else>Loading...</span>
          </Button>
        </FormItem>
        <FormItem>
          <Button type="error" @click="cancel()">Cancel</Button>
        </FormItem>
      </Form>
    </div>
    <div class="templateEditor">
      <div style="margin-top:15px" id="gjs">
        <mj-container min-height="100px"></mj-container>
      </div>
    </div>
  </div>
</template>

<!-- <script src="jquery/dist/jquery.min.js"></script>
<script src="grapesjs/dist/grapes.min.js"></script>
<script src="grapesjs-mjml/dist/grapesjs-mjml.min.js"></script> -->

<script>
/*eslint-disable*/
var AWS = require('aws-sdk')
AWS.config.update({
  accessKeyId: process.env.accesskey,
  secretAccessKey: process.env.secretkey
})
AWS.config.region = 'us-west-2'

import Emitter from '../mixins/emitter'

export default {
  name: 'templateEditor',
  mixins: [Emitter],
  data () {
    return {
      formInline: {
        filename: '',
        loading: false,
        notes: ''
      },
      ruleInline: {
        filename: [
          { required: true, message: 'Filename can not be empty...!', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    var editor = grapesjs.init({
      height: '100%',
      noticeOnUnload: 0,
      storageManager: {autoload: 0},
      container: '#gjs',
      fromElement: true,
      undoManager: true,
      plugins: ['gjs-mjml'],
      pluginsOpts: {
        'gjs-mjml': {}
      }
    })
    window.editor = editor
  },
  methods: {
    getMjml (name) {
      let mjmlobj = {}
      let filename = this.formInline.filename
      let notes = this.formInline.notes
      var self = this

      let mjmlTemplate = '<mjml><mj-body>' + window.editor.getHtml() + '</mj-body></mjml>'
      self.$refs[name].validate((valid) => {
        if (valid) {
          this.formInline.loading = true
          let bucket = new AWS.S3({ params: { Bucket: 'airflowbucket1/obexpense/expenses' } })
          console.log(bucket)
          var mjmlData = {
            Key: this.formInline.filename,
            ContentType: 'application/mjml',
            Body: mjmlTemplate
          }
          bucket.upload(mjmlData).on('httpUploadProgress', function (evt) {
            console.log('Uploaded :: ' + parseInt((evt.loaded * 100) / evt.total) + '%')
          }).send(function (err, data) {
            if (err) { alert(err) } else {
              mjmlobj = {'filename': filename, 'url': data.Location, 'notes': notes}
              self.formInline.loading = false
              self.dispatch('schema', 'close-mjml', mjmlobj)
            }
          })
        }
      })
    },
    cancel: function () {
      this.dispatch('schema', 'close-mjml', false)
    }
  }
}
</script>

<style>
.gjs-editor {
  height: 100%;
  width: 100%;
  position: absolute;
}
.gjs-field select{
  height: 23px;
}
.gjs-pn-panel{
  height: 40px;
}
#gjs-htmlmixed{
  position: relative;
}
.saveMjml{
  margin-bottom: 15px;
}
</style>
