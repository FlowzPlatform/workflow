<template>
  <div id="emailtemplate">
      <Row type="flex" justify="end">
        <Button type="primary" size="small" style="margin-bottom: 2px;position: absolute;right: 10px;" @click="emailTemplateList" icon="ivu-icon ivu-icon-ios-arrow-back"> back</Button>
      </Row>
      <h2 class="heading">Create New Template</h2>
      <keep-alive>
        <editor v-model="GetHtmlOfEditor" api-key="ppzi01crrfo3pvd43s3do89pguwkhowrwajpjdqdkginzj7k" :toolbar="toolbar1" :plugins="plugins" :init="settings" :initial-value="gethtmlcontent"></editor>
      </keep-alive>
      <Input v-model="templateName" placeholder="Enter Template name" style="width: 300px" class="dataEnter"/>
      <Button type="primary" @click="saveTemplate" class="dataEnter" :loading="loading">Save Template</Button>
      <Button type="error" @click="cancelUpdateTemplate" class="dataEnter">Cancel</Button>
  </div>
</template>

<script>
import saveemailTemplate from '@/api/emailtemplate'

export default {
  data () {
    return {
      loading: false,
      flag: false,
      updateTemplateid: '',
      newTemplate: true,
      templateName: '',
      GetHtmlOfEditor: '',
      gethtmlcontent: '<p>Hello!</p>',
      plugins: 'print preview searchreplace fullscreen image link media template codesample table hr pagebreak anchor toc insertdatetime lists textcolor imagetools contextmenu colorpicker',
      toolbar1: 'formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
      settings: {
        templates: [
          { title: 'Test template 1', content: 'Test 1' },
          { title: 'Test template 2', content: 'Test 2' }
        ]
      }
    }
  },
  components: {
    'editor': (resolve) => { require(['@tinymce/tinymce-vue'], resolve) }
  },
  methods: {
    saveTemplate () {
      this.loading = true
      let saveemailTemplateObj = {
        user: this.$store.state.user._id,
        template: this.GetHtmlOfEditor,
        templateName: this.templateName,
        date: new Date()
      }
      saveemailTemplate.post(saveemailTemplateObj)
      .then((res) => {
        this.loading = false
        this.$Message.success('Email Template Saved.')
        this.GetHtmlOfEditor = ''
        this.GetHtmlContent = ''
        this.templateName = ''
        this.$router.push({name: 'emailtemplate'})
      })
      .catch((err) => {
        this.loading = false
        this.$Message.error('Template Save Error!')
        console.log(err)
      })
    },
    cancelUpdateTemplate () {
      this.$router.push({name: 'emailtemplate'})
    },
    emailTemplateList () {
      this.$router.push({name: 'emailtemplate'})
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.mce-edit-area.mce-container.mce-panel.mce-stack-layout-item > iframe {
  height: 500px !important;
}

.dataEnter{
  margin-top: 20px;
}

.editor{
  margin-top: 40px;
}

.heading{
  margin-bottom: 20px
}

.active {
  background-color:red;
  font-weight:bold;
}

.tableCss {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden
}

.mce-widget.mce-notification.mce-notification-warning.mce-has-close.mce-in{
  display: none !important;
  z-index: -999999 !important;
}
</style>

<style>

.mce-widget.mce-notification.mce-notification-warning.mce-has-close.mce-in{
  display: none !important;
}
</style>



