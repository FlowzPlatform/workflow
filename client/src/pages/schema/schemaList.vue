<template>
  <div id="app">
          <row>
            <router-link to="/schema/new">
              <Button type="primary" style="float: right;margin-bottom: 2px;"><Icon type="plus" size="16"></Icon> Add</Button>
            </router-link>
          </row>
          <row>
          <Col :span="spanTable">
              <Table :columns="schemaCol" :data="schemaData"></Table>
          </Col>
          <Col span="16" v-if="inst">
              <div>
                  <Table :columns="instanceCol" :data="instanceData"></Table>
              </div>
              <div v-if="viewTemplate" v-html="viewTemplate">
              </div>
          </Col>
          </row>
  </div>
</template>
<script type="text/javascript">
  import Schema from '@/api/schema'
  import instance from '@/api/schema/instance'
  import api from '@/api'
  import axios from 'axios'
  import expandRowView from './expandInstance.vue'
  import _ from 'lodash'
  export default {
    data () {
      return {
        viewTemplate: '',
        schema: true,
        inst: false,
        instId: '',
        schemaName: [],
        instanceData: [],
        schemaData: [],
        instanceCol: [
          {
            title: 'Id',
            key: 'id'
          },
          {
            type: 'expand',
            width: 20,
            render: (h, params) => {
              return h(expandRowView, {
                props: {
                  row: this.instanceData[params.index]
                }
              })
            }
          }
        ],
        deleteSchemaValue: 'softdel',
        schemaCol: [
          {
            title: 'Title',
            key: 'title'
            // width: '50%'
          },
          {
            title: 'Action',
            key: 'action',
            // width: '50%',
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'ios-compose-outline'
                  },
                  style: {
                    color: '#3352FF',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      console.log(params.index)
                      console.log(this.schemaName[params.index])
                      this.$router.push('schema/edit/' + this.schemaName[params.index]._id)
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'arrow-swap'
                  },
                  style: {
                    color: '#7DE144',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      console.log(params.index)
                      console.log(this.schemaName[params.index])
                      this.$router.push('schema/' + this.schemaName[params.index]._id + '/mapping')
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'android-delete'
                  },
                  style: {
                    color: '#CC0000',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      this.handleRemove(params.index)
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'android-menu'
                  },
                  style: {
                    color: '#CC0000',
                    marginRight: '3px',
                    padding: '0px',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      this.instId = this.schemaName[params.index]._id
                      console.log('this.instId', this.instId)
                      this.instList(this.schemaName[params.index]._id)
                    }
                  }
                }, '')
              ])
            }
          }
        ]
      }
    },
    computed: {
      spanTable () {
        return this.inst ? 8 : 24
      }
    },
    methods: {
      viewdataInstance (id) {
        var self = this
        instance.getThis(id).then(response => {
          console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR', response)
          Schema.getThis(response.data.Schemaid).then(res => {
            console.log('res.viewTemplate.url', res)
            if (res.data.viewTemplate.length !== 0) {
              var urlViewtemplate = res.data.viewTemplate[0].url
              console.log('FFFFFFFFFFFFFFFFFFFFFFF', urlViewtemplate)
              axios.get(res.data.viewTemplate[0].url).then(html => {
                self.viewTemplate = html.data
              })
            }
          })
        })
      },
      instList (id) {
        let self = this
        this.schema = false
        this.inst = true
        this.instanceData = []
        instance.get().then(response => {
          _.forEach(response.data, (obj) => {
            if (id === obj.Schemaid) {
              self.instanceData.push({ 'id': obj.id })
            }
          })
        })
      },
      handleRemove (index) {
        this.$Modal.confirm({
          title: 'Confirm, Are you sure you want to delete?',
          // content: '<p>Are you sure you want to delete?</p>',
          width: 500,
          render: (h, params) => {
            return h('RadioGroup', {
              props: {
                vertical: true,
                value: this.deleteSchemaValue,
                size: 'large'
              },
              style: {
                paddingTop: '20px'
              },
              on: {
                'on-change': (value) => {
                  this.deleteSchemaValue = value
                  console.log('this.deleteSchemaValue', this.deleteSchemaValue)
                  // console.log(this.mongoDt[params.index].isenable);
                }
              }
            }, [
              h('Radio', {
                props: {
                  size: 'large',
                  label: 'harddel'
                }
              }, 'Delete Schema Permanently?? (With all instance Data)'),
              h('Radio', {
                props: {
                  size: 'large',
                  label: 'softdel'
                }
              }, 'Delete Schema Temporary? (Without instance Data)')
            ])
          },
          onOk: () => {
            if (this.deleteSchemaValue === 'softdel') {
              // alert(this.deleteSchemaValue)
              api.request('delete', '/schema/' + this.schemaName[index]._id + '?type=' + this.deleteSchemaValue)
                .then(response => {
                  this.$Notice.success({title: 'Success!!', desc: 'Schema Deleted...'})
                  // this.$store.dispatch('getSchema')

                  // this.schema = response.data
                  // console.log(response.data)
                  // this.schema.splice(index, 1)
                  this.schemaData.splice(index, 1)
                })
                .catch(error => {
                  this.$Notice.error({title: 'Error!!', desc: 'Schema Not Deleted...'})
                  console.log(error)
                })
            } else if (this.deleteSchemaValue === 'harddel') {
              // alert(this.deleteSchemaValue)
              api.request('delete', '/schema/' + this.schemaName[index]._id + '?type=' + this.deleteSchemaValue)
                .then(response => {
                  // this.schema = response.data
                  // this.schema.splice(index, 1)
                })
                .catch(error => {
                  console.log(error)
                })
            } else {
              this.$Message.error('Error!!')
            }
            // api.request('delete', '/schema/' + this.schema[index]._id)
            // .then(response => {
            //   // this.schema = response.data
            //   this.schema.splice(index, 1)
            // })
            // .catch(error => {
            //   console.log(error)
            // })
            // this.formSchema.entity.splice(index, 1)
          },
          onCancel: () => {
            this.deleteSchemaValue = 'softdel'
          }
        })
      }
    },
    mounted () {
      Schema.get().then(response => {
        console.log(response.data)
        this.schemaName = _.reject(response.data, { 'isdeleted': true })
        this.schemaData = _.map(this.schemaName, m => {
          return {
            title: m.title
          }
        })
      })
    }
  }
</script>