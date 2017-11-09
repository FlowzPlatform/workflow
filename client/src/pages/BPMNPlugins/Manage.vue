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
          
        </FormItem>
      </Form>
      <Row>
        <Col>
          <Table border ref="selection" :columns="columns" :data="plugins" stripe></Table>
        </Col>
      </Row>
    </div>
</template>
<script>
  import dbbpmnplugin from '@/api/bpmnplugins'
  import moment from 'moment'
  import _ from 'lodash'
  export default {
    data () {
      return {
        loadingFormPlugin: false,
        formPlugin: {
          type: 'file',
          url: {
            link: ''
          },
          file: {
            name: ''
          }
        },
        columns: [
          {
            title: 'Title',
            key: 'title',
            sortable: true
          },
          {
            title: 'Worker type',
            key: 'worker-type',
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
            render: (h, params) => {
              return h('i-switch', {
                props: {
                  value: this.plugins[params.index].isEnable
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
        },
        deleted (data) {
          console.log('data', data)
        }
      }
    },
    methods: {
      init () {
        let self = this
        dbbpmnplugin.get().then(response => {
          self.plugins = response
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
        var files = e.target.files || e.dataTransfer.files
        if (files.length > 0) {
          // this.$refs['formPlugin'].resetFields()
          this.formPlugin.file.name = files[0].name
        }
      },
      handleSubmit (name) {
        this.loadingFormPlugin = true
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Message.success('Success!')
            this.loadingFormPlugin = false
          } else {
            this.$Message.error('Fail!')
            this.loadingFormPlugin = false
          }
        })
      }
    }
  }
</script>