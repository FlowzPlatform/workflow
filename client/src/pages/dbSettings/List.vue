<template>
    <div>
   <!--  <router-link :to="{ name : 'settings', params : { db : tabPane }}">
        <Button type="primary" icon="plus" size="small" style="float:right">Add</Button>
    </router-link> -->
      <Tabs  v-model="tabPane">
        <TabPane label="Mongo DB" name="mongo">
            <Table size="small" :loading="loading" :columns="mongoCol" :data="mongoDt"></Table>
        </TabPane>
        <TabPane label="Rethink DB" name="rethink">
            <Table size="small" :loading="loading" :columns="rethinkCol" :data="rethinkDt"></Table>
        </TabPane>
        <TabPane label="Elastic Search" name="elastic">
            <Table size="small" :loading="loading" :columns="esCol" :data="elasticDt"></Table>
        </TabPane>
        <TabPane label="Ne DB" name="nedb">
            <Table size="small" :loading="loading" :columns="neCol" :data="nedbDt"></Table>
        </TabPane>
        <Button type="primary" icon="plus" @click="addSettings" size="small" slot="extra">Add</Button>
      </Tabs>
    </div>
</template>
<script>
// import api from '@/api'
import databasesModel from '@/api/databases'
import _ from 'lodash'
export default {
  data () {
    return {
      loading: true,
      tabPane: 'mongo',
      row: '',
      mongoCol: [{
        title: 'Status',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('i-switch', {
            props: {
              value: this.mongoDt[params.index].isenable,
              size: 'small'
            },
            on: {
              'on-change': (value) => {
                this.mongoDt[params.index].isenable = value
                this.$Modal.confirm({
                  title: 'Confirm',
                  loading: true,
                  content: '<p>Are you sure you want to ' + (value ? 'enable' : 'disable') + ' this database?</p>',
                  onOk: async () => {
                    let returnStatus = await this.handleEnableDisable(this.mongoDt[params.index])
                    if (returnStatus.status === 'error') {
                      this.$Notice.error({
                        title: returnStatus.message,
                        desc: this.mongoDt[params.index].connection_name + ' is not ' + (value ? 'enable' : 'disable')
                      })
                    }
                    this.$Modal.remove()
                  },
                  onCancel: () => {
                    this.mongoDt[params.index].isenable = !value
                  }
                })
                // this.enableDbInstance(this.tabPane, params.index, value)
              }
            }
          })
        }
      },
      {
        title: 'Default',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Radio', {
            props: {
              value: this.mongoDt[params.index].isdefault
            },
            on: {
              'on-change': (value) => {
                // this.defaultDBInstance(this.tabPane, params.index, value)
                this.mongoDt[params.index].isdefault = value
                this.$Modal.confirm({
                  title: 'Confirm',
                  loading: true,
                  content: '<p>Are you sure you want to ' + (value ? 'set' : 'unset') + ' default database?</p>',
                  onOk: async () => {
                    let returnStatus = await this.defaultDBInstance(this.mongoDt[params.index])
                    if (returnStatus.status === 'error') {
                      this.$Notice.error({
                        title: returnStatus.message,
                        desc: this.mongoDt[params.index].connection_name + ' is not ' + (value ? 'enable' : 'disable')
                      })
                      this.mongoDt[params.index].isdefault = !value
                    }
                    this.$Modal.remove()
                  },
                  onCancel: () => {
                    this.mongoDt[params.index].isdefault = !value
                  }
                })
              }
            }
          })
        }
      },
      {
        title: 'Connection Name',
        key: 'connection_name'
      },
      {
        title: 'Host',
        key: 'host'
      },
      {
        title: 'Port',
        key: 'port'
      },
      {
        title: 'Database Name',
        key: 'dbname'
      },
      {
        title: 'Notes',
        key: 'notes'
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'large',
                icon: 'trash-b'
              },
              style: {
                color: '#CC0000',
                marginRight: '3px',
                padding: '0px',
                fontSize: '20px'
              },
              on: {
                click: () => {
                  this.instanceRemove(this.tabPane, params.index)
                }
              }
            }, '')
          ])
        }
      }],
      mongoDt: [],
      rethinkCol: [{
        title: 'Status',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('i-switch', {
            props: {
              value: this.rethinkDt[params.index].isenable,
              size: 'small'
            },
            on: {
              'on-change': (value) => {
                this.rethinkDt[params.index].isenable = value
                this.$Modal.confirm({
                  title: 'Confirm',
                  loading: true,
                  content: '<p>Are you sure you want to ' + (value ? 'enable' : 'disable') + ' this database?</p>',
                  onOk: async () => {
                    let returnStatus = await this.handleEnableDisable(this.rethinkDt[params.index])
                    if (returnStatus.status === 'error') {
                      this.$Notice.error({
                        title: returnStatus.message,
                        desc: this.rethinkDt[params.index].connection_name + ' is not ' + (value ? 'enable' : 'disable')
                      })
                    }
                    this.$Modal.remove()
                  },
                  onCancel: () => {
                    this.rethinkDt[params.index].isenable = !value
                  }
                })
                // this.enableDbInstance(this.tabPane, params.index, value)
              }
            }
          })
        }
      },
      // {
      //   title: 'Default',
      //   width: 80,
      //   align: 'center',
      //   render: (h, params) => {
      //     return h('Radio', {
      //       props: {
      //         value: this.rethinkDt[params.index].isdefault
      //       },
      //       on: {
      //         'on-change': (value) => {
      //           this.defaultDBInstance(this.tabPane, params.index, value)
      //         }
      //       }
      //     })
      //   }
      // },
      {
        title: 'Connection Name',
        key: 'connection_name'
      },
      {
        title: 'Host',
        key: 'host'
      },
      {
        title: 'Port',
        key: 'port'
      },
      {
        title: 'Database Name',
        key: 'dbname'
      },
      {
        title: 'Notes',
        key: 'notes'
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'large',
                icon: 'trash-b'
              },
              style: {
                color: '#CC0000',
                marginRight: '3px',
                padding: '0px',
                fontSize: '20px'
              },
              on: {
                click: () => {
                  this.instanceRemove(this.tabPane, params.index)
                }
              }
            }, '')
          ])
        }
      }],
      rethinkDt: [],
      esCol: [{
        title: 'Status',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('i-switch', {
            props: {
              value: this.elasticDt[params.index].isenable,
              size: 'small'
            },
            on: {
              'on-change': (value) => {
                this.elasticDt[params.index].isenable = value
                this.$Modal.confirm({
                  title: 'Confirm',
                  loading: true,
                  content: '<p>Are you sure you want to ' + (value ? 'enable' : 'disable') + ' this database?</p>',
                  onOk: async () => {
                    let returnStatus = await this.handleEnableDisable(this.elasticDt[params.index])
                    if (returnStatus.status === 'error') {
                      this.$Notice.error({
                        title: returnStatus.message,
                        desc: this.elasticDt[params.index].connection_name + ' is not ' + (value ? 'enable' : 'disable')
                      })
                    }
                    this.$Modal.remove()
                  },
                  onCancel: () => {
                    this.elasticDt[params.index].isenable = !value
                  }
                })
                // this.enableDbInstance(this.tabPane, params.index, value)
              }
            }
          })
        }
      },
      // {
      //   title: 'Default',
      //   width: 80,
      //   align: 'center',
      //   render: (h, params) => {
      //     return h('Radio', {
      //       props: {
      //         value: this.elasticDt[params.index].isdefault
      //       },
      //       on: {
      //         'on-change': (value) => {
      //           this.defaultDBInstance(this.tabPane, params.index, value)
      //           // console.log(this.mongoDt[params.index].isenable);
      //         }
      //       }
      //     })
      //   }
      // },
      {
        title: 'Connection Name',
        key: 'connection_name'
      },
      {
        title: 'Host',
        key: 'host'
      },
      {
        title: 'Port',
        key: 'port'
      },
      {
        title: 'Database Name',
        key: 'dbname'
      },
      {
        title: 'Notes',
        key: 'notes'
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'large',
                icon: 'trash-b'
              },
              style: {
                color: '#CC0000',
                marginRight: '3px',
                padding: '0px',
                fontSize: '20px'
              },
              on: {
                click: () => {
                  // this.remove(params.index)
                  this.instanceRemove(this.tabPane, params.index)
                }
              }
            }, '')
          ])
        }
      }],
      elasticDt: [],
      neCol: [{
        title: 'Status',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('i-switch', {
            props: {
              value: this.nedbDt[params.index].isenable,
              size: 'small'
            },
            on: {
              'on-change': (value) => {
                this.nedbDt[params.index].isenable = value
                this.$Modal.confirm({
                  title: 'Confirm',
                  loading: true,
                  content: '<p>Are you sure you want to ' + (value ? 'enable' : 'disable') + ' this database?</p>',
                  onOk: async () => {
                    let returnStatus = await this.handleEnableDisable(this.nedbDt[params.index])
                    if (returnStatus.status === 'error') {
                      this.$Notice.error({
                        title: returnStatus.message,
                        desc: this.nedbDt[params.index].connection_name + ' is not ' + (value ? 'enable' : 'disable')
                      })
                    }
                    this.$Modal.remove()
                  },
                  onCancel: () => {
                    this.nedbDt[params.index].isenable = !value
                  }
                })
                // this.enableDbInstance(this.tabPane, params.index, value)
              }
            }
          })
        }
      },
      // {
      //   title: 'Default',
      //   width: 80,
      //   align: 'center',
      //   render: (h, params) => {
      //     return h('Radio', {
      //       props: {
      //         value: this.nedbDt[params.index].isdefault
      //       },
      //       on: {
      //         'on-change': (value) => {
      //           this.defaultDBInstance(this.tabPane, params.index, value)
      //           // console.log(this.mongoDt[params.index].isenable);
      //         }
      //       }
      //     })
      //   }
      // },
      {
        title: 'Connection Name',
        key: 'connection_name'
      },
      {
        title: 'Host',
        key: 'host'
      },
      {
        title: 'Port',
        key: 'port'
      },
      {
        title: 'Database Name',
        key: 'dbname'
      },
      {
        title: 'Notes',
        key: 'notes'
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'large',
                icon: 'trash-b'
              },
              style: {
                color: '#CC0000',
                marginRight: '3px',
                padding: '0px',
                fontSize: '20px'
              },
              on: {
                click: () => {
                  // this.remove(params.index)
                  this.instanceRemove(this.tabPane, params.index)
                }
              }
            }, '')
          ])
        }
      }],
      nedbDt: []
    }
  },
  methods: {
    getSettings () {
      databasesModel.get(null, {
        $paginate: false
      })
      .then(response => {
        this.mongoDt = _.filter(response.data, {selectedDb: 'mongo'})
        this.rethinkDt = _.filter(response.data, {selectedDb: 'rethink'})
        this.elasticDt = _.filter(response.data, {selectedDb: 'elastic'})
        this.nedbDt = _.filter(response.data, {selectedDb: 'nedb'})
        this.loading = false
      })
      .catch(error => {
        this.$Notice.error({
          duration: 3,
          title: 'Error!!',
          desc: error.message
        })
        this.loading = false
      })
    },
    async handleEnableDisable (data) {
      // console.log(data)
      return await databasesModel.patch(data.id, {isenable: data.isenable}).then(response => {
        return {status: 'success'}
      }).catch(error => {
        return {status: 'error', message: error.message}
      })
    },
    addSettings () {
      this.$router.push({name: 'DbSettings/new', params: { db: this.tabPane }})
    },
    instanceRemove (db, index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete Connection?</p>',
        onOk: () => {
          var id = this[db + 'Dt'][index].id
          databasesModel.delete(id)
          .then(response => {
            this[db + 'Dt'].splice(index, 1)
            this.$Notice.success({title: 'Success', desc: 'Connection Deleted.....'})
          })
          .catch(error => {
            this.$Notice.error({title: 'Error', desc: error.message})
          })
        },
        onCancel: () => {
        }
      })
    },
    // enableDbInstance (db, index, value) {
    //   this.$Modal.confirm({
    //     title: 'Confirm',
    //     content: '<p>Are you sure you want to enable Connection?</p>',
    //     onOk: () => {
    //       var id = this[db + 'Dt'][index].id
    //       api.request('put', '/settings/' + id + '?db=' + db, {isenable: value})
    //           .then(response => {
    //             this[db + 'Dt'][index].isenable = value
    //             this.$Notice.success({duration: 3, title: 'Success!!', desc: 'Connection Enable Successfully..'})
    //             this.$store.dispatch('getSchema')
    //             this.getSettings()
    //           })
    //           .catch(error => {
    //             console.log(error)
    //             this.$Notice.error({duration: 3, title: 'Error!!', desc: 'Connection not Enable...'})
    //           })
    //     },
    //     onCancel: () => {
    //       this.getSettings()
    //     }
    //   })
    // },
    async defaultDBInstance (data) {
      return await databasesModel.patch(data.id, {isdefault: data.isdefault}).then(response => {
        return {status: 'success'}
      }).catch(error => {
        return {status: 'error', message: error.message}
      })
      // this.$Modal.confirm({
      //   title: 'Confirm',
      //   content: '<p>Are you sure you want to change default Connection?</p>',
      //   onOk: () => {
      //     var id = this[db + 'Dt'][index].id
      //     api.request('patch', '/settings/' + id + '?db=' + db, {isdefault: value})
      //     .then(response => {
      //       this[db + 'Dt'][index].isdefault = value
      //       this.$Notice.success({duration: 3, title: 'Success!!', desc: 'Connection set Default Successfully..'})
      //       // this.$store.dispatch('getSchema')
      //       // this.getSettings()
      //     })
      //     .catch(error => {
      //       console.log(error)
      //       this.$Notice.error({duration: 3, title: 'Error!!', desc: 'Connection not set Default...'})
      //     })
      //   },
      //   onCancel: () => {
      //     this.getSettings()
      //     // this[db+'Dt'][index].isenable = !value
      //   }
      // })
    }
  },
  mounted () {
    this.getSettings()
  }
}
</script>
