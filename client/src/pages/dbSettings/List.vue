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
import api from '@/api'
import _ from 'lodash'
export default {
  data () {
    return {
      loading: true,
      tabPane: 'mongo',
      row: '',
      mongoCol: [{
        title: 'Select',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Checkbox', {
            props: {
              value: this.mongoDt[params.index].isenable
            },
            on: {
              'on-change': (value) => {
                this.enableDbInstance(this.tabPane, params.index, value)
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
                this.defaultDBInstance(this.tabPane, params.index, value)
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
        title: 'Select',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Checkbox', {
            props: {
              value: this.rethinkDt[params.index].isenable
            },
            on: {
              'on-change': (value) => {
                this.enableDbInstance(this.tabPane, params.index, value)
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
              value: this.rethinkDt[params.index].isdefault
            },
            on: {
              'on-change': (value) => {
                this.defaultDBInstance(this.tabPane, params.index, value)
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
      rethinkDt: [],
      esCol: [{
        title: 'Select',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Checkbox', {
            props: {
              value: this.elasticDt[params.index].isenable
            },
            on: {
              'on-change': (value) => {
                this.enableDbInstance(this.tabPane, params.index, value)
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
              value: this.elasticDt[params.index].isdefault
            },
            on: {
              'on-change': (value) => {
                this.defaultDBInstance(this.tabPane, params.index, value)
                // console.log(this.mongoDt[params.index].isenable);
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
        title: 'Select',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Checkbox', {
            props: {
              value: this.nedbDt[params.index].isenable
            },
            on: {
              'on-change': (value) => {
                this.enableDbInstance(this.tabPane, params.index, value)
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
              value: this.nedbDt[params.index].isdefault
            },
            on: {
              'on-change': (value) => {
                this.defaultDBInstance(this.tabPane, params.index, value)
                // console.log(this.mongoDt[params.index].isenable);
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
    addSettings () {
      this.$router.push({name: 'DbSettings/new', params: { db: this.tabPane }})
    },
    instanceRemove (db, index) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to delete Connection?</p>',
        onOk: () => {
          var id = this[db + 'Dt'][index].id
          api.request('delete', '/settings/' + id + '?db=' + db)
          .then(response => {
            this[db + 'Dt'].splice(index, 1)
            this.$Notice.success({title: 'Success', desc: 'Connection Deleted.....'})
          })
          .catch(error => {
            console.log(error)
            this.$Notice.error({title: 'Error', desc: 'Connection Not Deleted.....'})
          })
        },
        onCancel: () => {
        }
      })
    },
    enableDbInstance (db, index, value) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to enable Connection?</p>',
        onOk: () => {
          var id = this[db + 'Dt'][index].id
          api.request('put', '/settings/' + id + '?db=' + db, {isenable: value})
              .then(response => {
                this[db + 'Dt'][index].isenable = value
                this.$Notice.success({duration: 3, title: 'Success!!', desc: 'Connection Enable Successfully..'})
                this.$store.dispatch('getSchema')
                this.getSettings()
              })
              .catch(error => {
                console.log(error)
                this.$Notice.error({duration: 3, title: 'Error!!', desc: 'Connection not Enable...'})
              })
        },
        onCancel: () => {
          this.getSettings()
        }
      })
    },
    defaultDBInstance (db, index, value) {
      this.$Modal.confirm({
        title: 'Confirm',
        content: '<p>Are you sure you want to change default Connection?</p>',
        onOk: () => {
          var id = this[db + 'Dt'][index].id
          api.request('patch', '/settings/' + id + '?db=' + db, {isdefault: value})
          .then(response => {
            this[db + 'Dt'][index].isdefault = value
            this.$Notice.success({duration: 3, title: 'Success!!', desc: 'Connection set Default Successfully..'})
            this.$store.dispatch('getSchema')
            this.getSettings()
          })
          .catch(error => {
            console.log(error)
            this.$Notice.error({duration: 3, title: 'Error!!', desc: 'Connection not set Default...'})
          })
        },
        onCancel: () => {
          this.getSettings()
          // this[db+'Dt'][index].isenable = !value
        }
      })
    },
    getSettings () {
      let self = this
      api.request('get', '/settings')
      .then(response => {
        _.forEach(response.data, (instances, db) => {
          self[db + 'Dt'] = response.data[db].dbinstance
        })
      })
      .catch(error => {
        this.$Notice.error({title: 'Network Error!!'})
        console.log(error)
      })
    }
  },
  mounted () {
    let self = this
    api.request('get', '/settings')
    .then(response => {
      _.forEach(response.data, (instances, db) => {
        self[db + 'Dt'] = response.data[db].dbinstance
        self.loading = false
      })
    })
    .catch(error => {
      this.$Notice.error({title: 'Network Error!!'})
      console.log(error)
    })
  }
}
</script>
<style>
.expand-row{
        margin-bottom: 16px;
    }
.ivu-table-small th {
      height: 32px;
      background-color: #394263;
      color: #fff;
    }
.btn {
    margin-top: 20px;
}
</style>
