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
  import ModelBpmnplugin from '@/api/bpmnplugins'
  import moment from 'moment'
  import _ from 'lodash'
  import axios from 'axios'
  import FormData from 'form-data'
  import config from '@/config'
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
            type: 'expand',
            width: 50,
            render: (h, params) => {
              // var self = this
              return h('Row', [
                h('Col', [
                  h('codemirror', {
                    props: {
                      options: {
                        tabSize: 2,
                        mode: params.row.worker.type, // 'text/javascript',
                        // theme: 'base16-light',
                        lineNumbers: true,
                        line: true,
                        // keyMap: 'sublime',
                        extraKeys: { 'Ctrl': 'autocomplete' },
                        foldGutter: true,
                        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                        styleSelectedText: true,
                        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true }
                      },
                      code: params.row.worker.src
                    },
                    on: {
                      change: function (newCode) {
                        params.row.worker.src = newCode
                      }
                    }
                  })
                ]),
                h('Col', [
                  h('div', {
                    style: {
                      marginTop: '5px',
                      marginLeft: '30px'
                    }
                  }, [
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
                            content: '<p>Are you sure you want to Update?</p>',
                            loading: true,
                            onOk: async () => {
                              var response = await this.handleEnableDisable(params.row)
                              if (response.status === 'success') {
                                var form = new FormData()
                                form.append('jobtype', params.row.pluginType.toLowerCase() + '_worker')
                                form.append('jobprocess', params.row.worker.src)
                                axios.post(config.workerRegisterURL + '/upload-worker-process', form, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(response => {
                                  this.plugins[params.index].worker.src = params.row.worker.src
                                  this.$Message.success('Update successfully!')
                                  this.$Modal.remove()
                                }).catch(error => {
                                  this.$Message.error(error.message)
                                  this.$Modal.remove()
                                })
                              } else {
                                this.$Message.error(response.message)
                                this.$Modal.remove()
                              }
                            }
                          })
                        }
                      }
                    }, 'Update'),
                    h('Button', {
                      props: {
                        type: 'ghost',
                        size: 'small'
                      },
                      on: {
                        click: () => {
                          params.row.worker.src = this.plugins[params.index].worker.src
                        }
                      }
                    }, 'Reset')
                  ])
                ])
              ])
            }
          },
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
                  src: this.plugins[params.index].image
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
            title: 'pluginType',
            key: 'pluginType',
            sortable: true,
            width: 200
          },
          {
            title: 'createdOn',
            key: 'createdOn',
            sortable: true,
            width: 200,
            sortType: 'desc',
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
                      onOk: async () => {
                        await this.handleEnableDisable(this.plugins[params.index])
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
                        loading: true,
                        content: '<p>Are you sure you want to <b> uninstall </b> this plugin?</p>',
                        onOk: async () => {
                          var response = await this.handleUninstall(this.plugins[params.index].id)
                          if (response.status === 'success') {
                            this.$Message.success('Uninstall successfull.')
                          } else {
                            this.$Message.error(response.message)
                          }
                          this.$Modal.remove()
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
          this.plugins.push(data)
          //  this.plugins.splice(0, 1, data)
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
        ModelBpmnplugin.get().then(response => {
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
      async handleEnableDisable (data) {
        return await ModelBpmnplugin.update(data.id, data).then(response => {
          return {status: 'success'}
        }).catch(error => {
          return {status: 'error', message: error}
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
            ModelBpmnplugin.create(this.fileJson).then(response => {
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
      async handleUninstall (id) {
        return await ModelBpmnplugin.delete(id)
        .then(response => {
          return {status: 'success'}
        })
        .catch(error => {
          return {status: 'error', message: error}
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields()
        this.formPlugin.type = 'url'
      }
    }
  }
</script>