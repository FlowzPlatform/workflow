<template>
  <div>
    <Row style="padding: 5px 0">
      <h3>
        <span v-if="flowzdata !== null">{{flowzdata.name}}</span>
        <div style="float:right;">
        <Button type="ghost" @click="handleCancel" icon="ios-arrow-back">Back</Button>
          <Button type="primary" :loading="buttonLoading"  @click="handleSave">Save</Button>
        </div>
      </h3>
    </Row>
    <Row>
      <Table :loading="tableLoading" :columns="columns" :data="data" border></Table>
    </Row>
    <Row style="padding: 5px 0">
      <Button :loading="buttonLoading" type="primary" @click="handleSave">Save</Button>
      <Button type="ghost" @click="handleCancel">Cancel</Button>
    </Row>
  </div>
</template>

<script>
import flowzModal from '@/api/flowz'
import schemaModal from '@/api/schema'
import _ from 'lodash'
export default {
  name: 'permission',
  data () {
    return {
      tableLoading: false,
      buttonLoading: false,
      columns: [
        {
          title: 'State',
          key: 'state',
          align: 'center',
          width: 200,
          fixed: 'left'
        }
      ],
      data: [],
      flowzdata: null,
      schemaRes: null
    }
  },
  mounted () {
    (this.$route.params.id) ? this.init(this.$route.params.id) : this.$Notice.error({title: 'Error'})
  },
  methods: {
    handleSave () {
      if (this.flowzdata !== null && this.$route.params.id !== undefined) {
        this.buttonLoading = true
        _.map(this.data, (m) => {
          this.flowzdata.processList[m._state].permission = m
          delete this.flowzdata.processList[m._state].permission.state
          delete this.flowzdata.processList[m._state].permission._state
        })
        flowzModal.patch(this.$route.params.id, {processList: this.flowzdata.processList}).then(res => {
          this.$Notice.success({title: 'Succesfully Saved'})
          this.$router.push('/admin/flow')
          this.buttonLoading = false
        }).catch(e => {
          this.buttonLoading = false
          this.$Notice.error({title: 'Permissions Not saved'})
        })
      }
    },
    handleCancel () {
      this.$router.push('/admin/flow')
    },
    init (id) {
      this.tableLoading = true
      flowzModal.get(this.$route.params.id).then(res => {
        this.flowzdata = res.data
        schemaModal.get(res.data.schema).then(schemaRes => {
          this.schemaRes = schemaRes.data
          let sortedArray = _.sortBy(res.data.processList, [function (o) { return o.order }])
          for (let proc in sortedArray) {
            if (sortedArray[proc].type !== 'startevent' && sortedArray[proc].type !== 'endevent' && sortedArray[proc].type !== 'exclusivegateway') {
              let mdata = {
                state: sortedArray[proc].name || sortedArray[proc].id,
                _state: sortedArray[proc].id
              }
              for (let ent of schemaRes.data.entity) {
                if (sortedArray[proc].hasOwnProperty('permission') && sortedArray[proc].permission[ent.name] !== undefined) {
                  mdata[ent.name] = {
                    read: sortedArray[proc].permission[ent.name].read,
                    write: sortedArray[proc].permission[ent.name].write
                  }
                } else {
                  if (res.data.first === proc) {
                    mdata[ent.name] = {
                      read: true,
                      write: true
                    }
                  } else {
                    mdata[ent.name] = {
                      read: true,
                      write: false
                    }
                  }
                }
              }
              this.data.push(mdata)
            }
          }
          for (let ent of schemaRes.data.entity) {
            this.columns.push({
              title: ent.name,
              key: ent.name,
              width: 150,
              align: 'center',
              render: (h, params) => {
                return h('div', {
                  attrs: {
                    title: params.row.state
                  }
                }, [
                  h('Row', [
                    h('Col', {
                      props: {
                        span: 12
                      }
                    }, [
                      h('span', 'Read'),
                      h('br'),
                      h('Checkbox', {
                        props: {
                          value: params.row[ent.name].read
                        },
                        on: {
                          'on-change': (value) => {
                            if (value) {
                              this.data[params.index][ent.name].read = value
                            } else {
                              this.data[params.index][ent.name].read = value
                              this.data[params.index][ent.name].write = value
                            }
                          }
                        }
                      })
                    ]),
                    h('Col', {
                      props: {
                        span: 12
                      }
                    }, [
                      h('span', 'Write'),
                      h('br'),
                      h('Checkbox', {
                        props: {
                          value: params.row[ent.name].write
                        },
                        on: {
                          'on-change': (value) => {
                            if (value) {
                              this.data[params.index][ent.name].write = value
                              this.data[params.index][ent.name].read = value
                            } else {
                              this.data[params.index][ent.name].write = value
                            }
                          }
                        }
                      })
                    ])
                  ])
                ])
              }
            })
          }
          this.tableLoading = false
        }).catch(e => { // eslint-disable-line
          this.tableLoading = false
          this.$Notice.error({title: 'Schema Error'})
        })
      }).catch(err => { // eslint-disable-line
        this.tableLoading = false
        this.$Notice.error({title: 'Flowz Error'})
      })
    }
  }
}
</script>

