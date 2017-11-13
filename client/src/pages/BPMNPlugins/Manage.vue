<template>
    <div>
      <Form ref="formPlugin" :model="formPlugin">
        <template v-if="formPlugin.type == 'url'">
          <FormItem :prop="'url.link'" :rules="{required: true, message: 'Please enter valid url', trigger: 'blur'}">
            <Input v-model="formPlugin.url.link" placeholder="http://example.com/index.json">
              <Select v-model="formPlugin.type" :on-change="handleTypeChange('formPlugin')" slot="prepend" style="width: 150px">
                <Option value="url">URL</Option>
                <Option value="file">
                    Upload files
                </Option>
              </Select>
            </Input>
          </FormItem>
        </template>
        <template v-if="formPlugin.type == 'file'">
          <FormItem :prop="'file.name'" :rules="{required: true, message: 'Please select file first', trigger: 'blur'}">
            <Input v-model="formPlugin.file.name" placeholder="Click or drag files here to upload">
              <Select v-model="formPlugin.type" :on-change="handleTypeChange('formPlugin')"  slot="prepend" style="width: 150px">
                <Option value="url">URL</Option>
                <Option value="file">
                    Upload files
                </Option>
              </Select>
            </Input>
            <input @change="handleFileChange" type="file" accept=".json, application/json" style="width: calc(100% - 150px);z-index: 99;opacity: 0;position: absolute;right: 0px;top: 0;">
          </FormItem>
        </template>
        <FormItem>
          <Button type="primary" :loading="loadingFormPlugin" @click="handleSubmit('formPlugin')">
            <span v-if="!loadingFormPlugin">Install</span>
            <span v-else>Loading...</span>
          </Button>
          <Button type="ghost" @click="handleReset('formPlugin')"><span>Reset</span></Button>
        </FormItem>
      </Form>
      <Row>
        <Col>
          <Table size="small" :loading="logingPluginList" border ref="selection" :columns="columns" :data="plugins" stripe></Table>
        </Col>
      </Row>
    </div>
</template>
<script>
  import dbbpmnplugin from '@/api/bpmnplugins'
  import moment from 'moment'
  import _ from 'lodash'
  import axios from 'axios'
  export default {
    data () {
      return {
        logingPluginList: true,
        loadingFormPlugin: false,
        fileJson: {},
        formPlugin: {
          type: 'url',
          url: {
            link: ''
          },
          file: {
            name: ''
          }
        },
        columns: [
          {
            title: ' ',
            key: 'imgurl',
            align: 'center',
            width: 60,
            render: (h, params) => {
              return h('Avatar', {
                props: {
                  shape: 'square',
                  size: 'small',
                  src: this.plugins[params.index].imgurl
                },
                style: {
                  backgroundColor: 'transparent'
                }
              })
            }
          },
          {
            title: 'Title',
            key: 'title',
            sortable: true
          },
          {
            title: 'Worker type',
            key: 'worker_type',
            sortable: true,
            width: 200
          },
          {
            title: 'createdOn',
            key: 'createdOn',
            sortable: true,
            width: 200,
            render: (h, params) => {
              return h('div', moment(this.plugins[params.index].createdOn).format('lll'))
            }
          },
          {
            title: 'isEnable',
            key: 'isEnable',
            width: 100,
            align: 'center',
            render: (h, params) => {
              return h('i-switch', {
                props: {
                  value: this.plugins[params.index].isEnable,
                  size: 'small'
                },
                on: {
                  'on-change': (value) => {
                    this.plugins[params.index].isEnable = value
                    this.$Modal.confirm({
                      title: 'Confirm',
                      content: '<p>Are you sure you want to ' + (value ? 'enable' : 'disable') + ' this plugin?</p>',
                      onOk: () => {
                        this.handleEnableDisable(this.plugins[params.index])
                      },
                      onCancel: () => {
                        this.plugins[params.index].isEnable = !value
                      }
                    })
                  }
                }
              })
            }
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: 'Confirm',
                        content: '<p>Are you sure you want to <b> uninstall </b> this plugin?</p>',
                        onOk: () => {
                          this.handleUninstall(this.plugins[params.index].id)
                        }
                      })
                    }
                  }
                }, 'Uninstall')
              ])
            }
          }
        ],
        plugins: []
      }
    },
    created () {
      this.init()
    },
    feathers: {
      'bpmnplugins': {
        updated (data) {
          let $index = _.findIndex(this.plugins, (o) => { return o.id === data.id })
          this.plugins.splice($index, 1, data)
        },
        created (data) {
          this.plugins.splice(0, 1, data)
        },
        removed (data) {
          let $index = _.findIndex(this.plugins, (o) => { return o.id === data.id })
          this.plugins.splice($index, 1)
        }
      }
    },
    methods: {
      init () {
        let self = this
        dbbpmnplugin.get().then(response => {
          self.plugins = response
          self.logingPluginList = false
        }).catch(error => {
          this.$Notice.error({
            title: error,
            desc: 'connection to the server timed out',
            duration: 0
          })
        })
      },
      handleEnableDisable (data) {
        dbbpmnplugin.update(data.id, data).then(response => {
          console.log('response', response)
        })
      },
      handleTypeChange (name) {
        // if (this.$refs[name] && this.formPlugin.type === 'file') {
        //   // this.$refs['formPlugin'].fields.map(function (value, key) {
        //   //   if (value.validateState === 'error') {
        //   //     value.validate()
        //   //   }
        //   // })
        //   // validateStatus
        //   this.$refs[name].resetFields()
        // }
      },
      handleFileChange (e) {
        let self = this
        var files = e.target.files || e.dataTransfer.files
        if (files.length > 0) {
          this.formPlugin.file.name = files[0].name
          var reader = new FileReader()
          reader.onload = (e) => {
            self.fileJson = JSON.parse(e.target.result)
          }
          reader.readAsText(e.target.files[0])
        }
      },
      handleSubmit (name) {
        this.loadingFormPlugin = true
        this.$refs[name].validate(async (valid) => {
          if (valid) {
            if (this.formPlugin.type === 'url') {
              let filecontent = await axios.get(this.formPlugin.url.link)
              this.fileJson = filecontent.data
            }
            dbbpmnplugin.create(this.fileJson).then(response => {
              this.$Message.success('Plugin install successfully!')
              this.loadingFormPlugin = false
              this.$refs[name].resetFields()
              this.formPlugin.type = 'url'
            }).catch(error => {
              this.$Notice.error({
                title: 'Request failed',
                desc: error
              })
              this.loadingFormPlugin = false
            })
          } else {
            this.$Message.error('Validation failed!')
            this.loadingFormPlugin = false
          }
        })
      },
      handleUninstall (id) {
        dbbpmnplugin.delete(id)
        .then(response => {
          this.$Message.success('sucessfully uninstall.')
        })
        .catch(error => {
          this.$Notice.error({
            title: 'Failed',
            desc: error
          })
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
        this.formPlugin.type = 'url'
      }
    }
  }
</script>