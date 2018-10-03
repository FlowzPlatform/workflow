<template>
  <div id="emailtemplate">
    <div>
      <Row type="flex" justify="end">
      <Button type="primary" size="small" style="margin-bottom: 2px;position: absolute;right: 10px;" @click="addNewEmailTemplate" icon="plus"> Add</Button>
    </Row>
      <h2 class="heading">Templates</h2>
      <Table border highlight-row :columns="columns7" class="tableCss" :data="data6"></Table>
    </div>
    <div style="margin-top: 20px; float:right">
      <Page :total="total" show-sizer />
    </div>
  </div>
</template>

<script>
import saveemailTemplate from '@/api/emailtemplate'
import _ from 'lodash'

export default {
  data () {
    return {
      total: '',
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
      },
      columns7: [
        {
          title: 'Template Name',
          key: 'templateName'
        },
        {
          title: 'date',
          key: 'date'
        },
        {
          title: 'Action',
          key: 'action',
          width: 350,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'edit'
                },
                domProps: {
                  title: 'Edit Emailtemplate'
                },
                style: {
                  color: '#7DE144',
                  marginRight: '3px',
                  padding: '0px',
                  fontSize: '20px'
                },
                on: {
                  click: () => {
                    // console.log(params)
                    this.$router.push({name: 'editemailtemplate', params: {id: params.row.id}})
                  }
                }
              }, ''),
              h('Button', {
                props: {
                  type: 'text',
                  size: 'large',
                  icon: 'ios-trash'
                },
                domProps: {
                  title: 'delete template'
                },
                style: {
                  padding: '0px',
                  fontSize: '20px',
                  color: 'red'
                },
                on: {
                  click: () => {
                    this.remove(params)
                  }
                }
              }, '')
            ])
          }
        }
      ],
      data6: []
    }
  },
  components: {
    'editor': (resolve) => { require(['@tinymce/tinymce-vue'], resolve) }
  },
  methods: {
    addNewEmailTemplate () {
      this.$router.push({name: 'createemailtemplate'})
    },
    saveTemplate () {
      let saveemailTemplateObj = {
        user: this.$store.state.user._id,
        template: this.GetHtmlOfEditor,
        templateName: this.templateName,
        date: new Date()
      }
      console.log(saveemailTemplateObj)
      saveemailTemplate.post(saveemailTemplateObj)
      .then((res) => {
        this.$Message.success('Email Template Saved.')
        this.GetHtmlOfEditor = ''
        this.GetHtmlContent = ''
        this.templateName = ''
      })
      .catch((err) => {
        this.$Message.error('Template Save Error!')
        console.log(err)
      })
    },
    show (params) {
      this.GetHtmlContent = params.row.template
      this.templateName = params.row.templateName
      this.updateTemplateid = params.row.id
      this.newTemplate = false
      this.GetHtmlOfEditor = params.row.template
      this.GetHtmlContent = params.row.templates
    },
    remove (params) {
      saveemailTemplate.delete(params.row.id)
      .then((res) => {
        console.log(res)
        this.$Message.success('Template deleted.')
      })
      .catch((err) => {
        this.$Message.error('Template deletion Error!')
        console.log(err)
      })
    },
    updateTemplate () {
      let saveemailTemplateObj = {
        user: this.$store.state.user._id,
        template: this.GetHtmlOfEditor,
        templateName: this.templateName,
        date: new Date()
      }
      saveemailTemplate.patch(this.updateTemplateid, saveemailTemplateObj)
      .then((res) => {
        this.$Message.success('Template updated.')
        this.GetHtmlOfEditor = ''
        this.GetHtmlContent = ''
      })
      .catch((err) => {
        this.$Message.error('Template Updation Error!')
        console.log(err)
      })
    },
    cancelUpdateTemplate () {
      this.newTemplate = true
      this.templateName = ''
      this.GetHtmlOfEditor = '<p>Hello</p>'
      this.GetHtmlContent = '<p>Hello</p>'
    }
  },
  mounted () {
    saveemailTemplate.get(null, {
      // 'user': this.$store.state.user._id
      subscriptionId: this.$store.state.subscription,
      userId: this.$store.state.user._id
    })
    .then((res) => {
      this.flag = true
      this.data6 = res.data.data
      this.total = res.data.data.length
    })
    .catch((err) => {
      console.log(err)
      this.$Notice.error({duration: '3', title: err.message, desc: ''})
    })
  },
  feathers: {
    'emailtemplate': {
      created (data) {
        console.log('created', data)
        this.data6.push(data)
      },
      updated (data) {
        console.log('updated', data)
        let inx = _.findIndex(this.data6, (o) => { return o.id === data.id })
        console.log(inx)
        this.data6[inx] = data
      },
      removed (data) {
        console.log('removed', data)
        this.data6.splice(data.id, 1)
      }
    }
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



